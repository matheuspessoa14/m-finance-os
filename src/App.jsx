import { useCallback, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { EntryModal } from "./components/EntryModal";
import { ConfirmDialog, OfflineBanner, ToastViewport } from "./components/Feedback";
import { DesktopSidebar, Header, MobileNav } from "./components/Layout";
import { useFinanceCollections } from "./hooks/useFinanceCollections";
import { usePwaInstall } from "./hooks/usePwaInstall";
import { useNetworkStatus } from "./hooks/useNetworkStatus";
import {
  addFinanceItem,
  deleteAccountAndData,
  deleteFinanceItem,
  updateFinanceItem,
} from "./services/financeService";
import {
  buildHistoryRows,
  calculateFinanceForMonth,
  filterMonthCollections,
  getInstallmentRow,
  isFirstRun,
  normalizeForm,
  paidMonthsFromLegacy,
} from "./utils/finance";
import { currentMonth } from "./utils/date";
import { exportMonthCsv } from "./utils/exportCsv";
import { Login, Splash } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { AllocationsPage, ExpensesPage, IncomePage, InstallmentsPage } from "./pages/ListPages";
import { HistoryPage } from "./pages/History";
import { AccountPage } from "./pages/Account";
import { PrivacyPage } from "./pages/Privacy";

function getItemName(type, item) {
  if (type === "rendas") return item.source || item.description || "esta renda";
  if (type === "parcelas") return item.name || "esta compra parcelada";
  if (type === "gastos") return item.description || item.category || "este gasto";
  return item.destination || item.type || "este aporte";
}

function getTypeLabel(type) {
  return {
    rendas: "Renda",
    parcelas: "Parcela",
    gastos: "Gasto",
    aportes: "Aporte",
  }[type] || "Registro";
}

export default function App() {
  const [user, setUser] = useState(undefined);
  const [page, setPage] = useState("dashboard");
  const [month, setMonth] = useState(currentMonth());
  const [modal, setModal] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [publicView, setPublicView] = useState("login");
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [pendingOperations, setPendingOperations] = useState(0);

  const online = useNetworkStatus();
  const pwa = usePwaInstall();
  const { data, loading, error } = useFinanceCollections(user?.uid);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  const pushToast = useCallback((message, type = "success") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    if (error) pushToast("Não foi possível carregar os dados do Firebase.", "error");
  }, [error, pushToast]);

  const monthCollections = useMemo(() => filterMonthCollections(data, month), [data, month]);
  const finance = useMemo(() => calculateFinanceForMonth(data, month), [data, month]);
  const historyRows = useMemo(() => buildHistoryRows(data), [data]);
  const firstRun = useMemo(() => isFirstRun(data), [data]);

  function openCreate(type) {
    setEditingItem(null);
    setModal(type);
  }

  function openEdit(type, item) {
    setEditingItem(item);
    setModal(type);
  }

  function closeModal() {
    setModal(null);
    setEditingItem(null);
  }

  async function saveEntry(type, values) {
    if (!user) return;

    if (!online) {
      const offlineError = new Error("Sem conexão.");
      offlineError.userMessage =
        "Você está sem internet. Seus dados continuam preenchidos; conecte-se para salvar.";
      throw offlineError;
    }

    const itemBeingEdited = editingItem;
    const isEditing = Boolean(itemBeingEdited?.id);
    const payload = normalizeForm(type, values, { isEditing });

    setPendingOperations((count) => count + 1);

    try {
      if (isEditing) {
        await updateFinanceItem(user.uid, type, itemBeingEdited.id, payload);
      } else {
        await addFinanceItem(user.uid, type, payload);
      }

      closeModal();
      pushToast(
        isEditing
          ? "Alterações salvas."
          : `${getTypeLabel(type)} adicionada com sucesso.`
      );
    } catch (saveError) {
      console.error("Erro ao salvar registro:", saveError);
      pushToast("Não foi possível sincronizar o registro com o Firebase.", "error");

      saveError.userMessage =
        "Não foi possível salvar agora. Seus dados continuam no formulário para você tentar novamente.";
      throw saveError;
    } finally {
      setPendingOperations((count) => Math.max(count - 1, 0));
    }
  }

  function requestDelete(type, item) {
    setConfirmState({
      kind: "delete-item",
      type,
      item,
      title: `Excluir ${getTypeLabel(type).toLowerCase()}?`,
      message: `“${getItemName(type, item)}” será removido permanentemente.`,
      confirmLabel: "Excluir",
    });
  }

  async function confirmDelete() {
    if (!confirmState || !user) return;

    if (confirmState.kind === "delete-account") {
      await performDeleteAccount();
      return;
    }

    if (!online) {
      pushToast("Conecte-se à internet para excluir este registro.", "info");
      return;
    }

    setConfirmBusy(true);
    setPendingOperations((count) => count + 1);
    try {
      await deleteFinanceItem(user.uid, confirmState.type, confirmState.item.id);
      pushToast("Registro excluído.");
      setConfirmState(null);
    } catch (deleteError) {
      console.error("Erro ao excluir:", deleteError);
      pushToast("Não foi possível excluir o registro.", "error");
    } finally {
      setConfirmBusy(false);
      setPendingOperations((count) => Math.max(count - 1, 0));
    }
  }

  async function toggleInstallmentPaid(item) {
    if (!user) return;

    if (!online) {
      pushToast("Conecte-se à internet para alterar o pagamento da parcela.", "info");
      return;
    }

    const row = getInstallmentRow(item, month);
    const paidMonths = paidMonthsFromLegacy(item);
    const nextPaidMonths = row.isPaid
      ? paidMonths.filter((key) => key !== month)
      : [...new Set([...paidMonths, month])].sort();

    setPendingOperations((count) => count + 1);

    try {
      await updateFinanceItem(user.uid, "parcelas", item.id, {
        paidMonths: nextPaidMonths,
        paidInstallments: nextPaidMonths.length,
      });
      pushToast(row.isPaid ? "Parcela marcada como pendente." : "Parcela marcada como paga.");
    } catch (paymentError) {
      console.error("Erro ao atualizar pagamento:", paymentError);
      pushToast("Não foi possível atualizar o pagamento da parcela.", "error");
    } finally {
      setPendingOperations((count) => Math.max(count - 1, 0));
    }
  }

  function exportData(targetMonth = month) {
    const result = exportMonthCsv(data, targetMonth);
    pushToast(result.rows ? `${result.rows} lançamento(s) exportado(s).` : "CSV exportado sem lançamentos neste mês.", "info");
  }

  function requestDeleteAccount() {
    setConfirmState({
      kind: "delete-account",
      title: "Excluir conta e todos os dados?",
      message: "Você precisará confirmar novamente sua conta Google. Rendas, gastos, parcelas e aportes serão apagados de forma permanente.",
      confirmLabel: "Excluir minha conta",
    });
  }

  async function performDeleteAccount() {
    if (!user) return;

    if (!online) {
      pushToast("Conecte-se à internet para excluir sua conta.", "info");
      return;
    }

    setConfirmBusy(true);
    setPendingOperations((count) => count + 1);

    try {
      await deleteAccountAndData(user);
      setConfirmState(null);
      pushToast("Conta excluída com sucesso.");
      setPage("dashboard");
      setPublicView("login");
    } catch (accountError) {
      console.error("Erro ao excluir conta:", accountError);
      if (accountError?.code === "auth/popup-closed-by-user" || accountError?.code === "auth/cancelled-popup-request") {
        pushToast("Exclusão cancelada. Nenhum dado foi apagado.", "info");
      } else {
        pushToast("Não foi possível excluir sua conta. Tente novamente.", "error");
      }
    } finally {
      setConfirmBusy(false);
      setPendingOperations((count) => Math.max(count - 1, 0));
    }
  }

  async function logout() {
    setMenuOpen(false);
    await signOut(auth);
    setPage("dashboard");
  }

  if (user === undefined) return <Splash />;

  if (!user) {
    if (publicView === "privacy") {
      return <PrivacyPage standalone onBack={() => setPublicView("login")} />;
    }
    return <Login onPrivacy={() => setPublicView("privacy")} />;
  }

  return (
    <div className="app-shell">
      <DesktopSidebar page={page} onPage={setPage} user={user} onLogout={logout} />

      <main className="app-main">
        <Header
          page={page}
          month={month}
          setMonth={setMonth}
          user={user}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          onPage={setPage}
          onExport={() => exportData(month)}
          onLogout={logout}
          online={online}
          syncing={pendingOperations > 0}
        />

        <OfflineBanner online={online} />

        {loading && <div className="content loading-strip">Sincronizando dados...</div>}

        {!loading && page === "dashboard" && (
          <Dashboard month={month} finance={finance} firstRun={firstRun} onOpen={openCreate} onPage={setPage} />
        )}

        {!loading && page === "rendas" && (
          <IncomePage
            items={monthCollections.rendas}
            onAdd={() => openCreate("rendas")}
            onEdit={(item) => openEdit("rendas", item)}
            onDelete={(item) => requestDelete("rendas", item)}
          />
        )}

        {!loading && page === "parcelas" && (
          <InstallmentsPage
            items={monthCollections.parcelas}
            month={month}
            onAdd={() => openCreate("parcelas")}
            onEdit={(item) => openEdit("parcelas", item)}
            onDelete={(item) => requestDelete("parcelas", item)}
            onTogglePaid={toggleInstallmentPaid}
          />
        )}

        {!loading && page === "gastos" && (
          <ExpensesPage
            items={monthCollections.gastos}
            onAdd={() => openCreate("gastos")}
            onEdit={(item) => openEdit("gastos", item)}
            onDelete={(item) => requestDelete("gastos", item)}
          />
        )}

        {!loading && page === "aportes" && (
          <AllocationsPage
            items={monthCollections.aportes}
            onAdd={() => openCreate("aportes")}
            onEdit={(item) => openEdit("aportes", item)}
            onDelete={(item) => requestDelete("aportes", item)}
          />
        )}

        {!loading && page === "historico" && <HistoryPage rows={historyRows} onExport={exportData} />}

        {!loading && page === "conta" && (
          <AccountPage
            user={user}
            month={month}
            onExport={exportData}
            onPrivacy={() => setPage("privacidade")}
            onLogout={logout}
            onDeleteAccount={requestDeleteAccount}
            pwa={pwa}
          />
        )}

        {!loading && page === "privacidade" && <PrivacyPage onBack={() => setPage("conta")} />}
      </main>

      {!modal && !confirmState && <MobileNav page={page} onPage={setPage} />}

      {modal && (
        <EntryModal
          type={modal}
          selectedMonth={month}
          initialValues={editingItem}
          onClose={closeModal}
          onSubmit={(values) => saveEntry(modal, values)}
          online={online}
          suggestions={{
            sources: [...new Set(data.rendas.map((item) => item.source).filter(Boolean))],
            categories: [...new Set([...data.gastos, ...data.parcelas].map((item) => item.category).filter(Boolean))],
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(confirmState)}
        title={confirmState?.title}
        message={confirmState?.message}
        confirmLabel={confirmState?.confirmLabel}
        busy={confirmBusy}
        onCancel={() => !confirmBusy && setConfirmState(null)}
        onConfirm={confirmDelete}
      />

      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";

import { onAuthStateChanged, signOut } from "firebase/auth";

import { auth } from "./firebase";

import { EntryModal } from "./components/EntryModal";

import {
  ConfirmDialog,
  OfflineBanner,
  ToastViewport,
} from "./components/Feedback";

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

import {
  AllocationsPage,
  ExpensesPage,
  IncomePage,
  InstallmentsPage,
} from "./pages/ListPages";

import { HistoryPage } from "./pages/History";

import { AccountPage } from "./pages/Account";

import { PrivacyPage } from "./pages/Privacy";

import { DEFAULT_EXPENSE_CATEGORIES } from "./config/categories";

function getItemName(type, item) {
  if (type === "rendas") return item.source || item.description || "esta renda";

  if (type === "parcelas") return item.name || "esta compra parcelada";

  if (type === "gastos")
    return item.category || item.description || "este gasto";

  return item.destination || item.type || "este aporte";
}

function getTypeLabel(type) {
  return (
    {
      rendas: "Renda",

      parcelas: "Parcela",

      gastos: "Gasto",

      aportes: "Aporte",
    }[type] || "Registro"
  );
}

function recurrenceEndKey(item) {
  const value = String(item?.recurrenceEnd || "").trim();

  if (/^\d{4}-\d{2}$/.test(value)) return value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value.slice(0, 7);

  return "";
}

function isManagedRecurrenceActive(item, referenceMonth) {
  if (!item?.recurring) return false;

  const end = recurrenceEndKey(item);

  // recurrenceEnd é inclusivo. Se termina neste mês,
  // já está encerrada para as próximas projeções.
  return !end || end > referenceMonth;
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

  const [minimumSplashElapsed, setMinimumSplashElapsed] = useState(false);

  const [expensePaymentBusyId, setExpensePaymentBusyId] = useState(null);

  const [incomeReceiptBusyId, setIncomeReceiptBusyId] = useState(null);

  const [incomeReorderBusyId, setIncomeReorderBusyId] = useState(null);

  const [expenseReorderBusyId, setExpenseReorderBusyId] = useState(null);

  const [installmentReorderBusyId, setInstallmentReorderBusyId] =
    useState(null);

  const [allocationReorderBusyId, setAllocationReorderBusyId] = useState(null);

  const online = useNetworkStatus();

  const pwa = usePwaInstall();

  const { data, loading, error } = useFinanceCollections(user?.uid);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMinimumSplashElapsed(true);
    }, 1300);

    return () => window.clearTimeout(timer);
  }, []);

  const pushToast = useCallback((message, type = "success", options = {}) => {
    const id = `${Date.now()}-${Math.random()}`;

    setToasts((current) => [
      ...current,
      {
        id,
        message,
        type,
        actionLabel: options.actionLabel,
        onAction: options.onAction,
        duration: options.duration,
      },
    ]);

    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const restoreFinanceItem = useCallback(
    async (type, id, patch, successMessage, errorMessage) => {
      if (!user || !id) return false;

      setPendingOperations((count) => count + 1);

      try {
        await updateFinanceItem(user.uid, type, id, patch);
        pushToast(successMessage, "info");
        return true;
      } catch (undoError) {
        console.error("Erro ao desfazer alteração:", undoError);
        pushToast(errorMessage, "error");
        return false;
      } finally {
        setPendingOperations((count) => Math.max(count - 1, 0));
      }
    },
    [pushToast, user],
  );

  useEffect(() => {
    if (error)
      pushToast("Não foi possível carregar os dados do Firebase.", "error");
  }, [error, pushToast]);

  const monthCollections = useMemo(
    () => filterMonthCollections(data, month),
    [data, month],
  );

  const finance = useMemo(
    () => calculateFinanceForMonth(data, month),
    [data, month],
  );

  const historyRows = useMemo(() => buildHistoryRows(data), [data]);

  const firstRun = useMemo(() => isFirstRun(data), [data]);

  const activeRecurrences = useMemo(() => {
    const referenceMonth = currentMonth();

    const byStartDate = (a, b) =>
      String(a?.recurrenceStartDate || a?.date || "").localeCompare(
        String(b?.recurrenceStartDate || b?.date || ""),
      );

    return {
      rendas: data.rendas
        .filter((item) => isManagedRecurrenceActive(item, referenceMonth))
        .sort(byStartDate),
      gastos: data.gastos
        .filter((item) => isManagedRecurrenceActive(item, referenceMonth))
        .sort(byStartDate),
    };
  }, [data.rendas, data.gastos]);

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
          : `${getTypeLabel(type)} adicionada com sucesso.`,
      );
    } catch (saveError) {
      console.error("Erro ao salvar registro:", saveError);

      pushToast(
        "Não foi possível sincronizar o registro com o Firebase.",
        "error",
      );

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

  function requestEndRecurrence(type, item) {
    if (!item?.id || !item?.recurring) return;

    setConfirmState({
      kind: "end-recurrence",
      type,
      item,
      endMonth: currentMonth(),
      previousRecurrenceEnd: item.recurrenceEnd || "",
      title: "Encerrar recorrência?",
      message: `“${getItemName(
        type,
        item,
      )}” continuará válida no mês atual e deixará de ser projetada nos próximos meses. O histórico anterior será mantido.`,
      confirmLabel: "Encerrar recorrência",
      danger: false,
    });
  }

  async function confirmDelete() {
    if (!confirmState || !user) return;

    if (confirmState.kind === "delete-account") {
      await performDeleteAccount();

      return;
    }

    if (confirmState.kind === "end-recurrence") {
      if (!online) {
        pushToast(
          "Conecte-se à internet para encerrar esta recorrência.",
          "info",
        );
        return;
      }

      setConfirmBusy(true);
      setPendingOperations((count) => count + 1);

      try {
        const {
          type,
          item,
          endMonth,
          previousRecurrenceEnd = "",
        } = confirmState;

        await updateFinanceItem(user.uid, type, item.id, {
          recurrenceEnd: endMonth || currentMonth(),
        });

        setConfirmState(null);

        pushToast("Recorrência encerrada para os próximos meses.", "success", {
          actionLabel: "Desfazer",
          duration: 7000,
          onAction: () =>
            restoreFinanceItem(
              type,
              item.id,
              { recurrenceEnd: previousRecurrenceEnd },
              "Recorrência reativada.",
              "Não foi possível reativar a recorrência.",
            ),
        });
      } catch (recurrenceError) {
        console.error("Erro ao encerrar recorrência:", recurrenceError);
        pushToast("Não foi possível encerrar a recorrência.", "error");
      } finally {
        setConfirmBusy(false);
        setPendingOperations((count) => Math.max(count - 1, 0));
      }

      return;
    }

    if (!online) {
      pushToast("Conecte-se à internet para excluir este registro.", "info");

      return;
    }

    setConfirmBusy(true);

    setPendingOperations((count) => count + 1);

    try {
      await deleteFinanceItem(
        user.uid,
        confirmState.type,
        confirmState.item.id,
      );

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
    if (!user || !item?.id) return;

    if (!online) {
      pushToast(
        "Conecte-se à internet para alterar o pagamento da parcela.",
        "info",
      );
      return;
    }

    const row = getInstallmentRow(item, month);
    const paidMonths = paidMonthsFromLegacy(item);
    const previousPaidMonths = [...paidMonths];
    const previousPaidInstallments = previousPaidMonths.length;

    const nextPaidMonths = row.isPaid
      ? paidMonths.filter((key) => key !== month)
      : [...new Set([...paidMonths, month])].sort();

    setPendingOperations((count) => count + 1);

    try {
      await updateFinanceItem(user.uid, "parcelas", item.id, {
        paidMonths: nextPaidMonths,
        paidInstallments: nextPaidMonths.length,
      });

      pushToast(
        row.isPaid
          ? "Parcela marcada como pendente."
          : "Parcela marcada como paga.",
        "success",
        {
          actionLabel: "Desfazer",
          duration: 7000,
          onAction: () =>
            restoreFinanceItem(
              "parcelas",
              item.id,
              {
                paidMonths: previousPaidMonths,
                paidInstallments: previousPaidInstallments,
              },
              "Alteração da parcela desfeita.",
              "Não foi possível desfazer a alteração da parcela.",
            ),
        },
      );
    } catch (paymentError) {
      console.error("Erro ao atualizar pagamento:", paymentError);
      pushToast("Não foi possível atualizar o pagamento da parcela.", "error");
    } finally {
      setPendingOperations((count) => Math.max(count - 1, 0));
    }
  }

  async function markIncomeReceived(item) {
    if (!user || !item?.id || item.status !== "Pendente") return;

    if (!online) {
      pushToast(
        "Conecte-se à internet para marcar a renda como recebida.",
        "info",
      );
      return;
    }

    if (incomeReceiptBusyId) return;

    const previousStatus = item.status;
    const previousReceivedMonths = Array.isArray(item.receivedMonths)
      ? [...new Set(item.receivedMonths.filter(Boolean))].sort()
      : [];

    setIncomeReceiptBusyId(item.id);
    setPendingOperations((count) => count + 1);

    try {
      if (item.recurring) {
        const nextReceivedMonths = [
          ...new Set([...previousReceivedMonths, month]),
        ].sort();

        await updateFinanceItem(user.uid, "rendas", item.id, {
          receivedMonths: nextReceivedMonths,
          status: "Recebida",
        });

        pushToast("Renda deste mês marcada como recebida.", "success", {
          actionLabel: "Desfazer",
          duration: 7000,
          onAction: () =>
            restoreFinanceItem(
              "rendas",
              item.id,
              {
                receivedMonths: previousReceivedMonths,
                status: previousStatus,
              },
              "Recebimento desfeito.",
              "Não foi possível desfazer o recebimento.",
            ),
        });
      } else {
        await updateFinanceItem(user.uid, "rendas", item.id, {
          status: "Recebida",
        });

        pushToast("Renda marcada como recebida.", "success", {
          actionLabel: "Desfazer",
          duration: 7000,
          onAction: () =>
            restoreFinanceItem(
              "rendas",
              item.id,
              { status: previousStatus },
              "Recebimento desfeito.",
              "Não foi possível desfazer o recebimento.",
            ),
        });
      }
    } catch (receiptError) {
      console.error("Erro ao marcar renda como recebida:", receiptError);
      pushToast("Não foi possível marcar a renda como recebida.", "error");
    } finally {
      setIncomeReceiptBusyId(null);
      setPendingOperations((count) => Math.max(count - 1, 0));
    }
  }

  async function reorderFinanceItem(
    type,

    item,

    sortOrder,

    busyId,

    setBusyId,

    label,
  ) {
    if (!user || !item?.id) return false;

    const nextSortOrder = Number(sortOrder);

    if (!Number.isFinite(nextSortOrder)) return false;

    if (!online) {
      pushToast(
        `Conecte-se à internet para salvar a nova ordem ${label}.`,

        "info",
      );

      return false;
    }

    if (busyId) return false;

    const currentSortOrder = Number(item.sortOrder);

    if (
      Number.isFinite(currentSortOrder) &&
      Math.abs(currentSortOrder - nextSortOrder) < 0.000001
    ) {
      return true;
    }

    setBusyId(item.id);

    setPendingOperations((count) => count + 1);

    try {
      await updateFinanceItem(user.uid, type, item.id, {
        sortOrder: nextSortOrder,
      });

      return true;
    } catch (reorderError) {
      console.error(`Erro ao reordenar ${type}:`, reorderError);

      pushToast(
        `Não foi possível salvar a nova ordem ${label}.`,

        "error",
      );

      return false;
    } finally {
      setBusyId(null);

      setPendingOperations((count) => Math.max(count - 1, 0));
    }
  }

  function reorderIncome(item, sortOrder) {
    return reorderFinanceItem(
      "rendas",

      item,

      sortOrder,

      incomeReorderBusyId,

      setIncomeReorderBusyId,

      "das rendas",
    );
  }

  function reorderExpense(item, sortOrder) {
    return reorderFinanceItem(
      "gastos",

      item,

      sortOrder,

      expenseReorderBusyId,

      setExpenseReorderBusyId,

      "dos gastos",
    );
  }

  function reorderInstallment(item, sortOrder) {
    return reorderFinanceItem(
      "parcelas",

      item,

      sortOrder,

      installmentReorderBusyId,

      setInstallmentReorderBusyId,

      "das parcelas",
    );
  }

  function reorderAllocation(item, sortOrder) {
    return reorderFinanceItem(
      "aportes",

      item,

      sortOrder,

      allocationReorderBusyId,

      setAllocationReorderBusyId,

      "dos aportes",
    );
  }

  async function markExpensePaid(item) {
    if (!user || !item?.id || item.status !== "Pendente") return;

    if (!online) {
      pushToast("Conecte-se à internet para marcar o gasto como pago.", "info");
      return;
    }

    if (expensePaymentBusyId) return;

    const previousStatus = item.status;
    const previousPaidMonths = Array.isArray(item.paidMonths)
      ? [...new Set(item.paidMonths.filter(Boolean))].sort()
      : [];

    setExpensePaymentBusyId(item.id);
    setPendingOperations((count) => count + 1);

    try {
      if (item.recurring) {
        const nextPaidMonths = [
          ...new Set([...previousPaidMonths, month]),
        ].sort();

        await updateFinanceItem(user.uid, "gastos", item.id, {
          paidMonths: nextPaidMonths,
          status: "Pago",
        });

        pushToast("Gasto deste mês marcado como pago.", "success", {
          actionLabel: "Desfazer",
          duration: 7000,
          onAction: () =>
            restoreFinanceItem(
              "gastos",
              item.id,
              {
                paidMonths: previousPaidMonths,
                status: previousStatus,
              },
              "Pagamento desfeito.",
              "Não foi possível desfazer o pagamento.",
            ),
        });
      } else {
        await updateFinanceItem(user.uid, "gastos", item.id, {
          status: "Pago",
        });

        pushToast("Gasto marcado como pago.", "success", {
          actionLabel: "Desfazer",
          duration: 7000,
          onAction: () =>
            restoreFinanceItem(
              "gastos",
              item.id,
              { status: previousStatus },
              "Pagamento desfeito.",
              "Não foi possível desfazer o pagamento.",
            ),
        });
      }
    } catch (paymentError) {
      console.error("Erro ao marcar gasto como pago:", paymentError);
      pushToast("Não foi possível marcar o gasto como pago.", "error");
    } finally {
      setExpensePaymentBusyId(null);
      setPendingOperations((count) => Math.max(count - 1, 0));
    }
  }

  function exportData(targetMonth = month) {
    const result = exportMonthCsv(data, targetMonth);

    pushToast(
      result.rows
        ? `${result.rows} lançamento(s) exportado(s).`
        : "CSV exportado sem lançamentos neste mês.",
      "info",
    );
  }

  function requestDeleteAccount() {
    setConfirmState({
      kind: "delete-account",

      title: "Excluir conta e todos os dados?",

      message:
        "Você precisará confirmar novamente sua conta Google. Rendas, gastos, parcelas e aportes serão apagados de forma permanente.",

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

      if (
        accountError?.code === "auth/popup-closed-by-user" ||
        accountError?.code === "auth/cancelled-popup-request"
      ) {
        pushToast("Exclusão cancelada. Nenhum dado foi apagado.", "info");
      } else {
        pushToast(
          "Não foi possível excluir sua conta. Tente novamente.",
          "error",
        );
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

  if (user === undefined || !minimumSplashElapsed) return <Splash />;

  if (!user) {
    if (publicView === "privacy") {
      return <PrivacyPage standalone onBack={() => setPublicView("login")} />;
    }

    return <Login onPrivacy={() => setPublicView("privacy")} />;
  }

  return (
    <div className="app-shell">
      <DesktopSidebar
        page={page}
        onPage={setPage}
        user={user}
        onLogout={logout}
      />

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

        {loading && (
          <div className="content loading-strip">Sincronizando dados...</div>
        )}

        {!loading && page === "dashboard" && (
          <Dashboard
            month={month}
            finance={finance}
            historyRows={historyRows}
            firstRun={firstRun}
            onOpen={openCreate}
            onPage={setPage}
          />
        )}

        {!loading && page === "rendas" && (
          <IncomePage
            items={monthCollections.rendas}
            onAdd={() => openCreate("rendas")}
            onEdit={(item) => openEdit("rendas", item)}
            onDelete={(item) => requestDelete("rendas", item)}
            onMarkReceived={markIncomeReceived}
            receiptBusyId={incomeReceiptBusyId}
            onReorder={reorderIncome}
            reorderBusyId={incomeReorderBusyId}
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
            onReorder={reorderInstallment}
            reorderBusyId={installmentReorderBusyId}
          />
        )}

        {!loading && page === "gastos" && (
          <ExpensesPage
            items={monthCollections.gastos}
            onAdd={() => openCreate("gastos")}
            onEdit={(item) => openEdit("gastos", item)}
            onDelete={(item) => requestDelete("gastos", item)}
            onMarkPaid={markExpensePaid}
            paymentBusyId={expensePaymentBusyId}
            onReorder={reorderExpense}
            reorderBusyId={expenseReorderBusyId}
          />
        )}

        {!loading && page === "aportes" && (
          <AllocationsPage
            items={monthCollections.aportes}
            onAdd={() => openCreate("aportes")}
            onEdit={(item) => openEdit("aportes", item)}
            onDelete={(item) => requestDelete("aportes", item)}
            onReorder={reorderAllocation}
            reorderBusyId={allocationReorderBusyId}
          />
        )}

        {!loading && page === "historico" && (
          <HistoryPage rows={historyRows} onExport={exportData} />
        )}

        {!loading && page === "conta" && (
          <AccountPage
            user={user}
            month={month}
            onExport={exportData}
            onPrivacy={() => setPage("privacidade")}
            onLogout={logout}
            onDeleteAccount={requestDeleteAccount}
            pwa={pwa}
            recurrences={activeRecurrences}
            onEndRecurrence={requestEndRecurrence}
          />
        )}

        {!loading && page === "privacidade" && (
          <PrivacyPage onBack={() => setPage("conta")} />
        )}
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
            sources: [
              ...new Set(
                data.rendas

                  .map((item) => item.source)

                  .filter(Boolean),
              ),
            ],

            categories: [
              ...new Set([
                ...DEFAULT_EXPENSE_CATEGORIES,

                ...data.gastos

                  .map((item) => item.category)

                  .filter(Boolean),

                ...data.parcelas

                  .map((item) => item.category)

                  .filter(Boolean),
              ]),
            ].sort((a, b) => a.localeCompare(b, "pt-BR")),
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(confirmState)}
        title={confirmState?.title}
        message={confirmState?.message}
        confirmLabel={confirmState?.confirmLabel}
        danger={confirmState?.danger ?? true}
        busy={confirmBusy}
        onCancel={() => !confirmBusy && setConfirmState(null)}
        onConfirm={confirmDelete}
      />

      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

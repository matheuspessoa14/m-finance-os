import { ArrowUpRight, CreditCard, PiggyBank, ReceiptText } from "lucide-react";
import { IncomeList, InstallmentList, ListPage, SimpleList } from "../components/FinanceUI";

export function IncomePage({
  items,
  onAdd,
  onEdit,
  onDelete,
  onMarkReceived,
  receiptBusyId,
}) {
  return (
    <ListPage
      title="Fontes de renda"
      subtitle="Acompanhe o que já entrou e o que ainda falta receber neste mês."
      button="Nova renda"
      icon={ArrowUpRight}
      onAdd={onAdd}
    >
      <IncomeList
        items={items}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
        onMarkReceived={onMarkReceived}
        receiptBusyId={receiptBusyId}
      />
    </ListPage>
  );
}

export function InstallmentsPage({
  items,
  month,
  onAdd,
  onEdit,
  onDelete,
  onTogglePaid,
}) {
  return (
    <ListPage
      title="Compras parceladas"
      subtitle="Veja o que vence neste mês, o que já foi pago e o progresso de cada compra."
      button="Nova compra"
      icon={CreditCard}
      onAdd={onAdd}
    >
      <InstallmentList
        items={items}
        selectedMonth={month}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
        onTogglePaid={onTogglePaid}
      />
    </ListPage>
  );
}

export function ExpensesPage({
  items,
  onAdd,
  onEdit,
  onDelete,
  onMarkPaid,
  paymentBusyId,
}) {
  return (
    <ListPage
      title="Gastos"
      subtitle="Aqui entram apenas os gastos que não são parcelas."
      button="Novo gasto"
      icon={ReceiptText}
      onAdd={onAdd}
    >
      <SimpleList
        type="gastos"
        items={items}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
        onMarkPaid={onMarkPaid}
        paymentBusyId={paymentBusyId}
      />
    </ListPage>
  );
}

export function AllocationsPage({ items, onAdd, onEdit, onDelete }) {
  return (
    <ListPage
      title="Reserva & investimentos"
      subtitle="Veja quanto você separou no mês e como esse dinheiro se divide entre reservas e investimentos."
      button="Novo aporte"
      icon={PiggyBank}
      onAdd={onAdd}
    >
      <SimpleList
        type="aportes"
        items={items}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </ListPage>
  );
}

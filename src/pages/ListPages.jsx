import { ArrowUpRight, CreditCard, PiggyBank, ReceiptText } from "lucide-react";
import { IncomeList, InstallmentList, ListPage, SimpleList } from "../components/FinanceUI";

export function IncomePage({
  items,
  onAdd,
  onEdit,
  onDelete,
  onMarkReceived,
  receiptBusyId,
  onReorder,
  reorderBusyId,
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
        onReorder={onReorder}
        reorderBusyId={reorderBusyId}
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
  onReorder,
  reorderBusyId,
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
        onReorder={onReorder}
        reorderBusyId={reorderBusyId}
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
  onReorder,
  reorderBusyId,
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
        onReorder={onReorder}
        reorderBusyId={reorderBusyId}
      />
    </ListPage>
  );
}

export function AllocationsPage({
  items,
  onAdd,
  onEdit,
  onDelete,
  onReorder,
  reorderBusyId,
}) {
  return (
    <ListPage
      title="Reserva & Investimentos"
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
        onReorder={onReorder}
        reorderBusyId={reorderBusyId}
      />
    </ListPage>
  );
}

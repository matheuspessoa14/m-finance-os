import { ArrowUpRight, CreditCard, PiggyBank, ReceiptText } from "lucide-react";
import { IncomeList, InstallmentList, ListPage, SimpleList } from "../components/FinanceUI";

export function IncomePage({ items, onAdd, onEdit, onDelete }) {
  return (
    <ListPage
      title="Fontes de renda"
      subtitle="Cadastre salário, estágio, freelance, venda, comissão ou qualquer outra entrada."
      button="Nova renda"
      icon={ArrowUpRight}
      onAdd={onAdd}
    >
      <IncomeList items={items} onAdd={onAdd} onEdit={onEdit} onDelete={onDelete} />
    </ListPage>
  );
}

export function InstallmentsPage({ items, month, onAdd, onEdit, onDelete, onTogglePaid }) {
  return (
    <ListPage
      title="Compras parceladas"
      subtitle="Cadastre uma vez e acompanhe automaticamente cada parcela e o mês em que ela foi paga."
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

export function ExpensesPage({ items, onAdd, onEdit, onDelete }) {
  return (
    <ListPage
      title="Gastos avulsos"
      subtitle="Aqui entram apenas os gastos que não são parcelas."
      button="Novo gasto"
      icon={ReceiptText}
      onAdd={onAdd}
    >
      <SimpleList type="gastos" items={items} onAdd={onAdd} onEdit={onEdit} onDelete={onDelete} />
    </ListPage>
  );
}

export function AllocationsPage({ items, onAdd, onEdit, onDelete }) {
  return (
    <ListPage
      title="Reserva & investimentos"
      subtitle="Registre o dinheiro que você decidiu separar para o futuro."
      button="Novo aporte"
      icon={PiggyBank}
      onAdd={onAdd}
    >
      <SimpleList type="aportes" items={items} onAdd={onAdd} onEdit={onEdit} onDelete={onDelete} />
    </ListPage>
  );
}

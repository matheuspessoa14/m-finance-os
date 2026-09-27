import {

  CircleCheckBig,

  Clock3,
  CreditCard,

  Pencil,

  Plus,
  PiggyBank,
  TrendingUp,

  Trash2,

} from "lucide-react";

import { BrandGlyph } from "./BrandGlyph";

import {

  capitalize,

  formatDate,

  monthLabel,

  parseMonth,

} from "../utils/date";

import { money } from "../utils/finance";



export function Kpi({ label, value, icon: Icon, tone = "" }) {

  return (

    <article className={`kpi ${tone}`}>

      <div className="kpi-icon">

        <Icon size={19} />

      </div>

      <span>{label}</span>

      <strong>{money.format(value || 0)}</strong>

    </article>

  );

}



export function Panel({ title, subtitle, action, children }) {

  return (

    <article className="panel">

      <div className="panel-header">

        <div>

          <h3>{title}</h3>

          <p>{subtitle}</p>

        </div>

        {action}

      </div>

      {children}

    </article>

  );

}



export function Metric({ label, value, warning, moneyValue }) {

  const normalized = moneyValue

    ? 0

    : Math.max(0, Math.min(value || 0, 1.2));



  return (

    <div className="metric">

      <div>

        <span>{label}</span>

        <strong>

          {moneyValue

            ? money.format(value || 0)

            : `${Math.round((value || 0) * 100)}%`}

        </strong>

      </div>



      {!moneyValue && (

        <div className="progress-track">

          <div

            className={

              warning && value > 0.6

                ? "progress-fill warning"

                : "progress-fill"

            }

            style={{

              width: `${Math.min(normalized * 100, 100)}%`,

            }}

          />

        </div>

      )}

    </div>

  );

}



export function ListPage({

  title,

  subtitle,

  button,

  icon: Icon,

  onAdd,

  children,

}) {

  return (

    <div className="content">

      <section className="page-heading">

        <div>

          <h1>{title}</h1>

          <p>{subtitle}</p>

        </div>



        <button

          className="primary-button"

          onClick={onAdd}

        >

          <Plus size={18} /> {button}

        </button>

      </section>



      <section className="data-card">

        <div className="data-card-icon">

          <Icon size={20} />

        </div>

        {children}

      </section>

    </div>

  );

}



export function EmptyState({

  title = "Nada por aqui ainda",

  text,

  action,

  onClick,

}) {

  return (

    <div className="empty-state empty-state-rich">

      <div className="empty-icon">

        <BrandGlyph size={24} />

      </div>



      <strong>{title}</strong>

      <p>{text}</p>



      {action && (

        <button

          type="button"

          className="ghost-button"

          onClick={onClick}

        >

          {action}

        </button>

      )}

    </div>

  );

}



function incomeStatusLabel(status) {

  if (status === "Pendente") return "A receber";

  return status || "";

}



function expenseStatusLabel(status) {

  if (status === "Pendente") return "A pagar";

  if (status === "Pago") return "Pago";

  return status || "";

}



function totalAmount(items) {

  return items.reduce(

    (total, item) => total + Number(item.amount || 0),

    0

  );

}



function byDateAscending(a, b) {

  return String(a.date || "").localeCompare(String(b.date || ""));

}



function byDateDescending(a, b) {

  return String(b.date || "").localeCompare(String(a.date || ""));

}



function countLabel(count, singular, plural) {

  return `${count} ${count === 1 ? singular : plural}`;

}



function IncomeRecord({
  item,
  onEdit,
  onDelete,
  onMarkReceived,
  receiptBusyId,
}) {
  const description = item.description?.trim();
  const isPending = item.status === "Pendente";

  const subtitle = [
    formatDate(item.date),
    item.type || "Renda",
    description,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Record
      key={item.id}
      title={
        item.source ||
        item.description ||
        "Renda"
      }
      subtitle={subtitle}
      value={Number(item.amount || 0)}
      positive
      badge={incomeStatusLabel(item.status)}
      badgeTone={isPending ? "receivable" : "received"}
      recordTone={isPending ? "income-pending" : "income-received"}
      quickActionLabel={
        isPending
          ? receiptBusyId === item.id
            ? "Salvando..."
            : "Marcar como recebida"
          : ""
      }
      quickActionBusy={receiptBusyId === item.id}
      quickActionClassName="income-receive-button"
      onQuickAction={
        isPending && onMarkReceived
          ? () => onMarkReceived(item)
          : undefined
      }
      onEdit={() => onEdit(item)}
      onDelete={() => onDelete(item)}
    />
  );
}

function IncomeSection({
  title,
  subtitle,
  total,
  items,
  icon: Icon,
  emptyText,
  tone,
  onEdit,
  onDelete,
  onMarkReceived,
  receiptBusyId,
}) {
  const stateClass = items.length
    ? "has-items"
    : "is-empty";

  return (
    <section
      className={`income-section income-section--${tone} ${stateClass}`}
    >
      <div className="income-section-header">
        <div>
          <div className="income-section-title">
            <span className="income-section-icon">
              <Icon size={17} />
            </span>
            <strong>{title}</strong>
          </div>

          <span className="income-section-subtitle">
            {subtitle}
          </span>
        </div>

        <strong className="income-section-total">
          {money.format(total)}
        </strong>
      </div>

      {items.length ? (
        <div className="records">
          {items.map((item) => (
            <IncomeRecord
              key={item.id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
              onMarkReceived={onMarkReceived}
              receiptBusyId={receiptBusyId}
            />
          ))}
        </div>
      ) : (
        <div className="income-empty-note">
          {emptyText}
        </div>
      )}
    </section>
  );
}

export function IncomeList({
  items,
  onEdit,
  onDelete,
  onAdd,
  onMarkReceived,
  receiptBusyId,
}) {
  if (!items.length) {
    return (
      <EmptyState
        title="Comece pela sua primeira renda"
        text="Adicione salário, estágio, freelance ou qualquer entrada deste mês."
        action="Adicionar renda"
        onClick={onAdd}
      />
    );
  }

  const pending = items
    .filter((item) => item.status === "Pendente")
    .sort(byDateAscending);

  const received = items
    .filter((item) => item.status !== "Pendente")
    .sort(byDateDescending);

  const pendingTotal = totalAmount(pending);
  const receivedTotal = totalAmount(received);

  return (
    <div className="income-overview">
      <div className="income-summary-grid">
        <article className="income-summary-card income-summary-card--received">
          <div className="income-summary-icon">
            <CircleCheckBig size={19} />
          </div>

          <span className="income-summary-label">
            Recebido neste mês
          </span>

          <strong className="income-summary-value">
            {money.format(receivedTotal)}
          </strong>

          <small>
            {received.length
              ? `${countLabel(
                  received.length,
                  "renda recebida",
                  "rendas recebidas"
                )}`
              : "Nenhuma renda recebida"}
          </small>
        </article>

        <article
          className={`income-summary-card income-summary-card--pending ${
            pending.length ? "has-pending" : "is-clear"
          }`}
        >
          <div className="income-summary-icon">
            <Clock3 size={19} />
          </div>

          <span className="income-summary-label">
            Ainda a receber
          </span>

          <strong className="income-summary-value">
            {money.format(pendingTotal)}
          </strong>

          <small>
            {pending.length
              ? `${countLabel(
                  pending.length,
                  "entrada pendente",
                  "entradas pendentes"
                )}`
              : "Nada pendente"}
          </small>
        </article>
      </div>

      <IncomeSection
        title="A receber"
        subtitle={
          pending.length
            ? `${countLabel(
                pending.length,
                "renda",
                "rendas"
              )} ainda por receber`
            : "Tudo recebido neste mês"
        }
        total={pendingTotal}
        items={pending}
        icon={Clock3}
        tone="pending"
        emptyText="Nenhuma renda pendente neste mês."
        onEdit={onEdit}
        onDelete={onDelete}
        onMarkReceived={onMarkReceived}
        receiptBusyId={receiptBusyId}
      />

      <IncomeSection
        title="Já recebidas"
        subtitle={
          received.length
            ? `${countLabel(
                received.length,
                "renda recebida",
                "rendas recebidas"
              )} neste mês`
            : "Nenhuma renda recebida ainda"
        }
        total={receivedTotal}
        items={received}
        icon={CircleCheckBig}
        tone="received"
        emptyText="Nenhuma renda marcada como recebida neste mês."
        onEdit={onEdit}
        onDelete={onDelete}
        onMarkReceived={onMarkReceived}
        receiptBusyId={receiptBusyId}
      />
    </div>
  );
}



function installmentMonthlyTotal(items) {
  return items.reduce(
    (total, item) => total + Number(item.monthly || 0),
    0
  );
}

function InstallmentRecord({
  item,
  selectedMonth,
  onEdit,
  onDelete,
  onTogglePaid,
}) {
  const count = Math.max(Number(item.installments || 0), 0);
  const paidCount = Math.min(
    Number(item.paidMonths?.length || 0),
    count
  );
  const remaining = Math.max(count - paidCount, 0);
  const progress =
    count > 0 ? Math.min((paidCount / count) * 100, 100) : 0;

  const monthName = capitalize(
    monthLabel.format(parseMonth(selectedMonth))
  );

  return (
    <div
      className={`installment-card ${
        item.isPaid
          ? "installment-card--paid"
          : "installment-card--pending"
      }`}
    >
      <div className="installment-card-main">
        <div className="installment-card-title-row">
          <div>
            <strong>{item.name || "Compra parcelada"}</strong>

            <div className="record-meta">
              <span>
                {item.category || "Sem categoria"} · parcela{" "}
                {item.installmentNumber || 1}/{count} em {monthName}
              </span>

              <span
                className={`status-badge ${
                  item.isPaid
                    ? "status-badge--paid"
                    : "status-badge--pending"
                }`}
              >
                {item.isPaid ? "PAGA" : "A PAGAR"}
              </span>
            </div>
          </div>

          <div className="installment-card-value">
            <strong>{money.format(item.monthly || 0)}</strong>
            <span>/ mês</span>
          </div>
        </div>

        <div className="installment-progress">
          <div className="installment-progress-copy">
            <span>
              {paidCount} de {count} pagas
            </span>
            <strong>
              {remaining > 0
                ? `${remaining} ${remaining === 1 ? "parcela restante" : "parcelas restantes"}`
                : "Compra concluída"}
            </strong>
          </div>

          <div
            className="installment-progress-track"
            aria-label={`${Math.round(progress)}% das parcelas pagas`}
          >
            <div
              className="installment-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="record-actions installment-card-actions">
        <button
          type="button"
          className={
            item.isPaid
              ? "small-button installment-toggle-button is-paid"
              : "small-button installment-toggle-button"
          }
          onClick={() => onTogglePaid(item)}
        >
          {item.isPaid ? "✓ Paga" : "Marcar como paga"}
        </button>

        <button
          className="icon-button edit"
          onClick={() => onEdit(item)}
          title="Editar"
          aria-label={`Editar ${item.name}`}
        >
          <Pencil size={17} />
        </button>

        <button
          className="icon-button danger"
          onClick={() => onDelete(item)}
          title="Excluir"
          aria-label={`Excluir ${item.name}`}
        >
          <Trash2 size={17} />
        </button>
      </div>
    </div>
  );
}

function InstallmentSection({
  title,
  subtitle,
  total,
  items,
  icon: Icon,
  tone,
  selectedMonth,
  onEdit,
  onDelete,
  onTogglePaid,
}) {
  return (
    <section
      className={`installment-section installment-section--${tone} ${
        items.length ? "has-items" : "is-empty"
      }`}
    >
      <div className="installment-section-header">
        <div>
          <div className="installment-section-title">
            <span className="installment-section-icon">
              <Icon size={17} />
            </span>
            <strong>{title}</strong>
          </div>

          <span className="installment-section-subtitle">
            {subtitle}
          </span>
        </div>

        <strong className="installment-section-total">
          {money.format(total)}
        </strong>
      </div>

      {items.length ? (
        <div className="installment-list">
          {items.map((item) => (
            <InstallmentRecord
              key={item.id}
              item={item}
              selectedMonth={selectedMonth}
              onEdit={onEdit}
              onDelete={onDelete}
              onTogglePaid={onTogglePaid}
            />
          ))}
        </div>
      ) : (
        <div className="installment-empty-note">
          {tone === "pending"
            ? "Nenhuma parcela pendente neste mês."
            : "Nenhuma parcela marcada como paga neste mês."}
        </div>
      )}
    </section>
  );
}

export function InstallmentList({
  items,
  selectedMonth,
  onEdit,
  onDelete,
  onTogglePaid,
  onAdd,
}) {
  if (!items.length) {
    return (
      <EmptyState
        title="Nenhuma parcela neste mês"
        text="Cadastre uma compra parcelada uma única vez e acompanhe mês a mês."
        action="Adicionar compra"
        onClick={onAdd}
      />
    );
  }

  const pending = items.filter((item) => !item.isPaid);
  const paid = items.filter((item) => item.isPaid);

  const monthTotal = installmentMonthlyTotal(items);
  const pendingTotal = installmentMonthlyTotal(pending);
  const paidTotal = installmentMonthlyTotal(paid);

  return (
    <div className="installment-overview">
      <div className="installment-summary-grid">
        <article className="installment-summary-card installment-summary-card--total">
          <div className="installment-summary-icon">
            <CreditCard size={19} />
          </div>

          <span className="installment-summary-label">
            Parcelas deste mês
          </span>

          <strong className="installment-summary-value">
            {money.format(monthTotal)}
          </strong>

          <small>
            {countLabel(
              items.length,
              "parcela ativa",
              "parcelas ativas"
            )}
          </small>
        </article>

        <article className="installment-summary-card installment-summary-card--paid">
          <div className="installment-summary-icon">
            <CircleCheckBig size={19} />
          </div>

          <span className="installment-summary-label">
            Já pago
          </span>

          <strong className="installment-summary-value">
            {money.format(paidTotal)}
          </strong>

          <small>
            {paid.length
              ? countLabel(
                  paid.length,
                  "parcela paga",
                  "parcelas pagas"
                )
              : "Nenhuma paga ainda"}
          </small>
        </article>

        <article
          className={`installment-summary-card installment-summary-card--pending ${
            pending.length ? "has-pending" : "is-clear"
          }`}
        >
          <div className="installment-summary-icon">
            <Clock3 size={19} />
          </div>

          <span className="installment-summary-label">
            Ainda a pagar
          </span>

          <strong className="installment-summary-value">
            {money.format(pendingTotal)}
          </strong>

          <small>
            {pending.length
              ? countLabel(
                  pending.length,
                  "parcela pendente",
                  "parcelas pendentes"
                )
              : "Tudo pago neste mês"}
          </small>
        </article>
      </div>

      <InstallmentSection
        title="Pendentes"
        subtitle={
          pending.length
            ? `${countLabel(
                pending.length,
                "parcela",
                "parcelas"
              )} ainda por pagar`
            : "Tudo pago neste mês"
        }
        total={pendingTotal}
        items={pending}
        icon={Clock3}
        tone="pending"
        selectedMonth={selectedMonth}
        onEdit={onEdit}
        onDelete={onDelete}
        onTogglePaid={onTogglePaid}
      />

      <InstallmentSection
        title="Já pagas"
        subtitle={
          paid.length
            ? `${countLabel(
                paid.length,
                "parcela concluída",
                "parcelas concluídas"
              )} neste mês`
            : "Nenhuma parcela paga ainda"
        }
        total={paidTotal}
        items={paid}
        icon={CircleCheckBig}
        tone="paid"
        selectedMonth={selectedMonth}
        onEdit={onEdit}
        onDelete={onDelete}
        onTogglePaid={onTogglePaid}
      />
    </div>
  );
}



function ExpenseRecord({
  item,
  onEdit,
  onDelete,
  onMarkPaid,
  paymentBusyId,
}) {
  const description = item.description?.trim();
  const isPending = item.status === "Pendente";

  const subtitle = [
    formatDate(item.date),
    description,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Record
      key={item.id}
      title={
        item.category ||
        item.description ||
        "Gasto"
      }
      subtitle={subtitle}
      value={Number(item.amount || 0)}
      badge={expenseStatusLabel(item.status)}
      badgeTone={isPending ? "pending" : "paid"}
      recordTone={isPending ? "pending" : "paid"}
      quickActionLabel={
        isPending
          ? paymentBusyId === item.id
            ? "Salvando..."
            : "Marcar como pago"
          : ""
      }
      quickActionBusy={paymentBusyId === item.id}
      onQuickAction={
        isPending && onMarkPaid
          ? () => onMarkPaid(item)
          : undefined
      }
      onEdit={() => onEdit(item)}
      onDelete={() => onDelete(item)}
    />
  );
}

function ExpenseSection({
  title,
  subtitle,
  total,
  items,
  icon: Icon,
  emptyText,
  tone,
  onEdit,
  onDelete,
  onMarkPaid,
  paymentBusyId,
}) {
  const stateClass = items.length
    ? "has-items"
    : "is-empty";

  return (
    <section
      className={`expense-section expense-section--${tone} ${stateClass}`}
    >
      <div className="expense-section-header">
        <div>
          <div className="expense-section-title">
            <span className="expense-section-icon">
              <Icon size={17} />
            </span>
            <strong>{title}</strong>
          </div>

          <span className="expense-section-subtitle">
            {subtitle}
          </span>
        </div>

        <strong className="expense-section-total">
          {money.format(total)}
        </strong>
      </div>

      {items.length ? (
        <div className="records">
          {items.map((item) => (
            <ExpenseRecord
              key={item.id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
              onMarkPaid={onMarkPaid}
              paymentBusyId={paymentBusyId}
            />
          ))}
        </div>
      ) : (
        <div className="expense-empty-note">
          {emptyText}
        </div>
      )}
    </section>
  );
}

function ExpenseList({
  items,
  onEdit,
  onDelete,
  onAdd,
  onMarkPaid,
  paymentBusyId,
}) {
  if (!items.length) {
    return (
      <EmptyState
        title="Nenhum gasto avulso"
        text="Registre aqui os gastos que não fazem parte de compras parceladas."
        action="Adicionar gasto"
        onClick={onAdd}
      />
    );
  }

  const pending = items
    .filter((item) => item.status === "Pendente")
    .sort(byDateAscending);

  const paid = items
    .filter((item) => item.status !== "Pendente")
    .sort(byDateDescending);

  const pendingTotal = totalAmount(pending);
  const paidTotal = totalAmount(paid);

  return (
    <div className="expense-overview">
      <div className="expense-summary-grid">
        <article className="expense-summary-card expense-summary-card--paid">
          <div className="expense-summary-icon">
            <CircleCheckBig size={19} />
          </div>

          <span className="expense-summary-label">
            Já gasto neste mês
          </span>

          <strong className="expense-summary-value">
            {money.format(paidTotal)}
          </strong>

          <small>
            {paid.length
              ? `${countLabel(
                  paid.length,
                  "gasto concluído",
                  "gastos concluídos"
                )}`
              : "Nenhum gasto pago"}
          </small>
        </article>

        <article
          className={`expense-summary-card expense-summary-card--pending ${
            pending.length ? "has-pending" : "is-clear"
          }`}
        >
          <div className="expense-summary-icon">
            <Clock3 size={19} />
          </div>

          <span className="expense-summary-label">
            Ainda a pagar
          </span>

          <strong className="expense-summary-value">
            {money.format(pendingTotal)}
          </strong>

          <small>
            {pending.length
              ? `${countLabel(
                  pending.length,
                  "pendência",
                  "pendências"
                )} no mês`
              : "Nenhuma pendência"}
          </small>
        </article>
      </div>

      <ExpenseSection
        title="Pendências"
        subtitle={
          pending.length
            ? `${countLabel(
                pending.length,
                "gasto",
                "gastos"
              )} ainda por pagar`
            : "Tudo pago neste mês"
        }
        total={pendingTotal}
        items={pending}
        icon={Clock3}
        tone="pending"
        emptyText="Nenhum gasto pendente neste mês."
        onEdit={onEdit}
        onDelete={onDelete}
        onMarkPaid={onMarkPaid}
        paymentBusyId={paymentBusyId}
      />

      <ExpenseSection
        title="Já pagos"
        subtitle={
          paid.length
            ? `${countLabel(
                paid.length,
                "gasto concluído",
                "gastos concluídos"
              )} neste mês`
            : "Nenhum gasto pago ainda"
        }
        total={paidTotal}
        items={paid}
        icon={CircleCheckBig}
        tone="paid"
        emptyText="Nenhum gasto marcado como pago neste mês."
        onEdit={onEdit}
        onDelete={onDelete}
        onMarkPaid={onMarkPaid}
        paymentBusyId={paymentBusyId}
      />
    </div>
  );
}

function AllocationRecord({
  item,
  onEdit,
  onDelete,
}) {
  const isInvestment = item.type === "Investimento";
  const description = item.destination?.trim();
  const legacyGoal = item.goal?.trim();

  const subtitle = [
    formatDate(item.date),
    legacyGoal,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Record
      key={item.id}
      title={
        description ||
        item.type ||
        "Aporte"
      }
      subtitle={subtitle}
      value={Number(item.amount || 0)}
      positive
      badge={isInvestment ? "INVESTIMENTO" : "RESERVA"}
      badgeTone={isInvestment ? "investment" : "reserve"}
      recordTone={
        isInvestment
          ? "allocation-investment"
          : "allocation-reserve"
      }
      onEdit={() => onEdit(item)}
      onDelete={() => onDelete(item)}
    />
  );
}

function AllocationSection({
  title,
  subtitle,
  total,
  items,
  icon: Icon,
  tone,
  emptyText,
  onEdit,
  onDelete,
}) {
  return (
    <section
      className={`allocation-section allocation-section--${tone} ${
        items.length ? "has-items" : "is-empty"
      }`}
    >
      <div className="allocation-section-header">
        <div>
          <div className="allocation-section-title">
            <span className="allocation-section-icon">
              <Icon size={17} />
            </span>
            <strong>{title}</strong>
          </div>

          <span className="allocation-section-subtitle">
            {subtitle}
          </span>
        </div>

        <strong className="allocation-section-total">
          {money.format(total)}
        </strong>
      </div>

      {items.length ? (
        <div className="records">
          {items.map((item) => (
            <AllocationRecord
              key={item.id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="allocation-empty-note">
          {emptyText}
        </div>
      )}
    </section>
  );
}

function AllocationList({
  items,
  onEdit,
  onDelete,
  onAdd,
}) {
  if (!items.length) {
    return (
      <EmptyState
        title="Comece a guardar para o futuro"
        text="Registre uma reserva ou investimento para acompanhar sua evolução."
        action="Adicionar aporte"
        onClick={onAdd}
      />
    );
  }

  const reserves = items
    .filter((item) => item.type === "Reserva")
    .sort(byDateDescending);

  const investments = items
    .filter((item) => item.type === "Investimento")
    .sort(byDateDescending);

  const total = totalAmount(items);
  const reserveTotal = totalAmount(reserves);
  const investmentTotal = totalAmount(investments);

  return (
    <div className="allocation-overview">
      <div className="allocation-summary-grid">
        <article className="allocation-summary-card allocation-summary-card--total">
          <div className="allocation-summary-icon">
            <PiggyBank size={19} />
          </div>

          <span className="allocation-summary-label">
            Separado neste mês
          </span>

          <strong className="allocation-summary-value">
            {money.format(total)}
          </strong>

          <small>
            {countLabel(
              items.length,
              "aporte realizado",
              "aportes realizados"
            )}
          </small>
        </article>

        <article className="allocation-summary-card allocation-summary-card--reserve">
          <div className="allocation-summary-icon">
            <PiggyBank size={19} />
          </div>

          <span className="allocation-summary-label">
            Reservas
          </span>

          <strong className="allocation-summary-value">
            {money.format(reserveTotal)}
          </strong>

          <small>
            {reserves.length
              ? countLabel(
                  reserves.length,
                  "aporte em reserva",
                  "aportes em reserva"
                )
              : "Nenhuma reserva no mês"}
          </small>
        </article>

        <article className="allocation-summary-card allocation-summary-card--investment">
          <div className="allocation-summary-icon">
            <TrendingUp size={19} />
          </div>

          <span className="allocation-summary-label">
            Investimentos
          </span>

          <strong className="allocation-summary-value">
            {money.format(investmentTotal)}
          </strong>

          <small>
            {investments.length
              ? countLabel(
                  investments.length,
                  "aporte investido",
                  "aportes investidos"
                )
              : "Nenhum investimento no mês"}
          </small>
        </article>
      </div>

      <AllocationSection
        title="Reservas"
        subtitle={
          reserves.length
            ? `${countLabel(
                reserves.length,
                "aporte",
                "aportes"
              )} para sua reserva`
            : "Nenhuma reserva neste mês"
        }
        total={reserveTotal}
        items={reserves}
        icon={PiggyBank}
        tone="reserve"
        emptyText="Nenhum valor separado como reserva neste mês."
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <AllocationSection
        title="Investimentos"
        subtitle={
          investments.length
            ? `${countLabel(
                investments.length,
                "aporte",
                "aportes"
              )} em investimentos`
            : "Nenhum investimento neste mês"
        }
        total={investmentTotal}
        items={investments}
        icon={TrendingUp}
        tone="investment"
        emptyText="Nenhum valor registrado como investimento neste mês."
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}

export function SimpleList({
  type,
  items,
  onEdit,
  onDelete,
  onAdd,
  onMarkPaid,
  paymentBusyId,
}) {
  if (type === "gastos") {
    return (
      <ExpenseList
        items={items}
        onEdit={onEdit}
        onDelete={onDelete}
        onAdd={onAdd}
        onMarkPaid={onMarkPaid}
        paymentBusyId={paymentBusyId}
      />
    );
  }

  if (type === "aportes") {
    return (
      <AllocationList
        items={items}
        onEdit={onEdit}
        onDelete={onDelete}
        onAdd={onAdd}
      />
    );
  }

  return null;
}



export function Record({
  title,
  subtitle,
  value,
  positive,
  badge,
  badgeTone,
  recordTone,
  quickActionLabel,
  quickActionBusy,
  quickActionClassName = "expense-pay-button",
  onQuickAction,
  onEdit,
  onDelete,
}) {
  const recordClassName = [
    "record",
    recordTone ? `record--${recordTone}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={recordClassName}>
      <div className="record-main">
        <strong>{title}</strong>

        <div className="record-meta">
          <span>{subtitle}</span>

          {badge && (
            <span
              className={`status-badge status-badge--${
                badgeTone || "neutral"
              }`}
            >
              {badge}
            </span>
          )}
        </div>
      </div>

      <div
        className={
          positive
            ? "record-value positive"
            : "record-value"
        }
      >
        <strong>
          {positive ? "+" : "-"}{" "}
          {money.format(value)}
        </strong>
      </div>

      <div className="record-actions">
        {onQuickAction && (
          <button
            type="button"
            className={`small-button ${quickActionClassName}`}
            onClick={onQuickAction}
            disabled={quickActionBusy}
          >
            {quickActionLabel}
          </button>
        )}

        <button
          className="icon-button edit"
          onClick={onEdit}
          title="Editar"
          aria-label={`Editar ${title}`}
        >
          <Pencil size={17} />
        </button>

        <button
          className="icon-button danger"
          onClick={onDelete}
          title="Excluir"
          aria-label={`Excluir ${title}`}
        >
          <Trash2 size={17} />
        </button>
      </div>
    </div>
  );
}

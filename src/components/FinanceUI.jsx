import { Pencil, Plus, Trash2 } from "lucide-react";
import { BrandGlyph } from "./BrandGlyph";
import { capitalize, currentMonth, formatDate, monthLabel, parseMonth } from "../utils/date";
import { money } from "../utils/finance";

export function Kpi({ label, value, icon: Icon, tone = "" }) {
  return (
    <article className={`kpi ${tone}`}>
      <div className="kpi-icon"><Icon size={19} /></div>
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
  const normalized = moneyValue ? 0 : Math.max(0, Math.min(value || 0, 1.2));
  return (
    <div className="metric">
      <div>
        <span>{label}</span>
        <strong>{moneyValue ? money.format(value || 0) : `${Math.round((value || 0) * 100)}%`}</strong>
      </div>
      {!moneyValue && (
        <div className="progress-track">
          <div className={warning && value > 0.6 ? "progress-fill warning" : "progress-fill"} style={{ width: `${Math.min(normalized * 100, 100)}%` }} />
        </div>
      )}
    </div>
  );
}

export function ListPage({ title, subtitle, button, icon: Icon, onAdd, children }) {
  return (
    <div className="content">
      <section className="page-heading">
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <button className="primary-button" onClick={onAdd}>
          <Plus size={18} /> {button}
        </button>
      </section>

      <section className="data-card">
        <div className="data-card-icon"><Icon size={20} /></div>
        {children}
      </section>
    </div>
  );
}

export function EmptyState({ title = "Nada por aqui ainda", text, action, onClick }) {
  return (
    <div className="empty-state empty-state-rich">
      <div className="empty-icon"><BrandGlyph size={24} /></div>
      <strong>{title}</strong>
      <p>{text}</p>
      {action && <button type="button" className="ghost-button" onClick={onClick}>{action}</button>}
    </div>
  );
}

export function IncomeList({ items, onEdit, onDelete, onAdd }) {
  if (!items.length) {
    return <EmptyState title="Comece pela sua primeira renda" text="Adicione salário, estágio, freelance ou qualquer entrada deste mês." action="Adicionar renda" onClick={onAdd} />;
  }

  return (
    <div className="records">
      {items.map((item) => (
        <Record
          key={item.id}
          title={item.source || item.description || "Renda"}
          subtitle={`${formatDate(item.date)} · ${item.type || "Renda"} · ${item.status || ""}`}
          value={Number(item.amount || 0)}
          positive
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item)}
        />
      ))}
    </div>
  );
}

export function InstallmentList({ items, selectedMonth, onEdit, onDelete, onTogglePaid, onAdd }) {
  if (!items.length) {
    return <EmptyState title="Nenhuma parcela neste mês" text="Cadastre uma compra parcelada uma única vez e acompanhe mês a mês." action="Adicionar compra" onClick={onAdd} />;
  }

  return (
    <div className="records">
      {items.map((item) => {
        const count = Number(item.installments || 0);
        const remaining = Math.max(count - Number(item.paidMonths?.length || 0), 0);

        return (
          <div className={`record installment-record ${item.isPaid ? "is-paid" : ""}`} key={item.id}>
            <div className="record-main">
              <strong>{item.name}</strong>
              <span>
                {item.category || "Sem categoria"} · parcela {item.installmentNumber || 1}/{count} em {capitalize(monthLabel.format(parseMonth(selectedMonth)))} · {item.isPaid ? "paga" : `faltam ${remaining}`}
              </span>
            </div>

            <div className="record-value">
              <strong>{money.format(item.monthly)}</strong>
              <span>/ mês</span>
            </div>

            <div className="record-actions">
              <button className={item.isPaid ? "small-button paid" : "small-button"} onClick={() => onTogglePaid(item)}>
                {item.isPaid ? "✓ Paga" : "Marcar paga"}
              </button>
              <button className="icon-button edit" onClick={() => onEdit(item)} title="Editar" aria-label={`Editar ${item.name}`}>
                <Pencil size={17} />
              </button>
              <button className="icon-button danger" onClick={() => onDelete(item)} title="Excluir" aria-label={`Excluir ${item.name}`}>
                <Trash2 size={17} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function SimpleList({ type, items, onEdit, onDelete, onAdd }) {
  if (!items.length) {
    const isExpense = type === "gastos";
    return (
      <EmptyState
        title={isExpense ? "Nenhum gasto avulso" : "Comece a guardar para o futuro"}
        text={isExpense ? "Registre aqui os gastos que não fazem parte de compras parceladas." : "Registre uma reserva ou investimento para acompanhar sua evolução."}
        action={isExpense ? "Adicionar gasto" : "Adicionar aporte"}
        onClick={onAdd}
      />
    );
  }

  return (
    <div className="records">
      {items.map((item) => (
        <Record
          key={item.id}
          title={type === "gastos" ? item.description || item.category || "Gasto" : item.destination || item.type || "Aporte"}
          subtitle={`${formatDate(item.date)} · ${type === "gastos" ? item.category || item.status || "" : item.type || ""}`}
          value={Number(item.amount || 0)}
          positive={type === "aportes"}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item)}
        />
      ))}
    </div>
  );
}

export function Record({ title, subtitle, value, positive, onEdit, onDelete }) {
  return (
    <div className="record">
      <div className="record-main">
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>

      <div className={positive ? "record-value positive" : "record-value"}>
        <strong>{positive ? "+" : "-"} {money.format(value)}</strong>
      </div>

      <div className="record-actions">
        <button className="icon-button edit" onClick={onEdit} title="Editar" aria-label={`Editar ${title}`}><Pencil size={17} /></button>
        <button className="icon-button danger" onClick={onDelete} title="Excluir" aria-label={`Excluir ${title}`}><Trash2 size={17} /></button>
      </div>
    </div>
  );
}

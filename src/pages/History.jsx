import { Download, History as HistoryIcon } from "lucide-react";
import { capitalize, monthLabel, parseMonth } from "../utils/date";
import { money } from "../utils/finance";

export function HistoryPage({ rows, onExport }) {
  return (
    <div className="content">
      <section className="page-heading history-heading">
        <div>
          <span className="eyebrow">VISÃO DE LONGO PRAZO</span>
          <h1>Histórico mensal</h1>
          <p>Compare renda, compromissos, valores guardados e saldo final ao longo dos meses.</p>
        </div>
      </section>

      <section className="history-list">
        {rows.map((row) => (
          <article className="history-card" key={row.month}>
            <div className="history-card-title">
              <span className="history-icon"><HistoryIcon size={18} /></span>
              <div>
                <strong>{capitalize(monthLabel.format(parseMonth(row.month)))}</strong>
                <span>{row.installmentRows.length} parcela(s) ativa(s)</span>
              </div>
              <button type="button" className="icon-button" onClick={() => onExport(row.month)} title="Exportar mês" aria-label="Exportar mês">
                <Download size={17} />
              </button>
            </div>

            <div className="history-metrics">
              <div><span>Renda</span><strong className="positive">{money.format(row.receivedTotal)}</strong></div>
              <div><span>Gastos</span><strong>{money.format(row.expensesTotal + row.installmentsTotal)}</strong></div>
              <div><span>Guardado</span><strong className="positive">{money.format(row.allocationsTotal)}</strong></div>
              <div><span>Saldo</span><strong className={row.finalBalance < 0 ? "negative-text" : "positive"}>{money.format(row.finalBalance)}</strong></div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

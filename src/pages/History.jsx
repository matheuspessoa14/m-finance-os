import {
  CalendarDays,
  CircleDollarSign,
  Download,
  PiggyBank,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { capitalize, monthLabel, parseMonth } from "../utils/date";
import { money } from "../utils/finance";

function monthName(month) {
  return capitalize(monthLabel.format(parseMonth(month)));
}

function shortMonth(month) {
  return capitalize(
    new Intl.DateTimeFormat("pt-BR", {
      month: "short",
    })
      .format(parseMonth(month))
      .replace(".", "")
  );
}

function pendingExpenses(row) {
  return Number(row.pendingExpensesTotal || 0);
}

function commitments(row) {
  return (
    Number(row.expensesTotal || 0) +
    pendingExpenses(row) +
    Number(row.installmentsTotal || 0)
  );
}

function freeBalance(row) {
  return Number(row.finalBalance || 0) - pendingExpenses(row);
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  helper,
  tone = "neutral",
  moneyValue = true,
}) {
  return (
    <article className={`history-summary-card history-summary-card--${tone}`}>
      <span className="history-summary-icon">
        <Icon size={18} />
      </span>

      <div>
        <small>{label}</small>
        <strong>
          {moneyValue ? money.format(value || 0) : value}
        </strong>
        <span>{helper}</span>
      </div>
    </article>
  );
}

export function HistoryPage({ rows, onExport }) {
  const safeRows = Array.isArray(rows) ? rows : [];

  const chartRows = safeRows
    .slice()
    .reverse()
    .map((row) => ({
      month: shortMonth(row.month),
      value: freeBalance(row),
    }));

  const totalSaved = safeRows.reduce(
    (total, row) => total + Number(row.allocationsTotal || 0),
    0
  );

  const averageFree =
    safeRows.length > 0
      ? safeRows.reduce(
          (total, row) => total + freeBalance(row),
          0
        ) / safeRows.length
      : 0;

  const positiveMonths = safeRows.filter(
    (row) => freeBalance(row) >= 0
  ).length;

  return (
    <div className="content history-page-modern">
      <section className="history-modern-heading">
        <div>
          <span className="eyebrow">VISÃO DE LONGO PRAZO</span>
          <h1>Histórico mensal</h1>
          <p>
            Veja como sua renda, seus compromissos e o dinheiro
            guardado evoluíram ao longo do tempo.
          </p>
        </div>
      </section>

      <section className="history-summary-grid">
        <SummaryCard
          icon={WalletCards}
          label="Saldo livre médio"
          value={averageFree}
          helper="Média dos meses registrados"
          tone={averageFree < 0 ? "warning" : "positive"}
        />

        <SummaryCard
          icon={PiggyBank}
          label="Total guardado"
          value={totalSaved}
          helper="Reservas e investimentos no histórico"
          tone="saving"
        />

        <SummaryCard
          icon={CalendarDays}
          label="Meses registrados"
          value={safeRows.length}
          helper={`${positiveMonths} com saldo livre positivo`}
          tone="neutral"
          moneyValue={false}
        />
      </section>

      <section className="history-trend-card">
        <div className="history-trend-heading">
          <div>
            <span className="history-trend-icon">
              <TrendingUp size={18} />
            </span>

            <div>
              <h2>Evolução do saldo livre</h2>
              <p>
                O que sobrou em cada mês depois dos compromissos
                e valores reservados.
              </p>
            </div>
          </div>
        </div>

        {chartRows.length ? (
          <div className="history-chart-wrap">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart
                data={chartRows}
                margin={{
                  top: 15,
                  right: 10,
                  left: 0,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id="historyAreaGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#2fa77b"
                      stopOpacity={0.26}
                    />
                    <stop
                      offset="100%"
                      stopColor="#2fa77b"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 4"
                  stroke="#e7eeea"
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#77837f",
                    fontSize: 10,
                  }}
                />

                <YAxis hide />

                <Tooltip
                  formatter={(value) => money.format(value)}
                />

                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#238c67"
                  strokeWidth={2.5}
                  fill="url(#historyAreaGradient)"
                  dot={{
                    r: 3.5,
                    fill: "#238c67",
                    strokeWidth: 0,
                  }}
                  activeDot={{
                    r: 5,
                    fill: "#176f51",
                    strokeWidth: 0,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="history-empty-modern">
            Seu histórico aparecerá aqui conforme os meses forem
            sendo registrados.
          </div>
        )}
      </section>

      <section className="history-months-section">
        <div className="history-months-heading">
          <div>
            <h2>Meses</h2>
            <p>
              Cada card mostra o que entrou, saiu, foi guardado e
              continuou livre.
            </p>
          </div>

          <span>{safeRows.length} período(s)</span>
        </div>

        <div className="history-modern-list">
          {safeRows.map((row) => {
            const free = freeBalance(row);
            const outgoing = commitments(row);
            const pending = pendingExpenses(row);

            return (
              <article
                className={`history-modern-card ${
                  free < 0
                    ? "history-modern-card--negative"
                    : "history-modern-card--positive"
                }`}
                key={row.month}
              >
                <div className="history-modern-card-top">
                  <div className="history-modern-month">
                    <span className="history-modern-month-icon">
                      <CircleDollarSign size={18} />
                    </span>

                    <div>
                      <strong>{monthName(row.month)}</strong>
                      <span>
                        {row.installmentRows.length} parcela(s)
                        ativa(s)
                        {pending > 0
                          ? ` · ${money.format(
                              pending
                            )} em gastos pendentes`
                          : ""}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="history-export-button"
                    onClick={() => onExport(row.month)}
                    title="Exportar mês"
                    aria-label={`Exportar ${monthName(row.month)}`}
                  >
                    <Download size={16} />
                    <span>CSV</span>
                  </button>
                </div>

                <div className="history-modern-metrics">
                  <div>
                    <span>Recebido</span>
                    <strong className="history-value-positive">
                      {money.format(row.receivedTotal)}
                    </strong>
                  </div>

                  <div>
                    <span>Compromissos</span>
                    <strong>
                      {money.format(outgoing)}
                    </strong>
                  </div>

                  <div>
                    <span>Guardado</span>
                    <strong className="history-value-saving">
                      {money.format(row.allocationsTotal)}
                    </strong>
                  </div>

                  <div className="history-modern-free">
                    <span>Saldo livre</span>
                    <strong
                      className={
                        free < 0
                          ? "history-value-negative"
                          : "history-value-positive"
                      }
                    >
                      {money.format(free)}
                    </strong>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

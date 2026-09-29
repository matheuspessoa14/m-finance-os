import {
  ArrowRight,
  CircleCheckBig,
  Clock3,
  Lightbulb,
  PiggyBank,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BRAND } from "../config/brand";
import { capitalize, monthLabel, parseMonth } from "../utils/date";
import { money } from "../utils/finance";
import { EmptyState } from "../components/FinanceUI";
const DISTRIBUTION_COLORS = ["#24a779", "#e6aa3a", "#607be5"];
function sumInstallments(items, paid) {
  return (items || [])
    .filter((item) => Boolean(item.isPaid) === paid)
    .reduce((total, item) => total + Number(item.monthly || 0), 0);
}
function percentage(value, total) {
  if (!total || total <= 0) return 0;
  return Math.max(0, (Number(value || 0) / total) * 100);
}
function compactPercent(value) {
  return `${value.toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
    minimumFractionDigits: value > 0 && value < 10 ? 1 : 0,
  })}%`;
}
function shortMonth(month) {
  if (!month) return "";
  return capitalize(
    new Intl.DateTimeFormat("pt-BR", {
      month: "short",
    })
      .format(parseMonth(month))
      .replace(".", "")
  );
}
function SummaryMetric({
  icon: Icon,
  label,
  value,
  tone,
  onClick,
}) {
  const Tag = onClick ? "button" : "article";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      className={`final-dashboard-metric final-dashboard-metric--${tone} ${
        onClick ? "is-clickable" : ""
      }`}
      onClick={onClick}
    >
      <span className="final-dashboard-metric-icon">
        <Icon size={19} />
      </span>
      <span className="final-dashboard-metric-copy">
        <small>{label}</small>
        <strong>{money.format(value || 0)}</strong>
      </span>
      {onClick && (
        <ArrowRight
          className="final-dashboard-metric-arrow"
          size={15}
          aria-hidden="true"
        />
      )}
    </Tag>
  );
}
function ChartCard({
  title,
  subtitle,
  children,
  className = "",
}) {
  return (
    <article className={`final-dashboard-chart-card ${className}`}>
      <div className="final-dashboard-card-heading">
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      {children}
    </article>
  );
}
export function Dashboard({
  month,
  finance,
  historyRows = [],
  firstRun,
  onOpen,
  onPage,
}) {
  const paidInstallmentsTotal = sumInstallments(
    finance.installmentRows,
    true
  );
  const pendingInstallmentsTotal = sumInstallments(
    finance.installmentRows,
    false
  );
  const pendingExpensesTotal = Number(
    finance.pendingExpensesTotal || 0
  );
  const receivedTotal = Number(finance.receivedTotal || 0);
  const pendingIncome = Number(finance.pendingTotal || 0);
  const allocationsTotal = Number(finance.allocationsTotal || 0);

  /*
   * availableNow e monthForecast vêm do cálculo financeiro central.
   * Os fallbacks mantêm o Dashboard compatível caso algum snapshot
   * antigo ainda não tenha esses campos.
   */
  const availableNow = Number.isFinite(Number(finance.availableNow))
    ? Number(finance.availableNow)
    : Number(finance.finalBalance || 0) - pendingExpensesTotal;

  const monthForecast = Number.isFinite(Number(finance.monthForecast))
    ? Number(finance.monthForecast)
    : availableNow + pendingIncome;

  const stillToPay =
    pendingExpensesTotal + pendingInstallmentsTotal;
  const committedOutflow =
    Number(finance.expensesTotal || 0) +
    pendingExpensesTotal +
    Number(finance.installmentsTotal || 0);
  const monthName = capitalize(
    monthLabel.format(parseMonth(month))
  );
  const distributionData = [
    {
      name: "Disponível agora",
      value: Math.max(availableNow, 0),
    },
    {
      name: "A pagar",
      value: Math.max(stillToPay, 0),
    },
    {
      name: "Guardado / investido",
      value: Math.max(allocationsTotal, 0),
    },
  ].filter((item) => item.value > 0);
  const distributionTotal = distributionData.reduce(
    (total, item) => total + item.value,
    0
  );
  const comparisonData = [
    {
      name: "Rendas",
      value: receivedTotal,
      fill: "#2fa77b",
    },
    {
      name: "Saídas",
      value: committedOutflow,
      fill: "#e7ad42",
    },
  ];
  const historySeries = (historyRows || [])
    .slice(0, 6)
    .reverse()
    .map((row) => ({
      month: shortMonth(row.month),
      value: Number.isFinite(Number(row.availableNow))
        ? Number(row.availableNow)
        : Number(row.finalBalance || 0) -
          Number(row.pendingExpensesTotal || 0),
    }));
  if (
    !historySeries.length ||
    historySeries[historySeries.length - 1]?.month !== shortMonth(month)
  ) {
    historySeries.push({
      month: shortMonth(month),
      value: availableNow,
    });
  }
  const availableRatio =
    receivedTotal > 0 ? (availableNow / receivedTotal) * 100 : 0;
  const primaryInsight =
    receivedTotal <= 0 && pendingIncome <= 0
      ? {
          tone: "neutral",
          icon: TrendingUp,
          title: "Seu resumo começa pelas rendas",
          text: "Registre uma entrada para acompanhar quanto fica disponível ao longo do mês.",
        }
      : receivedTotal <= 0 && pendingIncome > 0
      ? {
          tone: "attention",
          icon: Clock3,
          title: "Há renda prevista para entrar",
          text: `Você ainda não recebeu entradas neste mês. Se receber as pendências, a previsão fica em ${money.format(
            monthForecast
          )}.`,
        }
      : availableNow < 0 && monthForecast >= 0
      ? {
          tone: "attention",
          icon: TrendingUp,
          title: "A previsão do mês volta ao positivo",
          text: `Hoje faltam ${money.format(
            Math.abs(availableNow)
          )}, mas após receber as pendências a previsão fica em ${money.format(
            monthForecast
          )}.`,
        }
      : monthForecast < 0
      ? {
          tone: "warning",
          icon: Lightbulb,
          title: "A previsão do mês precisa de atenção",
          text: `Mesmo após receber as rendas pendentes, ainda faltariam ${money.format(
            Math.abs(monthForecast)
          )} para cobrir os compromissos registrados.`,
        }
      : availableNow < 0
      ? {
          tone: "warning",
          icon: Lightbulb,
          title: "Seu disponível agora precisa de atenção",
          text: `Hoje faltam ${money.format(
            Math.abs(availableNow)
          )} para cobrir todos os compromissos registrados.`,
        }
      : {
          tone: "positive",
          icon: TrendingUp,
          title: "Seu mês está com espaço",
          text: `Depois dos compromissos e valores reservados, ${compactPercent(
            Math.max(availableRatio, 0)
          )} da renda recebida continua disponível.`,
        };
  const secondaryInsight =
    stillToPay > 0
      ? {
          tone: "attention",
          icon: Lightbulb,
          title: "Atenção para os próximos dias",
          text: `Você ainda tem ${money.format(
            stillToPay
          )} em compromissos pendentes neste mês.`,
        }
      : {
          tone: "positive",
          icon: CircleCheckBig,
          title: "Compromissos do mês em dia",
          text: "Não há pagamentos pendentes registrados para este período.",
        };
  return (
    <div className="content final-dashboard">
      <section className="final-dashboard-intro">
        <span className="eyebrow">
          {BRAND.systemLabel} · {monthName}
        </span>
        <h1>Resumo</h1>
        <p>Seu dinheiro, de forma simples e clara sem papel e caneta!</p>
      </section>
      <section className="final-dashboard-hero">
        <div className="final-dashboard-hero-main">
          <div className="final-dashboard-hero-label">
            <span />
            Disponível agora
          </div>
          <strong className="final-dashboard-free-value">
            {money.format(availableNow)}
          </strong>
          <p>
            Considera apenas o que já entrou, reservando todos os compromissos
            e valores separados neste mês.
          </p>

          <div
            className="final-dashboard-comparison-values"
            style={{ marginTop: 18, maxWidth: 430 }}
            aria-label="Previsão financeira do mês"
          >
            <span>
              <small>Previsão do mês</small>
              <strong>{money.format(monthForecast)}</strong>
            </span>
            <span>
              <small>Ainda a receber</small>
              <strong>{money.format(pendingIncome)}</strong>
            </span>
          </div>

          <button
            type="button"
            className="final-dashboard-details-button"
            onClick={() => onPage("historico")}
          >
            Ver detalhes <ArrowRight size={17} />
          </button>
          <div
            className="final-dashboard-wallet"
            aria-hidden="true"
          >
            <WalletCards size={31} />
          </div>
        </div>
        <div className="final-dashboard-metrics">
          <SummaryMetric
            icon={CircleCheckBig}
            label="Recebido até agora"
            value={receivedTotal}
            tone="income"
            onClick={() => onPage("rendas")}
          />
          <SummaryMetric
            icon={Clock3}
            label="Ainda a pagar"
            value={stillToPay}
            tone="pending"
            onClick={() => onPage("gastos")}
          />
          <SummaryMetric
            icon={PiggyBank}
            label="Guardado / investido"
            value={allocationsTotal}
            tone="saving"
            onClick={() => onPage("aportes")}
          />
        </div>
      </section>
      {firstRun && (
        <section className="final-dashboard-first-run">
          <div>
            <span className="eyebrow">PRIMEIROS PASSOS</span>
            <h2>Seu painel começa com três registros.</h2>
            <p>
              Adicione uma renda, seus compromissos e o que deseja
              separar para o futuro.
            </p>
          </div>
          <div>
            <button
              className="primary-button"
              onClick={() => onOpen("rendas")}
            >
              Adicionar renda
            </button>
            <button
              className="secondary-button"
              onClick={() => onOpen("gastos")}
            >
              Registrar gasto
            </button>
          </div>
        </section>
      )}
      <section className="final-dashboard-section">
        <div className="final-dashboard-section-heading">
          <div>
            <h2>Visão do mês</h2>
            <p>
              Entenda como seu dinheiro se move em {monthName}.
            </p>
          </div>
          <span>{monthName}</span>
        </div>
        <div className="final-dashboard-charts">
          <ChartCard
            title="Distribuição do dinheiro"
            subtitle="O que continua livre, reservado ou pendente."
            className="final-dashboard-chart-card--distribution"
          >
            {distributionData.length ? (
              <div className="final-dashboard-distribution">
                <div className="final-dashboard-donut">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={distributionData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={63}
                        outerRadius={88}
                        paddingAngle={2}
                        stroke="transparent"
                      >
                        {distributionData.map((_, index) => (
                          <Cell
                            key={index}
                            fill={
                              DISTRIBUTION_COLORS[
                                index % DISTRIBUTION_COLORS.length
                              ]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => money.format(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="final-dashboard-donut-center">
                    <strong>{money.format(distributionTotal)}</strong>
                    <span>disponível + reservado</span>
                  </div>
                </div>
                <div className="final-dashboard-legend">
                  {distributionData.map((item, index) => (
                    <div key={item.name}>
                      <i
                        style={{
                          background:
                            DISTRIBUTION_COLORS[
                              index % DISTRIBUTION_COLORS.length
                            ],
                        }}
                      />
                      <span>{item.name}</span>
                      <strong>{money.format(item.value)}</strong>
                      <small>
                        {compactPercent(
                          percentage(item.value, distributionTotal)
                        )}
                      </small>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                title="Sua distribuição aparecerá aqui"
                text="Registre movimentações para acompanhar o mês."
              />
            )}
          </ChartCard>
          <ChartCard
            title="Renda vs Saídas"
            subtitle="Renda recebida comparada aos compromissos do mês."
          >
            <div className="final-dashboard-bar-chart">
              <ResponsiveContainer width="100%" height={225}>
                <BarChart
                  data={comparisonData}
                  margin={{
                    top: 22,
                    right: 8,
                    left: 8,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 4"
                    stroke="#e7eeea"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#77837f", fontSize: 11 }}
                  />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: "rgba(47, 143, 107, 0.04)" }}
                    formatter={(value) => money.format(value)}
                  />
                  <Bar
                    dataKey="value"
                    radius={[9, 9, 0, 0]}
                    maxBarSize={92}
                  >
                    {comparisonData.map((item) => (
                      <Cell key={item.name} fill={item.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="final-dashboard-comparison-values">
              <span>
                <small>Rendas</small>
                <strong>{money.format(receivedTotal)}</strong>
              </span>
              <span>
                <small>Saídas</small>
                <strong>{money.format(committedOutflow)}</strong>
              </span>
            </div>
          </ChartCard>
          <ChartCard
            title="Evolução do saldo livre"
            subtitle="Os últimos meses vistos pela mesma lógica do resumo."
            className="final-dashboard-chart-card--history"
          >
            {historySeries.length ? (
              <div className="final-dashboard-history-chart">
                <ResponsiveContainer width="100%" height={225}>
                  <AreaChart
                    data={historySeries}
                    margin={{
                      top: 15,
                      right: 8,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="finalDashboardArea"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#2fa77b"
                          stopOpacity={0.28}
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
                      tick={{ fill: "#77837f", fontSize: 10 }}
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
                      fill="url(#finalDashboardArea)"
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
              <EmptyState
                title="A evolução começa com o próximo mês"
                text="Com mais períodos, você verá a tendência do saldo livre."
              />
            )}
          </ChartCard>
        </div>
      </section>
      <section className="final-dashboard-section final-dashboard-reading">
        <div className="final-dashboard-section-heading">
          <div>
            <h2>Leitura do mês</h2>
            <p>Dois sinais importantes para você acompanhar.</p>
          </div>
        </div>
        <div className="final-dashboard-insights">
          {[primaryInsight, secondaryInsight].map(
            ({ tone, icon: Icon, title, text }, index) => (
              <article
                key={`${tone}-${index}`}
                className={`final-dashboard-insight final-dashboard-insight--${tone}`}
              >
                <span className="final-dashboard-insight-icon">
                  <Icon size={21} />
                </span>
                <div>
                  <strong>{title}</strong>
                  <p>{text}</p>
                </div>
              </article>
            )
          )}
        </div>
      </section>
    </div>
  );
}

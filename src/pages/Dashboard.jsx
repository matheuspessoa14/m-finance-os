import { ArrowUpRight, CreditCard, PiggyBank, Plus, WalletCards } from "lucide-react";
import {
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
import { EmptyState, Kpi, Metric, Panel } from "../components/FinanceUI";

export function Dashboard({ month, finance, firstRun, onOpen, onPage }) {
  const savingRate = finance.receivedTotal > 0 ? finance.allocationsTotal / finance.receivedTotal : 0;
  const commitment = finance.receivedTotal > 0 ? (finance.installmentsTotal + finance.expensesTotal) / finance.receivedTotal : 0;

  return (
    <div className="content">
      <section className="hero">
        <div>
          <span className="eyebrow">{BRAND.systemLabel} · {monthLabel.format(parseMonth(month))}</span>
          <h1>Quanto do seu dinheiro está realmente livre?</h1>
          <p>Um painel pessoal para acompanhar entradas, parcelas, gastos e o que você está construindo para o futuro.</p>
          <div className="hero-tags" aria-label="Características do painel"><span>cloud sync</span><span>mobile ready</span><span>dados privados</span></div>
        </div>
        <button className="primary-button" onClick={() => onOpen("rendas")}><Plus size={18} /> Adicionar renda</button>
      </section>

      {firstRun && (
        <section className="first-run-card">
          <div>
            <span className="eyebrow">PRIMEIROS PASSOS</span>
            <h2>Monte seu primeiro mês em poucos minutos.</h2>
            <p>Comece pela renda, depois registre parcelas e gastos. O resumo se atualiza automaticamente.</p>
          </div>
          <div className="first-run-actions">
            <button className="primary-button" onClick={() => onOpen("rendas")}>Adicionar renda</button>
            <button className="secondary-button" onClick={() => onOpen("parcelas")}>Cadastrar parcela</button>
            <button className="secondary-button" onClick={() => onOpen("gastos")}>Registrar gasto</button>
          </div>
        </section>
      )}

      <section className="kpi-grid">
        <Kpi label="Renda recebida" value={finance.receivedTotal} icon={ArrowUpRight} tone="positive" />
        <Kpi label="Parcelas do mês" value={finance.installmentsTotal} icon={CreditCard} />
        <Kpi label="Guardado / investido" value={finance.allocationsTotal} icon={PiggyBank} tone="positive" />
        <Kpi label="Saldo final" value={finance.finalBalance} icon={WalletCards} tone={finance.finalBalance < 0 ? "negative" : "positive"} />
      </section>

      <section className="dashboard-grid">
        <Panel title="De onde veio sua renda" subtitle="Total recebido por fonte no mês.">
          {finance.incomeBySource.length ? (
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={finance.incomeBySource} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={92} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => money.format(value)} />
                  <Bar dataKey="value" fill="#2f8f6b" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title="Seu gráfico começa com uma renda" text="Adicione uma entrada recebida para visualizar suas fontes." action="Adicionar renda" onClick={() => onOpen("rendas")} />
          )}
        </Panel>

        <Panel title="Destino do dinheiro" subtitle="Como a renda do mês foi distribuída.">
          {finance.destinationData.length ? (
            <div className="donut-layout">
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={finance.destinationData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={3}>
                      {finance.destinationData.map((_, index) => <Cell key={index} fill={["#2f8f6b", "#91b8a8", "#c6a15b", "#dfeae5"][index % 4]} />)}
                    </Pie>
                    <Tooltip formatter={(value) => money.format(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="legend-list">
                {finance.destinationData.map((item, index) => (
                  <div key={item.name}><i style={{ background: ["#2f8f6b", "#91b8a8", "#c6a15b", "#dfeae5"][index % 4] }} /><span>{item.name}</span><strong>{money.format(item.value)}</strong></div>
                ))}
              </div>
            </div>
          ) : <EmptyState title="Seu resumo aparecerá aqui" text="Quando houver movimentações, você verá a distribuição do mês." />}
        </Panel>
      </section>

      <section className="dashboard-grid lower">
        <Panel title="Parcelas deste mês" subtitle="Compras que estão comprometendo sua renda agora." action={<button className="ghost-button" onClick={() => onOpen("parcelas")}><Plus size={16} /> Compra</button>}>
          <div className="installment-mini-list">
            {finance.installmentRows.slice(0, 5).map((item) => (
              <div className={`installment-mini ${item.isPaid ? "is-paid" : ""}`} key={item.id}>
                <div><strong>{item.name}</strong><span>{item.category || "Sem categoria"} · parcela {item.installmentNumber}/{item.installments} · {item.isPaid ? "paga" : "pendente"}</span></div>
                <strong>{money.format(item.monthly)}</strong>
              </div>
            ))}
            {!finance.installmentRows.length && <EmptyState title="Nenhuma parcela neste mês" text="Sua lista de parcelas ativas aparecerá aqui." action="Adicionar compra" onClick={() => onOpen("parcelas")} />}
          </div>
        </Panel>

        <Panel title="Saúde do mês" subtitle="Indicadores para evitar comprometer demais sua renda.">
          <Metric label="Taxa guardada" value={savingRate} />
          <Metric label="Renda comprometida" value={commitment} warning />
          <Metric label="Ainda a receber" value={finance.pendingTotal} moneyValue />
          <div className="insight">
            {finance.receivedTotal === 0
              ? "Cadastre suas rendas para começar a enxergar seu mês."
              : finance.finalBalance < 0
              ? "Atenção: seus compromissos estão acima da renda recebida neste mês."
              : savingRate >= 0.2
              ? "Bom ritmo: você separou pelo menos 20% da renda para o futuro."
              : finance.allocationsTotal > 0
              ? "Você já está guardando. Aumente aos poucos sem apertar o mês."
              : "Seu mês ainda tem espaço para um aporte, mesmo que pequeno."}
          </div>
          <button type="button" className="text-action" onClick={() => onPage("historico")}>Ver histórico mensal →</button>
        </Panel>
      </section>
    </div>
  );
}

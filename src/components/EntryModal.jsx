import { useState } from "react";
import { CloudOff, X } from "lucide-react";
import {
  createFormFromItem,
  money,
  validateFinanceForm,
} from "../utils/finance";

export function EntryModal({
  type,
  selectedMonth,
  initialValues,
  onClose,
  onSubmit,
  suggestions,
  online = true,
}) {
  const [form, setForm] = useState(() =>
    createFormFromItem(type, initialValues, selectedMonth)
  );
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);
  const isEditing = Boolean(initialValues?.id);

  const labels = isEditing
    ? {
        rendas: "Editar renda",
        parcelas: "Editar compra parcelada",
        gastos: "Editar gasto",
        aportes: "Editar aporte",
      }
    : {
        rendas: "Nova renda",
        parcelas: "Nova compra parcelada",
        gastos: "Novo gasto",
        aportes: "Novo aporte",
      };

  function field(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
    setSubmitError("");
  }

  async function submit(event) {
    event.preventDefault();
    if (saving) return;

    const nextErrors = validateFinanceForm(type, form, { isEditing });
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      setSubmitError("Revise os campos destacados antes de salvar.");
      return;
    }

    if (!online) {
      setSubmitError(
        "Você está sem conexão. Seus dados preenchidos foram mantidos; conecte-se à internet para salvar."
      );
      return;
    }

    setSaving(true);
    setSubmitError("");

    try {
      // Aguarda a confirmação do Firestore.
      // Em caso de erro, o modal permanece aberto e os dados não são perdidos.
      await onSubmit(form);
    } catch (error) {
      setSubmitError(
        error?.userMessage ||
          "Não foi possível salvar agora. Seus dados continuam preenchidos para você tentar novamente."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={saving ? undefined : onClose}>
      <form
        className="modal-card"
        onSubmit={submit}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="entry-modal-title"
        noValidate
      >
        <div className="modal-header">
          <div>
            <span className="eyebrow">
              {isEditing ? "editar registro" : "novo registro"}
            </span>
            <h2 id="entry-modal-title">{labels[type]}</h2>
          </div>

          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            disabled={saving}
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {!online && (
          <div className="form-offline-note">
            <CloudOff size={16} />
            <span>Sem conexão. Você pode preencher o formulário, mas o envio ficará bloqueado até a internet voltar.</span>
          </div>
        )}

        {submitError && (
          <div className="form-submit-error" role="alert">
            {submitError}
          </div>
        )}

        {type === "rendas" && (
          <>
            <Field label="Data" error={errors.date}>
              <input type="date" value={form.date} onChange={(event) => field("date", event.target.value)} />
            </Field>

            <Field label="Fonte da renda" error={errors.source}>
              <input
                list="income-sources"
                placeholder="Ex.: Estágio, freelance, venda..."
                value={form.source}
                onChange={(event) => field("source", event.target.value)}
              />
              <datalist id="income-sources">
                {suggestions.sources.map((item) => <option key={item} value={item} />)}
              </datalist>
            </Field>

            <Field label="Descrição" error={errors.description}>
              <input
                placeholder="Opcional"
                value={form.description}
                onChange={(event) => field("description", event.target.value)}
              />
            </Field>

            <div className="form-grid">
              <Field label="Tipo" error={errors.type}>
                <select value={form.type} onChange={(event) => field("type", event.target.value)}>
                  <option>Fixa</option>
                  <option>Variável</option>
                  <option>Extra</option>
                </select>
              </Field>

              <Field label="Status" error={errors.status}>
                <select value={form.status} onChange={(event) => field("status", event.target.value)}>
                  <option>Recebida</option>
                  <option>Pendente</option>
                </select>
              </Field>
            </div>

            <MoneyField
              value={form.amount}
              onChange={(value) => field("amount", value)}
              error={errors.amount}
            />
          </>
        )}

        {type === "parcelas" && (
          <>
            <Field label="Compra" error={errors.name}>
              <input
                placeholder="Ex.: Notebook"
                value={form.name}
                onChange={(event) => field("name", event.target.value)}
              />
            </Field>

            <Field label="Categoria" error={errors.category}>
              <input
                list="categories"
                placeholder="Ex.: Tecnologia"
                value={form.category}
                onChange={(event) => field("category", event.target.value)}
              />
              <datalist id="categories">
                {suggestions.categories.map((item) => <option key={item} value={item} />)}
              </datalist>
            </Field>

            <div className="form-grid">
              <Field label="Data da compra" error={errors.purchaseDate}>
                <input
                  type="date"
                  value={form.purchaseDate}
                  onChange={(event) => field("purchaseDate", event.target.value)}
                />
              </Field>

              <Field label="1º vencimento" error={errors.firstDue}>
                <input
                  type="date"
                  value={form.firstDue}
                  onChange={(event) => field("firstDue", event.target.value)}
                />
              </Field>
            </div>

            <MoneyField
              label="Valor total"
              value={form.total}
              onChange={(value) => field("total", value)}
              error={errors.total}
            />

            <div className="form-grid">
              <Field label="Número de parcelas" error={errors.installments}>
                <input
                  type="number"
                  min="1"
                  max="120"
                  inputMode="numeric"
                  value={form.installments}
                  onChange={(event) => field("installments", event.target.value)}
                />
              </Field>

              {!isEditing && (
                <Field label="Já pagas" error={errors.paidInstallments}>
                  <input
                    type="number"
                    min="0"
                    max={form.installments || undefined}
                    inputMode="numeric"
                    value={form.paidInstallments}
                    onChange={(event) => field("paidInstallments", event.target.value)}
                  />
                </Field>
              )}
            </div>

            {isEditing && (
              <div className="form-note">
                O pagamento é controlado mês a mês. Use “Marcar paga” na tela de Parcelas.
              </div>
            )}

            {Number(form.total) > 0 && Number(form.installments) > 0 && (
              <div className="calculated-value">
                Parcela estimada
                <strong>{money.format(Number(form.total) / Number(form.installments))}</strong>
              </div>
            )}
          </>
        )}

        {type === "gastos" && (
          <>
            <Field label="Data" error={errors.date}>
              <input type="date" value={form.date} onChange={(event) => field("date", event.target.value)} />
            </Field>

            <Field label="Descrição" error={errors.description}>
              <input
                placeholder="Ex.: Cinema"
                value={form.description}
                onChange={(event) => field("description", event.target.value)}
              />
            </Field>

            <Field label="Categoria" error={errors.category}>
              <input
                list="expense-categories"
                placeholder="Ex.: Lazer"
                value={form.category}
                onChange={(event) => field("category", event.target.value)}
              />
              <datalist id="expense-categories">
                {suggestions.categories.map((item) => <option key={item} value={item} />)}
              </datalist>
            </Field>

            <MoneyField
              value={form.amount}
              onChange={(value) => field("amount", value)}
              error={errors.amount}
            />

            <Field label="Status" error={errors.status}>
              <select value={form.status} onChange={(event) => field("status", event.target.value)}>
                <option>Pago</option>
                <option>Pendente</option>
              </select>
            </Field>
          </>
        )}

        {type === "aportes" && (
          <>
            <Field label="Data" error={errors.date}>
              <input type="date" value={form.date} onChange={(event) => field("date", event.target.value)} />
            </Field>

            <Field label="Destino" error={errors.destination}>
              <input
                placeholder="Ex.: Reserva de emergência"
                value={form.destination}
                onChange={(event) => field("destination", event.target.value)}
              />
            </Field>

            <Field label="Tipo" error={errors.type}>
              <select value={form.type} onChange={(event) => field("type", event.target.value)}>
                <option>Reserva</option>
                <option>Investimento</option>
              </select>
            </Field>

            <MoneyField
              value={form.amount}
              onChange={(value) => field("amount", value)}
              error={errors.amount}
            />

            <Field label="Objetivo" error={errors.goal}>
              <input
                placeholder="Opcional"
                value={form.goal}
                onChange={(event) => field("goal", event.target.value)}
              />
            </Field>
          </>
        )}

        <div className="modal-footer">
          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </button>

          <button type="submit" className="primary-button" disabled={saving || !online}>
            {saving ? "Salvando..." : isEditing ? "Salvar alterações" : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label className={error ? "field has-error" : "field"}>
      <span>{label}</span>
      {children}
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}

const brlInputFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatMoneyInput(value) {
  const numericValue = Number(value || 0);
  return brlInputFormatter.format(
    Number.isFinite(numericValue) ? numericValue : 0
  );
}

function moneyValueFromTyping(rawValue) {
  // Máscara de centavos:
  // 1 -> 0,01 | 12 -> 0,12 | 123 -> 1,23 | 1234 -> 12,34.
  // Também funciona caso o usuário digite/cole ponto ou vírgula.
  const digits = String(rawValue ?? "")
    .replace(/\D/g, "")
    .slice(0, 11); // até R$ 999.999.999,99

  if (!digits) return "";

  return (Number(digits) / 100).toFixed(2);
}

function MoneyField({ label = "Valor", value, onChange, error }) {
  return (
    <Field label={label} error={error}>
      <div className="money-input">
        <span>R$</span>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          aria-label={`${label} em reais`}
          value={formatMoneyInput(value)}
          onChange={(event) => onChange(moneyValueFromTyping(event.target.value))}
          onFocus={(event) => {
            // Mantém o cursor no fim para a digitação funcionar como maquininha.
            const input = event.currentTarget;
            requestAnimationFrame(() => {
              input.setSelectionRange(input.value.length, input.value.length);
            });
          }}
        />
      </div>
    </Field>
  );
}

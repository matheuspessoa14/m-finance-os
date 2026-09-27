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
  const recurringLocked =
    isEditing && Boolean(initialValues?.recurring);

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

  function changeRecurrence(value) {
    const recurring = value === "monthly";

    setForm((current) => ({
      ...current,
      recurring,
      recurrenceEnd: recurring
        ? current.recurrenceEnd
        : "",
    }));

    setErrors((current) => {
      if (!current.recurrenceEnd) return current;

      const next = { ...current };
      delete next.recurrenceEnd;
      return next;
    });

    setSubmitError("");
  }

  async function submit(event) {
    event.preventDefault();
    if (saving) return;

    const nextErrors = validateFinanceForm(type, form, {
      isEditing,
    });
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      setSubmitError(
        "Revise os campos destacados antes de salvar."
      );
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
    <div
      className="modal-backdrop"
      onMouseDown={saving ? undefined : onClose}
    >
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
            <h2 id="entry-modal-title">
              {labels[type]}
            </h2>
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
            <span>
              Sem conexão. Você pode preencher o formulário,
              mas o envio ficará bloqueado até a internet voltar.
            </span>
          </div>
        )}

        {submitError && (
          <div
            className="form-submit-error"
            role="alert"
          >
            {submitError}
          </div>
        )}

        {type === "rendas" && (
          <>
            <Field
              label={
                form.recurring
                  ? "Data de início"
                  : "Data"
              }
              error={errors.date}
            >
              <input
                type="date"
                value={form.date}
                onChange={(event) =>
                  field("date", event.target.value)
                }
              />
            </Field>

            <Field
              label="Fonte da renda"
              error={errors.source}
            >
              <input
                list="income-sources"
                placeholder="Ex.: Salário, freelance, venda..."
                value={form.source}
                onChange={(event) =>
                  field("source", event.target.value)
                }
              />

              <datalist id="income-sources">
                {suggestions.sources.map((item) => (
                  <option
                    key={item}
                    value={item}
                  />
                ))}
              </datalist>
            </Field>

            <Field
              label="Descrição"
              error={errors.description}
            >
              <input
                placeholder="Opcional"
                value={form.description}
                onChange={(event) =>
                  field(
                    "description",
                    event.target.value
                  )
                }
              />
            </Field>

            <div className="form-grid">
              <Field
                label="Tipo"
                error={errors.type}
              >
                <select
                  value={form.type}
                  onChange={(event) =>
                    field("type", event.target.value)
                  }
                >
                  <option>Fixa</option>
                  <option>Variável</option>
                  <option>Extra</option>
                </select>
              </Field>

              <Field
                label="Status deste mês"
                error={errors.status}
              >
                <select
                  value={form.status}
                  onChange={(event) =>
                    field(
                      "status",
                      event.target.value
                    )
                  }
                >
                  <option value="Recebida">
                    Recebida
                  </option>
                  <option value="Pendente">
                    A receber
                  </option>
                </select>
              </Field>
            </div>

            <MoneyField
              value={form.amount}
              onChange={(value) =>
                field("amount", value)
              }
              error={errors.amount}
            />

            <RecurrenceFields
              form={form}
              error={errors.recurrenceEnd}
              locked={recurringLocked}
              onRecurrenceChange={changeRecurrence}
              onEndChange={(value) =>
                field("recurrenceEnd", value)
              }
              kind="income"
            />
          </>
        )}

        {type === "parcelas" && (
          <>
            <Field
              label="Compra"
              error={errors.name}
            >
              <input
                placeholder="Ex.: Notebook"
                value={form.name}
                onChange={(event) =>
                  field("name", event.target.value)
                }
              />
            </Field>

            <Field
              label="Categoria"
              error={errors.category}
            >
              <input
                list="categories"
                placeholder="Ex.: Tecnologia"
                value={form.category}
                onChange={(event) =>
                  field(
                    "category",
                    event.target.value
                  )
                }
              />

              <datalist id="categories">
                {suggestions.categories.map((item) => (
                  <option
                    key={item}
                    value={item}
                  />
                ))}
              </datalist>
            </Field>

            <div className="form-grid">
              <Field
                label="Data da compra"
                error={errors.purchaseDate}
              >
                <input
                  type="date"
                  value={form.purchaseDate}
                  onChange={(event) =>
                    field(
                      "purchaseDate",
                      event.target.value
                    )
                  }
                />
              </Field>

              <Field
                label="1º vencimento"
                error={errors.firstDue}
              >
                <input
                  type="date"
                  value={form.firstDue}
                  onChange={(event) =>
                    field(
                      "firstDue",
                      event.target.value
                    )
                  }
                />
              </Field>
            </div>

            <MoneyField
              label="Valor total"
              value={form.total}
              onChange={(value) =>
                field("total", value)
              }
              error={errors.total}
            />

            <div className="form-grid">
              <Field
                label="Número de parcelas"
                error={errors.installments}
              >
                <input
                  type="number"
                  min="1"
                  max="120"
                  inputMode="numeric"
                  value={form.installments}
                  onChange={(event) =>
                    field(
                      "installments",
                      event.target.value
                    )
                  }
                />
              </Field>

              {!isEditing && (
                <Field
                  label="Já pagas"
                  error={errors.paidInstallments}
                >
                  <input
                    type="number"
                    min="0"
                    max={
                      form.installments ||
                      undefined
                    }
                    inputMode="numeric"
                    value={form.paidInstallments}
                    onChange={(event) =>
                      field(
                        "paidInstallments",
                        event.target.value
                      )
                    }
                  />
                </Field>
              )}
            </div>

            {isEditing && (
              <div className="form-note">
                O pagamento é controlado mês a mês. Use
                “Marcar paga” na tela de Parcelas.
              </div>
            )}

            {Number(form.total) > 0 &&
              Number(form.installments) > 0 && (
                <div className="calculated-value">
                  Parcela estimada
                  <strong>
                    {money.format(
                      Number(form.total) /
                        Number(
                          form.installments
                        )
                    )}
                  </strong>
                </div>
              )}
          </>
        )}

        {type === "gastos" && (
          <>
            <Field
              label={
                form.recurring
                  ? "Data de início"
                  : "Data"
              }
              error={errors.date}
            >
              <input
                type="date"
                value={form.date}
                onChange={(event) =>
                  field("date", event.target.value)
                }
              />
            </Field>

            <Field
              label="Categoria"
              error={errors.category}
            >
              <input
                list="expense-categories"
                placeholder="Ex.: Uber / 99, Lanche, Mercado..."
                value={form.category}
                onChange={(event) =>
                  field(
                    "category",
                    event.target.value
                  )
                }
              />

              <datalist id="expense-categories">
                {suggestions.categories.map((item) => (
                  <option
                    key={item}
                    value={item}
                  />
                ))}
              </datalist>
            </Field>

            <Field
              label="Descrição (opcional)"
              error={errors.description}
            >
              <input
                placeholder="Ex.: Corrida até o trabalho"
                value={form.description}
                onChange={(event) =>
                  field(
                    "description",
                    event.target.value
                  )
                }
              />
            </Field>

            <MoneyField
              value={form.amount}
              onChange={(value) =>
                field("amount", value)
              }
              error={errors.amount}
            />

            <Field
              label="Status deste mês"
              error={errors.status}
            >
              <select
                value={form.status}
                onChange={(event) =>
                  field(
                    "status",
                    event.target.value
                  )
                }
              >
                <option value="Pendente">
                  Pendente
                </option>
                <option value="Pago">
                  Pago
                </option>
              </select>
            </Field>

            <RecurrenceFields
              form={form}
              error={errors.recurrenceEnd}
              locked={recurringLocked}
              onRecurrenceChange={changeRecurrence}
              onEndChange={(value) =>
                field("recurrenceEnd", value)
              }
              kind="expense"
            />
          </>
        )}

        {type === "aportes" && (
          <>
            <Field
              label="Data"
              error={errors.date}
            >
              <input
                type="date"
                value={form.date}
                onChange={(event) =>
                  field("date", event.target.value)
                }
              />
            </Field>

            <Field
              label="Tipo"
              error={errors.type}
            >
              <select
                value={form.type}
                onChange={(event) =>
                  field("type", event.target.value)
                }
              >
                <option>Reserva</option>
                <option>Investimento</option>
              </select>
            </Field>

            <MoneyField
              value={form.amount}
              onChange={(value) =>
                field("amount", value)
              }
              error={errors.amount}
            />

            <Field
              label="Descrição (opcional)"
              error={errors.destination}
            >
              <input
                placeholder="Ex.: Reserva de emergência"
                value={form.destination}
                onChange={(event) =>
                  field(
                    "destination",
                    event.target.value
                  )
                }
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

          <button
            type="submit"
            className="primary-button"
            disabled={saving || !online}
          >
            {saving
              ? "Salvando..."
              : isEditing
                ? "Salvar alterações"
                : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}

function RecurrenceFields({
  form,
  error,
  locked,
  onRecurrenceChange,
  onEndChange,
  kind,
}) {
  const isIncome = kind === "income";

  return (
    <>
      <Field label="Recorrência mensal">
        <select
          value={
            form.recurring
              ? "monthly"
              : "none"
          }
          onChange={(event) =>
            onRecurrenceChange(
              event.target.value
            )
          }
          disabled={locked}
        >
          <option value="none">
            Não repetir
          </option>
          <option value="monthly">
            Repetir todo mês
          </option>
        </select>
      </Field>

      {form.recurring && (
        <>
          <Field
            label="Repetir até (opcional)"
            error={error}
          >
            <input
              type="month"
              value={form.recurrenceEnd || ""}
              onChange={(event) =>
                onEndChange(event.target.value)
              }
            />
          </Field>

          <div className="form-note">
            {locked
              ? "Esta recorrência já está ativa. Para encerrá-la sem apagar o histórico, escolha o último mês acima."
              : "Sem mês final, este lançamento continuará aparecendo automaticamente nos próximos meses."}
            {" "}
            {isIncome
              ? "Nos meses seguintes, a renda aparece como “A receber” até ser marcada como recebida."
              : "Nos meses seguintes, o gasto aparece como “A pagar” até ser marcado como pago."}
          </div>
        </>
      )}
    </>
  );
}

function Field({ label, error, children }) {
  return (
    <label
      className={
        error
          ? "field has-error"
          : "field"
      }
    >
      <span>{label}</span>
      {children}
      {error && (
        <small className="field-error">
          {error}
        </small>
      )}
    </label>
  );
}

const brlInputFormatter = new Intl.NumberFormat(
  "pt-BR",
  {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }
);

function formatMoneyInput(value) {
  const numericValue = Number(value || 0);

  return brlInputFormatter.format(
    Number.isFinite(numericValue)
      ? numericValue
      : 0
  );
}

function moneyValueFromTyping(rawValue) {
  const digits = String(rawValue ?? "")
    .replace(/\D/g, "")
    .slice(0, 11);

  if (!digits) return "";

  return (Number(digits) / 100).toFixed(2);
}

function MoneyField({
  label = "Valor",
  value,
  onChange,
  error,
}) {
  return (
    <Field
      label={label}
      error={error}
    >
      <div className="money-input">
        <span>R$</span>

        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          aria-label={`${label} em reais`}
          value={formatMoneyInput(value)}
          onChange={(event) =>
            onChange(
              moneyValueFromTyping(
                event.target.value
              )
            )
          }
          onFocus={(event) => {
            const input =
              event.currentTarget;

            requestAnimationFrame(() => {
              input.setSelectionRange(
                input.value.length,
                input.value.length
              );
            });
          }}
        />
      </div>
    </Field>
  );
}

import { useEffect, useId, useRef, useState } from "react";

import { Check, ChevronDown, CloudOff, X } from "lucide-react";

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
    createFormFromItem(type, initialValues, selectedMonth),
  );

  const [errors, setErrors] = useState({});

  const [submitError, setSubmitError] = useState("");

  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(initialValues?.id);

  const recurringLocked = isEditing && Boolean(initialValues?.recurring);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;

    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";

    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;

      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

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

      recurrenceEnd: recurring ? current.recurrenceEnd : "",
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
      setSubmitError("Revise os campos destacados antes de salvar.");

      return;
    }

    if (!online) {
      setSubmitError(
        "Você está sem conexão. Seus dados preenchidos foram mantidos; conecte-se à internet para salvar.",
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
          "Não foi possível salvar agora. Seus dados continuam preenchidos para você tentar novamente.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={saving ? undefined : onClose}>
           {" "}
      <form
        className="modal-card"
        data-entry-type={type}
        onSubmit={submit}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="entry-modal-title"
        noValidate
      >
               {" "}
        <div className="modal-header">
                   {" "}
          <div>
                       {" "}
            <span className="eyebrow">
                            {isEditing ? "editar registro" : "novo registro"}   
                     {" "}
            </span>
                       {" "}
            <h2 id="entry-modal-title">
                            {labels[type]}           {" "}
            </h2>
                     {" "}
          </div>
                   {" "}
          <button
            type="button"
            className="icon-button modal-close-button"
            onClick={onClose}
            disabled={saving}
            aria-label="Fechar"
          >
                        <X size={20} />         {" "}
          </button>
                 {" "}
        </div>
                       {" "}
        <div className="modal-body">
                 {" "}
          {!online && (
            <div className="form-offline-note">
                          <CloudOff size={16} />           {" "}
              <span>
                              Sem conexão. Você pode preencher o formulário,    
                          mas o envio ficará bloqueado até a internet voltar.  
                         {" "}
              </span>
                       {" "}
            </div>
          )}
                 {" "}
          {submitError && (
            <div className="form-submit-error" role="alert">
                          {submitError}         {" "}
            </div>
          )}
                 {" "}
          {type === "rendas" && (
            <>
                         {" "}
              <Field
                label={form.recurring ? "Data de início" : "Data"}
                error={errors.date}
              >
                             {" "}
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) => field("date", event.target.value)}
                />
                           {" "}
              </Field>
                         {" "}
              <Field label="Fonte da renda" error={errors.source}>
                             {" "}
                <input
                  list="income-sources"
                  placeholder="Ex.: Salário, freelance, venda..."
                  value={form.source}
                  onChange={(event) => field("source", event.target.value)}
                />
                             {" "}
                <datalist id="income-sources">
                                 {" "}
                  {suggestions.sources.map((item) => (
                    <option key={item} value={item} />
                  ))}
                               {" "}
                </datalist>
                           {" "}
              </Field>
                         {" "}
              <Field label="Descrição" error={errors.description}>
                             {" "}
                <input
                  placeholder="Opcional"
                  value={form.description}
                  onChange={(event) =>
                    field(
                      "description",

                      event.target.value,
                    )
                  }
                />
                           {" "}
              </Field>
                         {" "}
              <div className="form-grid">
                             {" "}
                <SelectField
                  label="Tipo"
                  value={form.type}
                  options={["Fixa", "Variável", "Extra"]}
                  error={errors.type}
                  onChange={(value) => field("type", value)}
                />
                             {" "}
                <SelectField
                  label="Status deste mês"
                  value={form.status}
                  options={[
                    { value: "Recebida", label: "Recebida" },
                    { value: "Pendente", label: "A receber" },
                  ]}
                  error={errors.status}
                  onChange={(value) => field("status", value)}
                />
                           {" "}
              </div>
                         {" "}
              <MoneyField
                value={form.amount}
                onChange={(value) => field("amount", value)}
                error={errors.amount}
              />
                         {" "}
              <RecurrenceFields
                form={form}
                error={errors.recurrenceEnd}
                locked={recurringLocked}
                onRecurrenceChange={changeRecurrence}
                onEndChange={(value) => field("recurrenceEnd", value)}
                kind="income"
              />
                       {" "}
            </>
          )}
                 {" "}
          {type === "parcelas" && (
            <>
                         {" "}
              <Field label="Compra" error={errors.name}>
                             {" "}
                <input
                  placeholder="Ex.: Notebook"
                  value={form.name}
                  onChange={(event) => field("name", event.target.value)}
                />
                           {" "}
              </Field>
                         {" "}
              <CategoryField
                value={form.category}
                suggestions={suggestions.categories}
                placeholder="Ex.: Tecnologia"
                error={errors.category}
                onChange={(value) => field("category", value)}
              />
                         {" "}
              <div className="form-grid">
                             {" "}
                <Field label="Data da compra" error={errors.purchaseDate}>
                                 {" "}
                  <input
                    type="date"
                    value={form.purchaseDate}
                    onChange={(event) =>
                      field(
                        "purchaseDate",

                        event.target.value,
                      )
                    }
                  />
                               {" "}
                </Field>
                             {" "}
                <Field label="1º vencimento" error={errors.firstDue}>
                                 {" "}
                  <input
                    type="date"
                    value={form.firstDue}
                    onChange={(event) =>
                      field(
                        "firstDue",

                        event.target.value,
                      )
                    }
                  />
                               {" "}
                </Field>
                           {" "}
              </div>
                         {" "}
              <MoneyField
                label="Valor total"
                value={form.total}
                onChange={(value) => field("total", value)}
                error={errors.total}
              />
                         {" "}
              <div className="form-grid">
                             {" "}
                <Field label="Número de parcelas" error={errors.installments}>
                                 {" "}
                  <input
                    type="number"
                    min="1"
                    max="120"
                    inputMode="numeric"
                    value={form.installments}
                    onChange={(event) =>
                      field(
                        "installments",

                        event.target.value,
                      )
                    }
                  />
                               {" "}
                </Field>
                             {" "}
                {!isEditing && (
                  <Field label="Já pagas" error={errors.paidInstallments}>
                                     {" "}
                    <input
                      type="number"
                      min="0"
                      max={form.installments || undefined}
                      inputMode="numeric"
                      value={form.paidInstallments}
                      onChange={(event) =>
                        field(
                          "paidInstallments",

                          event.target.value,
                        )
                      }
                    />
                                   {" "}
                  </Field>
                )}
                           {" "}
              </div>
                         {" "}
              {isEditing && (
                <div className="form-note">
                                  O pagamento é controlado mês a mês. Use      
                            “Marcar paga” na tela de Parcelas.            
                   {" "}
                </div>
              )}
                         {" "}
              {Number(form.total) > 0 && Number(form.installments) > 0 && (
                <div className="calculated-value">
                                    Parcela estimada                  {" "}
                  <strong>
                                       {" "}
                    {money.format(
                      Number(form.total) / Number(form.installments),
                    )}
                                     {" "}
                  </strong>
                                 {" "}
                </div>
              )}
                       {" "}
            </>
          )}
                 {" "}
          {type === "gastos" && (
            <>
                         {" "}
              <Field
                label={form.recurring ? "Data de início" : "Data"}
                error={errors.date}
              >
                             {" "}
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) => field("date", event.target.value)}
                />
                           {" "}
              </Field>
                         {" "}
              <CategoryField
                value={form.category}
                suggestions={suggestions.categories}
                placeholder="Ex.: Uber / 99, Lanche, Mercado..."
                error={errors.category}
                onChange={(value) => field("category", value)}
              />
                         {" "}
              <Field label="Descrição (opcional)" error={errors.description}>
                             {" "}
                <input
                  placeholder="Ex.: Corrida até o trabalho"
                  value={form.description}
                  onChange={(event) =>
                    field(
                      "description",

                      event.target.value,
                    )
                  }
                />
                           {" "}
              </Field>
                         {" "}
              <MoneyField
                value={form.amount}
                onChange={(value) => field("amount", value)}
                error={errors.amount}
              />
                         {" "}
              <SelectField
                label="Status deste mês"
                value={form.status}
                options={[
                  { value: "Pendente", label: "A pagar" },
                  { value: "Pago", label: "Pago" },
                ]}
                error={errors.status}
                onChange={(value) => field("status", value)}
              />
                         {" "}
              <RecurrenceFields
                form={form}
                error={errors.recurrenceEnd}
                locked={recurringLocked}
                onRecurrenceChange={changeRecurrence}
                onEndChange={(value) => field("recurrenceEnd", value)}
                kind="expense"
              />
                       {" "}
            </>
          )}
                 {" "}
          {type === "aportes" && (
            <>
                         {" "}
              <Field label="Data" error={errors.date}>
                             {" "}
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) => field("date", event.target.value)}
                />
                           {" "}
              </Field>
                         {" "}
              <SelectField
                label="Tipo"
                value={form.type}
                options={["Reserva", "Investimento"]}
                error={errors.type}
                onChange={(value) => field("type", value)}
              />
                         {" "}
              <MoneyField
                value={form.amount}
                onChange={(value) => field("amount", value)}
                error={errors.amount}
              />
                         {" "}
              <Field label="Descrição (opcional)" error={errors.destination}>
                             {" "}
                <input
                  placeholder="Ex.: Reserva de emergência"
                  value={form.destination}
                  onChange={(event) =>
                    field(
                      "destination",

                      event.target.value,
                    )
                  }
                />
                           {" "}
              </Field>
                       {" "}
            </>
          )}
                 {" "}
        </div>
               {" "}
        <div className="modal-footer">
                   {" "}
          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
            disabled={saving}
          >
                        Cancelar          {" "}
          </button>
                   {" "}
          <button
            type="submit"
            className="primary-button"
            disabled={saving || !online}
          >
                       {" "}
            {saving
              ? "Salvando..."
              : isEditing
                ? "Salvar alterações"
                : "Salvar"}
                     {" "}
          </button>
                 {" "}
        </div>
             {" "}
      </form>
         {" "}
    </div>
  );
}

function normalizeCategorySearch(value) {
  return String(value || "")
    .normalize("NFD")

    .replace(/[\u0300-\u036f]/g, "")

    .toLocaleLowerCase("pt-BR")

    .trim();
}

function CategoryField({
  value,

  suggestions = [],

  placeholder,

  error,

  onChange,
}) {
  const [open, setOpen] = useState(false);

  const rootRef = useRef(null);

  const inputRef = useRef(null);

  const normalizedValue = normalizeCategorySearch(value);

  const options = [...new Set(suggestions.filter(Boolean))].filter((item) => {
    if (!normalizedValue) return true;

    return normalizeCategorySearch(item).includes(normalizedValue);
  });

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);

        inputRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);

      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function chooseCategory(category) {
    onChange(category);

    setOpen(false);

    requestAnimationFrame(() => inputRef.current?.focus());
  }

  return (
    <div
      ref={rootRef}
      className={
        error ? "field has-error category-field" : "field category-field"
      }
    >
            <span>Categoria</span>     {" "}
      <div className={open ? "category-picker is-open" : "category-picker"}>
               {" "}
        <div className="category-picker-control">
                   {" "}
          <input
            ref={inputRef}
            value={value}
            placeholder={placeholder}
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls="entry-category-options"
            onFocus={() => setOpen(true)}
            onChange={(event) => {
              onChange(event.target.value);

              setOpen(true);
            }}
          />
                   {" "}
          <button
            type="button"
            className="category-picker-toggle"
            aria-label={open ? "Fechar categorias" : "Mostrar categorias"}
            aria-expanded={open}
            onClick={() => {
              setOpen((current) => !current);

              inputRef.current?.focus();
            }}
          >
                        <ChevronDown size={17} />         {" "}
          </button>
                 {" "}
        </div>
               {" "}
        {open && (
          <div
            id="entry-category-options"
            className="category-picker-menu"
            role="listbox"
            aria-label="Categorias disponíveis"
          >
                       {" "}
            {options.length ? (
              options.map((item) => {
                const selected =
                  normalizeCategorySearch(item) === normalizedValue;

                return (
                  <button
                    key={item}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={
                      selected
                        ? "category-picker-option is-selected"
                        : "category-picker-option"
                    }
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => chooseCategory(item)}
                  >
                                        <span>{item}</span>                   {" "}
                    {selected && <Check size={15} />}                 {" "}
                  </button>
                );
              })
            ) : (
              <div className="category-picker-empty">
                                Nenhuma categoria encontrada. Você pode
                continuar digitando para usar esta categoria.              {" "}
              </div>
            )}
                     {" "}
          </div>
        )}
             {" "}
      </div>
            {error && <small className="field-error">{error}</small>}   {" "}
    </div>
  );
}

function SelectField({
  label,
  value,
  options = [],
  error,
  disabled = false,
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState("bottom");
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const listboxId = useId();

  const normalizedOptions = options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option,
  );

  const selectedOption =
    normalizedOptions.find((option) => option.value === value) ||
    normalizedOptions[0];

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  function openMenu() {
    if (disabled || !rootRef.current) return;

    const rect = rootRef.current.getBoundingClientRect();
    const modalBody = rootRef.current.closest(".modal-body");
    const bodyRect = modalBody?.getBoundingClientRect();

    const topLimit = bodyRect?.top ?? 0;
    const bottomLimit = bodyRect?.bottom ?? window.innerHeight;
    const spaceAbove = rect.top - topLimit;
    const spaceBelow = bottomLimit - rect.bottom;

    setPlacement(
      spaceBelow < 190 && spaceAbove > spaceBelow ? "top" : "bottom",
    );
    setOpen(true);
  }

  function toggleMenu() {
    if (open) {
      setOpen(false);
      return;
    }

    openMenu();
  }

  function chooseOption(option) {
    if (disabled) return;

    onChange(option.value);
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function focusOption(direction) {
    requestAnimationFrame(() => {
      const buttons = rootRef.current?.querySelectorAll(".app-select-option");

      if (!buttons?.length) return;

      const target =
        direction === "last" ? buttons[buttons.length - 1] : buttons[0];

      target?.focus();
    });
  }

  return (
    <div
      ref={rootRef}
      className={[
        "field",
        "app-select-field",
        error ? "has-error" : "",
        open ? "is-open" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span>{label}</span>

      <div className={open ? "app-select is-open" : "app-select"}>
        <button
          ref={triggerRef}
          type="button"
          className="app-select-trigger"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          disabled={disabled}
          onClick={toggleMenu}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              if (!open) openMenu();
              focusOption("first");
            }

            if (event.key === "ArrowUp") {
              event.preventDefault();
              if (!open) openMenu();
              focusOption("last");
            }
          }}
        >
          <span className="app-select-value">
            {selectedOption?.label || value}
          </span>

          <ChevronDown
            className="app-select-chevron"
            size={17}
            aria-hidden="true"
          />
        </button>

        {open && (
          <div
            id={listboxId}
            className={`app-select-menu app-select-menu--${placement}`}
            role="listbox"
            aria-label={label}
          >
            {normalizedOptions.map((option, index) => {
              const selected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={
                    selected
                      ? "app-select-option is-selected"
                      : "app-select-option"
                  }
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => chooseOption(option)}
                  onKeyDown={(event) => {
                    const buttons =
                      rootRef.current?.querySelectorAll(".app-select-option");

                    if (!buttons?.length) return;

                    if (event.key === "ArrowDown") {
                      event.preventDefault();
                      buttons[(index + 1) % buttons.length]?.focus();
                    }

                    if (event.key === "ArrowUp") {
                      event.preventDefault();
                      buttons[
                        (index - 1 + buttons.length) % buttons.length
                      ]?.focus();
                    }

                    if (event.key === "Home") {
                      event.preventDefault();
                      buttons[0]?.focus();
                    }

                    if (event.key === "End") {
                      event.preventDefault();
                      buttons[buttons.length - 1]?.focus();
                    }
                  }}
                >
                  <span>{option.label}</span>
                  {selected && <Check size={15} />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {error && <small className="field-error">{error}</small>}
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
           {" "}
      <SelectField
        label="Recorrência mensal"
        value={form.recurring ? "monthly" : "none"}
        options={[
          { value: "none", label: "Não repetir" },
          { value: "monthly", label: "Repetir todo mês" },
        ]}
        disabled={locked}
        onChange={onRecurrenceChange}
      />
           {" "}
      {form.recurring && (
        <>
                   {" "}
          <Field label="Repetir até (opcional)" error={error}>
                       {" "}
            <input
              type="month"
              value={form.recurrenceEnd || ""}
              onChange={(event) => onEndChange(event.target.value)}
            />
                     {" "}
          </Field>
                   {" "}
          <div className="form-note">
                       {" "}
            {locked
              ? "Esta recorrência já está ativa. Para encerrá-la sem apagar o histórico, escolha o último mês acima."
              : "Sem mês final, este lançamento continuará aparecendo automaticamente nos próximos meses."}
                                   {" "}
            {isIncome
              ? "Nos meses seguintes, a renda aparece como “A receber” até ser marcada como recebida."
              : "Nos meses seguintes, o gasto aparece como “A pagar” até ser marcado como pago."}
                     {" "}
          </div>
                 {" "}
        </>
      )}
         {" "}
    </>
  );
}

function Field({ label, error, children }) {
  return (
    <label className={error ? "field has-error" : "field"}>
            <span>{label}</span>      {children}     {" "}
      {error && (
        <small className="field-error">          {error}        </small>
      )}
         {" "}
    </label>
  );
}

const brlInputFormatter = new Intl.NumberFormat(
  "pt-BR",

  {
    minimumFractionDigits: 2,

    maximumFractionDigits: 2,
  },
);

function formatMoneyInput(value) {
  const numericValue = Number(value || 0);

  return brlInputFormatter.format(
    Number.isFinite(numericValue) ? numericValue : 0,
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
    <Field label={label} error={error}>
           {" "}
      <div className="money-input">
                <span>R$</span>       {" "}
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          aria-label={`${label} em reais`}
          value={formatMoneyInput(value)}
          onChange={(event) =>
            onChange(moneyValueFromTyping(event.target.value))
          }
          onFocus={(event) => {
            const input = event.currentTarget;

            requestAnimationFrame(() => {
              input.setSelectionRange(
                input.value.length,

                input.value.length,
              );
            });
          }}
        />
             {" "}
      </div>
         {" "}
    </Field>
  );
}

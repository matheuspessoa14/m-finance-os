import { COLLECTIONS } from "../config/brand";
import {
  addMonthsToKey,
  currentMonth,
  dateForSelectedMonth,
  monthDiff,
  monthKeyFromDate,
} from "./date";
export const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
export function sum(list, getter = (x) => Number(x.amount || 0)) {
  return list.reduce((total, item) => total + Number(getter(item) || 0), 0);
}
const MAX_AMOUNT = 999999999.99;
const MAX_INSTALLMENTS = 120;
const MAX_RECURRING_MONTHS = 600;
function text(value) {
  return String(value ?? "").trim();
}
function validDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
}
function validMonthKey(value) {
  return /^\d{4}-\d{2}$/.test(String(value || ""));
}
function normalizeMonthList(value) {
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(
      value
        .map((item) => text(item))
        .filter(validMonthKey)
    ),
  ].sort();
}
function recurrenceEndMonth(item) {
  const value = text(item?.recurrenceEnd);
  if (!value) return "";
  if (validMonthKey(value)) return value;
  return monthKeyFromDate(value) || "";
}
function recurrenceStartMonth(item) {
  return monthKeyFromDate(item?.recurrenceStartDate || item?.date);
}
function isActiveInMonth(item, month) {
  const start = recurrenceStartMonth(item);
  if (!start || !month) return false;
  if (!item?.recurring) {
    return start === month;
  }
  const end = recurrenceEndMonth(item);
  return month >= start && (!end || month <= end);
}
function dateForRecurringMonth(originalDate, month) {
  if (!validDate(originalDate) || !validMonthKey(month)) {
    return originalDate || dateForSelectedMonth(month);
  }
  const originalDay = Number(String(originalDate).slice(8, 10)) || 1;
  const [year, monthNumber] = month.split("-").map(Number);
  const lastDay = new Date(year, monthNumber, 0).getDate();
  const day = String(Math.min(originalDay, lastDay)).padStart(2, "0");
  return `${month}-${day}`;
}
function normalizeTrackedMonths(list, startMonth, endMonth = "") {
  return normalizeMonthList(list)
    .filter((month) => !startMonth || month >= startMonth)
    .filter((month) => !endMonth || month <= endMonth)
    .slice(0, MAX_RECURRING_MONTHS);
}
function updateTrackedMonth(list, month, active) {
  if (!month || !validMonthKey(month)) {
    return normalizeMonthList(list);
  }
  const current = new Set(normalizeMonthList(list));
  if (active) {
    current.add(month);
  } else {
    current.delete(month);
  }
  return [...current].sort();
}
function validatePositiveAmount(errors, field, value, label) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) {
    errors[field] = `${label} deve ser maior que R$ 0,00.`;
  } else if (number > MAX_AMOUNT) {
    errors[field] = `${label} ultrapassa o limite permitido.`;
  }
}
function validateRecurrence(errors, form) {
  if (!form.recurring) return;
  const startMonth = monthKeyFromDate(form.date);
  const endMonth = text(form.recurrenceEnd);
  if (endMonth && !validMonthKey(endMonth)) {
    errors.recurrenceEnd = "Informe um mês final válido.";
    return;
  }
  if (startMonth && endMonth && endMonth < startMonth) {
    errors.recurrenceEnd = "O mês final não pode ser anterior ao início.";
  }
}
export function createEmptyForm(type, month) {
  const selectedDate = dateForSelectedMonth(month);
  const forms = {
    rendas: {
      date: selectedDate,
      description: "",
      source: "",
      type: "Fixa",
      amount: "",
      status: "Recebida",
      recurring: false,
      recurrenceEnd: "",
      receivedMonths: [],
      statusMonth: month,
    },
    parcelas: {
      name: "",
      category: "",
      purchaseDate: selectedDate,
      total: "",
      installments: "",
      paidInstallments: "0",
      paidMonths: [],
      firstDue: selectedDate,
    },
    gastos: {
      date: selectedDate,
      description: "",
      category: "",
      amount: "",
      status: "Pendente",
      recurring: false,
      recurrenceEnd: "",
      paidMonths: [],
      statusMonth: month,
    },
    aportes: {
      date: selectedDate,
      destination: "",
      type: "Reserva",
      amount: "",
      goal: "",
    },
  };
  return forms[type];
}
export function paidMonthsFromLegacy(item) {
  if (Array.isArray(item?.paidMonths)) {
    return [...new Set(item.paidMonths.filter(Boolean))].sort();
  }
  const first = monthKeyFromDate(item?.firstDue);
  const paidCount = Math.max(Number(item?.paidInstallments || 0), 0);
  if (!first || !paidCount) return [];
  return Array.from({ length: paidCount }, (_, index) =>
    addMonthsToKey(first, index)
  );
}
export function getIncomeRow(item, month) {
  const activeThisMonth = isActiveInMonth(item, month);
  const startMonth = recurrenceStartMonth(item);
  const hasTrackedMonths = Array.isArray(item?.receivedMonths);
  const receivedMonths = normalizeMonthList(item?.receivedMonths);
  let isReceived = item?.status === "Recebida";
  if (item?.recurring) {
    if (hasTrackedMonths) {
      isReceived = receivedMonths.includes(month);
    } else {
      isReceived = month === startMonth && item?.status === "Recebida";
    }
  }
  return {
    ...item,
    recurrenceStartDate: item?.recurrenceStartDate || item?.date,
    date:
      item?.recurring && activeThisMonth
        ? dateForRecurringMonth(
            item?.recurrenceStartDate || item?.date,
            month
          )
        : item?.date,
    receivedMonths,
    statusMonth: month,
    activeThisMonth,
    isReceived,
    status: isReceived ? "Recebida" : "Pendente",
  };
}
export function getExpenseRow(item, month) {
  const activeThisMonth = isActiveInMonth(item, month);
  const startMonth = recurrenceStartMonth(item);
  const hasTrackedMonths = Array.isArray(item?.paidMonths);
  const paidMonths = normalizeMonthList(item?.paidMonths);
  let isPaid = item?.status === "Pago";
  if (item?.recurring) {
    if (hasTrackedMonths) {
      isPaid = paidMonths.includes(month);
    } else {
      isPaid = month === startMonth && item?.status === "Pago";
    }
  }
  return {
    ...item,
    recurrenceStartDate: item?.recurrenceStartDate || item?.date,
    date:
      item?.recurring && activeThisMonth
        ? dateForRecurringMonth(
            item?.recurrenceStartDate || item?.date,
            month
          )
        : item?.date,
    paidMonths,
    statusMonth: month,
    activeThisMonth,
    isPaid,
    status: isPaid ? "Pago" : "Pendente",
  };
}
export function createFormFromItem(type, item, selectedMonth) {
  if (!item) return createEmptyForm(type, selectedMonth);
  if (type === "rendas") {
    const row = getIncomeRow(item, selectedMonth);
    return {
      date:
        item.recurrenceStartDate ||
        item.date ||
        dateForSelectedMonth(selectedMonth),
      description: item.description || "",
      source: item.source || "",
      type: item.type || "Fixa",
      amount: item.amount ?? "",
      status: row.status || "Recebida",
      recurring: Boolean(item.recurring),
      recurrenceEnd: recurrenceEndMonth(item),
      receivedMonths: normalizeMonthList(item.receivedMonths),
      statusMonth: selectedMonth,
    };
  }
  if (type === "parcelas") {
    const paidMonths = paidMonthsFromLegacy(item);
    return {
      name: item.name || "",
      category: item.category || "",
      purchaseDate:
        item.purchaseDate || dateForSelectedMonth(selectedMonth),
      total: item.total ?? "",
      installments: item.installments ?? "",
      paidInstallments: paidMonths.length,
      paidMonths,
      firstDue: item.firstDue || dateForSelectedMonth(selectedMonth),
    };
  }
  if (type === "gastos") {
    const row = getExpenseRow(item, selectedMonth);
    return {
      date:
        item.recurrenceStartDate ||
        item.date ||
        dateForSelectedMonth(selectedMonth),
      description: item.description || "",
      category: item.category || "",
      amount: item.amount ?? "",
      status: row.status || "Pendente",
      recurring: Boolean(item.recurring),
      recurrenceEnd: recurrenceEndMonth(item),
      paidMonths: normalizeMonthList(item.paidMonths),
      statusMonth: selectedMonth,
    };
  }
  return {
    date: item.date || dateForSelectedMonth(selectedMonth),
    destination: item.destination || "",
    type: item.type || "Reserva",
    amount: item.amount ?? "",
    goal: item.goal || "",
  };
}
export function validateFinanceForm(type, form, { isEditing = false } = {}) {
  const errors = {};
  if (type === "rendas") {
    if (!validDate(form.date)) {
      errors.date = "Informe uma data válida.";
    }
    if (!text(form.source)) {
      errors.source = "Informe a fonte da renda.";
    }
    if (text(form.source).length > 120) {
      errors.source = "Use no máximo 120 caracteres.";
    }
    if (text(form.description).length > 180) {
      errors.description = "Use no máximo 180 caracteres.";
    }
    if (!["Fixa", "Variável", "Extra"].includes(form.type)) {
      errors.type = "Selecione um tipo válido.";
    }
    if (!["Recebida", "Pendente"].includes(form.status)) {
      errors.status = "Selecione um status válido.";
    }
    validatePositiveAmount(errors, "amount", form.amount, "O valor");
    validateRecurrence(errors, form);
  }
  if (type === "gastos") {
    if (!validDate(form.date)) {
      errors.date = "Informe uma data válida.";
    }
    if (!text(form.category)) {
      errors.category = "Informe uma categoria.";
    }
    if (text(form.category).length > 100) {
      errors.category = "Use no máximo 100 caracteres.";
    }
    if (text(form.description).length > 180) {
      errors.description = "Use no máximo 180 caracteres.";
    }
    if (!["Pago", "Pendente"].includes(form.status)) {
      errors.status = "Selecione um status válido.";
    }
    validatePositiveAmount(errors, "amount", form.amount, "O valor");
    validateRecurrence(errors, form);
  }
  if (type === "aportes") {
    if (!validDate(form.date)) {
      errors.date = "Informe uma data válida.";
    }
    if (text(form.destination).length > 120) {
      errors.destination = "Use no máximo 120 caracteres.";
    }
    if (text(form.goal).length > 180) {
      errors.goal = "Use no máximo 180 caracteres.";
    }
    if (!["Reserva", "Investimento"].includes(form.type)) {
      errors.type = "Selecione um tipo válido.";
    }
    validatePositiveAmount(errors, "amount", form.amount, "O valor");
  }
  if (type === "parcelas") {
    if (!text(form.name)) {
      errors.name = "Informe o nome da compra.";
    }
    if (text(form.name).length > 120) {
      errors.name = "Use no máximo 120 caracteres.";
    }
    if (text(form.category).length > 100) {
      errors.category = "Use no máximo 100 caracteres.";
    }
    if (!validDate(form.purchaseDate)) {
      errors.purchaseDate = "Informe a data da compra.";
    }
    if (!validDate(form.firstDue)) {
      errors.firstDue = "Informe o primeiro vencimento.";
    }
    if (
      validDate(form.purchaseDate) &&
      validDate(form.firstDue) &&
      form.firstDue < form.purchaseDate
    ) {
      errors.firstDue = "O 1º vencimento não pode ser anterior à compra.";
    }
    validatePositiveAmount(errors, "total", form.total, "O valor total");
    const installments = Number(form.installments);
    if (!Number.isInteger(installments) || installments < 1) {
      errors.installments = "Informe pelo menos 1 parcela.";
    } else if (installments > MAX_INSTALLMENTS) {
      errors.installments = `Use no máximo ${MAX_INSTALLMENTS} parcelas.`;
    }
    if (!isEditing) {
      const paid = Number(form.paidInstallments || 0);
      if (!Number.isInteger(paid) || paid < 0) {
        errors.paidInstallments = "Informe uma quantidade válida.";
      } else if (
        Number.isInteger(installments) &&
        paid > installments
      ) {
        errors.paidInstallments =
          "As parcelas pagas não podem superar o total.";
      }
    }
  }
  return errors;
}
export function normalizeForm(type, form, { isEditing = false } = {}) {
  if (type === "rendas") {
    const recurring = Boolean(form.recurring);
    const startMonth = monthKeyFromDate(form.date);
    const recurrenceEnd = recurring
      ? text(form.recurrenceEnd)
      : "";
    let receivedMonths = recurring
      ? normalizeTrackedMonths(
          form.receivedMonths,
          startMonth,
          recurrenceEnd
        )
      : [];
    if (recurring) {
      const statusMonth =
        isEditing && validMonthKey(form.statusMonth)
          ? form.statusMonth
          : startMonth;
      receivedMonths = updateTrackedMonth(
        receivedMonths,
        statusMonth,
        form.status === "Recebida"
      );
      receivedMonths = normalizeTrackedMonths(
        receivedMonths,
        startMonth,
        recurrenceEnd
      );
    }
    return {
      date: form.date,
      description: text(form.description),
      source: text(form.source),
      type: form.type,
      amount: Number(form.amount),
      status: form.status,
      recurring,
      recurrenceEnd,
      receivedMonths,
    };
  }
  if (type === "parcelas") {
    const installments = Number(form.installments);
    const total = Number(form.total);
    let paidMonths = Array.isArray(form.paidMonths)
      ? form.paidMonths
      : [];
    if (!isEditing) {
      const first = monthKeyFromDate(form.firstDue);
      const paidCount = Math.min(
        Math.max(Number(form.paidInstallments || 0), 0),
        installments
      );
      paidMonths = first
        ? Array.from({ length: paidCount }, (_, index) =>
            addMonthsToKey(first, index)
          )
        : [];
    }
    paidMonths = [...new Set(paidMonths)].sort();
    return {
      name: text(form.name),
      category: text(form.category),
      purchaseDate: form.purchaseDate,
      firstDue: form.firstDue,
      total,
      installments,
      paidMonths,
      paidInstallments: paidMonths.length,
    };
  }
  if (type === "gastos") {
    const recurring = Boolean(form.recurring);
    const startMonth = monthKeyFromDate(form.date);
    const recurrenceEnd = recurring
      ? text(form.recurrenceEnd)
      : "";
    let paidMonths = recurring
      ? normalizeTrackedMonths(
          form.paidMonths,
          startMonth,
          recurrenceEnd
        )
      : [];
    if (recurring) {
      const statusMonth =
        isEditing && validMonthKey(form.statusMonth)
          ? form.statusMonth
          : startMonth;
      paidMonths = updateTrackedMonth(
        paidMonths,
        statusMonth,
        form.status === "Pago"
      );
      paidMonths = normalizeTrackedMonths(
        paidMonths,
        startMonth,
        recurrenceEnd
      );
    }
    return {
      date: form.date,
      description: text(form.description),
      category: text(form.category),
      amount: Number(form.amount),
      status: form.status,
      recurring,
      recurrenceEnd,
      paidMonths,
    };
  }
  if (type === "aportes") {
    return {
      date: form.date,
      destination: text(form.destination),
      type: form.type,
      amount: Number(form.amount),
      goal: text(form.goal),
    };
  }
  return form;
}
export function getInstallmentRow(item, month) {
  const first = monthKeyFromDate(item.firstDue);
  const monthsFromStart = first ? monthDiff(first, month) : -1;
  const count = Math.max(Number(item.installments || 0), 0);
  const total = Math.max(Number(item.total || 0), 0);
  const monthly = count > 0 ? total / count : 0;
  const activeThisMonth =
    monthsFromStart >= 0 && monthsFromStart < count;
  const paidMonths = paidMonthsFromLegacy(item);
  const isPaid = paidMonths.includes(month);
  return {
    ...item,
    paidMonths,
    paidInstallments: paidMonths.length,
    monthly,
    monthsFromStart,
    installmentNumber: monthsFromStart + 1,
    activeThisMonth,
    isPaid,
    remainingInstallments: Math.max(
      count - paidMonths.length,
      0
    ),
  };
}
export function calculateFinanceForMonth(
  { rendas, parcelas, gastos, aportes },
  month
) {
  const monthIncomes = rendas
    .map((item) => getIncomeRow(item, month))
    .filter((item) => item.activeThisMonth);
  const received = monthIncomes.filter(
    (item) => item.status === "Recebida"
  );
  const pending = monthIncomes.filter(
    (item) => item.status === "Pendente"
  );
  const monthExpenseRows = gastos
    .map((item) => getExpenseRow(item, month))
    .filter((item) => item.activeThisMonth);
  const paidExpenses = monthExpenseRows.filter(
    (item) => item.status === "Pago"
  );
  const pendingExpenses = monthExpenseRows.filter(
    (item) => item.status === "Pendente"
  );
  const monthAllocations = aportes.filter(
    (item) => monthKeyFromDate(item.date) === month
  );
  const installmentRows = parcelas
    .map((item) => getInstallmentRow(item, month))
    .filter((item) => item.activeThisMonth);
  const receivedTotal = sum(received);
  const pendingTotal = sum(pending);
  const expensesTotal = sum(paidExpenses);
  const pendingExpensesTotal = sum(pendingExpenses);
  const installmentsTotal = sum(
    installmentRows,
    (x) => x.monthly
  );
  const allocationsTotal = sum(monthAllocations);
  const freeBeforeSaving =
    receivedTotal - expensesTotal - installmentsTotal;
  const finalBalance =
    freeBeforeSaving - allocationsTotal;

  // "Disponível agora" considera somente o que já entrou,
  // mas reserva também os gastos comuns que ainda estão pendentes.
  const availableNow =
    finalBalance - pendingExpensesTotal;

  // A previsão acrescenta as rendas que ainda estão a receber,
  // mantendo todos os compromissos e aportes do mês reservados.
  const monthForecast =
    availableNow + pendingTotal;

  const sourceMap = {};
  received.forEach((item) => {
    const source = item.source?.trim() || "Outros";
    sourceMap[source] =
      (sourceMap[source] || 0) + Number(item.amount || 0);
  });
  const incomeBySource = Object.entries(sourceMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  const destinationData = [
    { name: "Parcelas", value: installmentsTotal },
    { name: "Gastos", value: expensesTotal },
    { name: "Guardado", value: allocationsTotal },
    { name: "Livre", value: Math.max(finalBalance, 0) },
  ].filter((x) => x.value > 0);
  return {
    monthIncomes,
    monthExpenses: monthExpenseRows,
    receivedTotal,
    pendingTotal,
    expensesTotal,
    pendingExpensesTotal,
    installmentsTotal,
    allocationsTotal,
    freeBeforeSaving,
    finalBalance,
    availableNow,
    monthForecast,
    installmentRows,
    incomeBySource,
    destinationData,
  };
}
export function filterMonthCollections(data, month) {
  return {
    rendas: data.rendas
      .map((item) => getIncomeRow(item, month))
      .filter((item) => item.activeThisMonth),
    gastos: data.gastos
      .map((item) => getExpenseRow(item, month))
      .filter((item) => item.activeThisMonth),
    aportes: data.aportes.filter(
      (item) => monthKeyFromDate(item.date) === month
    ),
    parcelas: data.parcelas
      .map((item) => getInstallmentRow(item, month))
      .filter((item) => item.activeThisMonth),
  };
}
function addRecurringMonthsToSet(months, item) {
  const start = recurrenceStartMonth(item);
  if (!start) return;
  if (!item?.recurring) {
    months.add(start);
    return;
  }
  const today = currentMonth();
  const end = recurrenceEndMonth(item);
  const lastMonth =
    end && end < today ? end : today;
  if (start > lastMonth) return;
  let month = start;
  let count = 0;
  while (
    month <= lastMonth &&
    count < MAX_RECURRING_MONTHS
  ) {
    months.add(month);
    month = addMonthsToKey(month, 1);
    count += 1;
  }
}
export function buildHistoryRows(data) {
  const months = new Set([currentMonth()]);
  data.rendas.forEach((item) =>
    addRecurringMonthsToSet(months, item)
  );
  data.gastos.forEach((item) =>
    addRecurringMonthsToSet(months, item)
  );
  data.aportes.forEach((item) =>
    months.add(monthKeyFromDate(item.date))
  );
  data.parcelas.forEach((item) => {
    const first = monthKeyFromDate(item.firstDue);
    const count = Math.min(
      Math.max(Number(item.installments || 0), 0),
      MAX_INSTALLMENTS
    );
    if (!first) return;
    for (let index = 0; index < count; index += 1) {
      months.add(addMonthsToKey(first, index));
    }
  });
  return [...months]
    .filter(Boolean)
    .filter((month) => month <= currentMonth())
    .sort((a, b) => b.localeCompare(a))
    .map((month) => ({
      month,
      ...calculateFinanceForMonth(data, month),
    }));
}
export function isFirstRun(data) {
  return (
    Object.values(COLLECTIONS).length > 0 &&
    data.rendas.length === 0 &&
    data.parcelas.length === 0 &&
    data.gastos.length === 0 &&
    data.aportes.length === 0
  );
}

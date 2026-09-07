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
      status: "Pago",
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

  return Array.from({ length: paidCount }, (_, index) => addMonthsToKey(first, index));
}

export function createFormFromItem(type, item, selectedMonth) {
  if (!item) return createEmptyForm(type, selectedMonth);

  if (type === "rendas") {
    return {
      date: item.date || dateForSelectedMonth(selectedMonth),
      description: item.description || "",
      source: item.source || "",
      type: item.type || "Fixa",
      amount: item.amount ?? "",
      status: item.status || "Recebida",
    };
  }

  if (type === "parcelas") {
    const paidMonths = paidMonthsFromLegacy(item);
    return {
      name: item.name || "",
      category: item.category || "",
      purchaseDate: item.purchaseDate || dateForSelectedMonth(selectedMonth),
      total: item.total ?? "",
      installments: item.installments ?? "",
      paidInstallments: paidMonths.length,
      paidMonths,
      firstDue: item.firstDue || dateForSelectedMonth(selectedMonth),
    };
  }

  if (type === "gastos") {
    return {
      date: item.date || dateForSelectedMonth(selectedMonth),
      description: item.description || "",
      category: item.category || "",
      amount: item.amount ?? "",
      status: item.status || "Pago",
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


const MAX_AMOUNT = 999999999.99;
const MAX_INSTALLMENTS = 120;

function text(value) {
  return String(value ?? "").trim();
}

function validDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
}

function validatePositiveAmount(errors, field, value, label) {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    errors[field] = `${label} deve ser maior que R$ 0,00.`;
  } else if (number > MAX_AMOUNT) {
    errors[field] = `${label} ultrapassa o limite permitido.`;
  }
}

export function validateFinanceForm(type, form, { isEditing = false } = {}) {
  const errors = {};

  if (type === "rendas") {
    if (!validDate(form.date)) errors.date = "Informe uma data válida.";
    if (!text(form.source)) errors.source = "Informe a fonte da renda.";
    if (text(form.source).length > 120) errors.source = "Use no máximo 120 caracteres.";
    if (text(form.description).length > 180) errors.description = "Use no máximo 180 caracteres.";
    if (!["Fixa", "Variável", "Extra"].includes(form.type)) errors.type = "Selecione um tipo válido.";
    if (!["Recebida", "Pendente"].includes(form.status)) errors.status = "Selecione um status válido.";
    validatePositiveAmount(errors, "amount", form.amount, "O valor");
  }

  if (type === "gastos") {
    if (!validDate(form.date)) errors.date = "Informe uma data válida.";
    if (!text(form.description)) errors.description = "Informe uma descrição.";
    if (text(form.description).length > 180) errors.description = "Use no máximo 180 caracteres.";
    if (text(form.category).length > 100) errors.category = "Use no máximo 100 caracteres.";
    if (!["Pago", "Pendente"].includes(form.status)) errors.status = "Selecione um status válido.";
    validatePositiveAmount(errors, "amount", form.amount, "O valor");
  }

  if (type === "aportes") {
    if (!validDate(form.date)) errors.date = "Informe uma data válida.";
    if (!text(form.destination)) errors.destination = "Informe o destino do valor.";
    if (text(form.destination).length > 120) errors.destination = "Use no máximo 120 caracteres.";
    if (text(form.goal).length > 180) errors.goal = "Use no máximo 180 caracteres.";
    if (!["Reserva", "Investimento"].includes(form.type)) errors.type = "Selecione um tipo válido.";
    validatePositiveAmount(errors, "amount", form.amount, "O valor");
  }

  if (type === "parcelas") {
    if (!text(form.name)) errors.name = "Informe o nome da compra.";
    if (text(form.name).length > 120) errors.name = "Use no máximo 120 caracteres.";
    if (text(form.category).length > 100) errors.category = "Use no máximo 100 caracteres.";
    if (!validDate(form.purchaseDate)) errors.purchaseDate = "Informe a data da compra.";
    if (!validDate(form.firstDue)) errors.firstDue = "Informe o primeiro vencimento.";

    if (validDate(form.purchaseDate) && validDate(form.firstDue) && form.firstDue < form.purchaseDate) {
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
      } else if (Number.isInteger(installments) && paid > installments) {
        errors.paidInstallments = "As parcelas pagas não podem superar o total.";
      }
    }
  }

  return errors;
}

export function normalizeForm(type, form, { isEditing = false } = {}) {
  if (type === "rendas") {
    return {
      date: form.date,
      description: text(form.description),
      source: text(form.source),
      type: form.type,
      amount: Number(form.amount),
      status: form.status,
    };
  }

  if (type === "parcelas") {
    const installments = Number(form.installments);
    const total = Number(form.total);
    let paidMonths = Array.isArray(form.paidMonths) ? form.paidMonths : [];

    // Em um novo cadastro, "Já pagas" importa uma compra em andamento.
    // Depois, os pagamentos ficam vinculados aos meses específicos.
    if (!isEditing) {
      const first = monthKeyFromDate(form.firstDue);
      const paidCount = Math.min(
        Math.max(Number(form.paidInstallments || 0), 0),
        installments
      );

      paidMonths = first
        ? Array.from({ length: paidCount }, (_, index) => addMonthsToKey(first, index))
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
    return {
      date: form.date,
      description: text(form.description),
      category: text(form.category),
      amount: Number(form.amount),
      status: form.status,
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
  const activeThisMonth = monthsFromStart >= 0 && monthsFromStart < count;
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
    remainingInstallments: Math.max(count - paidMonths.length, 0),
  };
}

export function calculateFinanceForMonth({ rendas, parcelas, gastos, aportes }, month) {
  const monthIncomes = rendas.filter((item) => monthKeyFromDate(item.date) === month);
  const received = monthIncomes.filter((item) => item.status === "Recebida");
  const pending = monthIncomes.filter((item) => item.status === "Pendente");

  const monthExpenses = gastos.filter(
    (item) => monthKeyFromDate(item.date) === month && item.status !== "Pendente"
  );

  const monthAllocations = aportes.filter(
    (item) => monthKeyFromDate(item.date) === month
  );

  const installmentRows = parcelas
    .map((item) => getInstallmentRow(item, month))
    .filter((item) => item.activeThisMonth);

  const receivedTotal = sum(received);
  const pendingTotal = sum(pending);
  const expensesTotal = sum(monthExpenses);
  const installmentsTotal = sum(installmentRows, (x) => x.monthly);
  const allocationsTotal = sum(monthAllocations);
  const freeBeforeSaving = receivedTotal - expensesTotal - installmentsTotal;
  const finalBalance = freeBeforeSaving - allocationsTotal;

  const sourceMap = {};
  received.forEach((item) => {
    const source = item.source?.trim() || "Outros";
    sourceMap[source] = (sourceMap[source] || 0) + Number(item.amount || 0);
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
    receivedTotal,
    pendingTotal,
    expensesTotal,
    installmentsTotal,
    allocationsTotal,
    freeBeforeSaving,
    finalBalance,
    installmentRows,
    incomeBySource,
    destinationData,
  };
}

export function filterMonthCollections(data, month) {
  return {
    rendas: data.rendas.filter((item) => monthKeyFromDate(item.date) === month),
    gastos: data.gastos.filter((item) => monthKeyFromDate(item.date) === month),
    aportes: data.aportes.filter((item) => monthKeyFromDate(item.date) === month),
    parcelas: data.parcelas
      .map((item) => getInstallmentRow(item, month))
      .filter((item) => item.activeThisMonth),
  };
}

export function buildHistoryRows(data) {
  const months = new Set([currentMonth()]);

  data.rendas.forEach((item) => months.add(monthKeyFromDate(item.date)));
  data.gastos.forEach((item) => months.add(monthKeyFromDate(item.date)));
  data.aportes.forEach((item) => months.add(monthKeyFromDate(item.date)));

  data.parcelas.forEach((item) => {
    const first = monthKeyFromDate(item.firstDue);
    const count = Math.min(Math.max(Number(item.installments || 0), 0), 120);
    if (!first) return;
    for (let index = 0; index < count; index += 1) {
      months.add(addMonthsToKey(first, index));
    }
  });

  return [...months]
    .filter(Boolean)
    .filter((month) => month <= currentMonth())
    .sort((a, b) => b.localeCompare(a))
    .map((month) => ({ month, ...calculateFinanceForMonth(data, month) }));
}

export function isFirstRun(data) {
  return Object.values(COLLECTIONS).length > 0 &&
    data.rendas.length === 0 &&
    data.parcelas.length === 0 &&
    data.gastos.length === 0 &&
    data.aportes.length === 0;
}

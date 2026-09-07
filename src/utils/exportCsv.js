import { filterMonthCollections, money } from "./finance";

function csvEscape(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function numberPt(value) {
  return Number(value || 0).toFixed(2).replace(".", ",");
}

export function exportMonthCsv(data, month) {
  const monthData = filterMonthCollections(data, month);
  const rows = [
    ["Tipo", "Data", "Descrição", "Categoria/Fonte", "Valor", "Status/Parcela"],
  ];

  monthData.rendas.forEach((item) => {
    rows.push([
      "Renda",
      item.date,
      item.description || item.source || "",
      item.source || "",
      numberPt(item.amount),
      item.status || "",
    ]);
  });

  monthData.gastos.forEach((item) => {
    rows.push([
      "Gasto",
      item.date,
      item.description || "",
      item.category || "",
      numberPt(item.amount),
      item.status || "",
    ]);
  });

  monthData.aportes.forEach((item) => {
    rows.push([
      "Guardar",
      item.date,
      item.destination || "",
      item.type || "",
      numberPt(item.amount),
      item.goal || "",
    ]);
  });

  monthData.parcelas.forEach((item) => {
    rows.push([
      "Parcela",
      item.firstDue,
      item.name || "",
      item.category || "",
      numberPt(item.monthly),
      `${item.installmentNumber}/${item.installments} · ${item.isPaid ? "Paga" : "Pendente"}`,
    ]);
  });

  const csv = "\uFEFF" + rows.map((row) => row.map(csvEscape).join(";")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `m-finance-os-${month}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);

  return {
    fileName: `m-finance-os-${month}.csv`,
    rows: Math.max(rows.length - 1, 0),
    summary: money.format(
      monthData.rendas.reduce((sum, item) => sum + Number(item.amount || 0), 0)
    ),
  };
}

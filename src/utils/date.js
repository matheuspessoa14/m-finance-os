export const monthLabel = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
});

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export function dateForSelectedMonth(month) {
  const current = today();
  if (month === current.slice(0, 7)) return current;
  return `${month}-01`;
}

export function monthKeyFromDate(date) {
  return String(date || "").slice(0, 7);
}

export function parseMonth(key) {
  if (!key) return new Date();
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

export function monthDiff(fromKey, toKey) {
  if (!fromKey || !toKey) return 0;
  const [fy, fm] = fromKey.split("-").map(Number);
  const [ty, tm] = toKey.split("-").map(Number);
  return (ty - fy) * 12 + (tm - fm);
}

export function addMonthsToKey(key, amount) {
  const date = parseMonth(key);
  date.setMonth(date.getMonth() + amount);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function buildMonthOptions() {
  const now = new Date();
  const result = [];

  for (let offset = 0; offset < 12; offset += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    result.push(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    );
  }

  return result;
}

export function formatDate(value) {
  if (!value) return "Sem data";
  const [y, m, d] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR").format(new Date(y, m - 1, d));
}

export function capitalize(text = "") {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
}

export const numberFormat = new Intl.NumberFormat("pt-BR");

export function formatNumber(value) {
  return numberFormat.format(value ?? 0);
}

export function formatDate(value) {
  if (!value) return "sem data";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(`${value}T12:00:00`));
}

export function slug(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function csvBlob(rows) {
  if (!rows.length) {
    return new Blob(["\ufeff"], {type: "text/csv;charset=utf-8"});
  }
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(";"),
    ...rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(";"))
  ];
  return new Blob([`\ufeff${lines.join("\n")}`], {type: "text/csv;charset=utf-8"});
}

function escapeCsv(value) {
  const normalized = String(value ?? "").replaceAll('"', '""');
  return /[;"\n]/.test(normalized) ? `"${normalized}"` : normalized;
}

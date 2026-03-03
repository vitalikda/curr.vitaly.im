export function formatCurrency(value: string | number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(Number(value));
  } catch {
    return String(value);
  }
}

export function parseDate(value: unknown): Date | null {
  const ms =
    typeof value === "number" && Number.isFinite(value)
      ? value
      : typeof value === "string"
        ? Date.parse(value)
        : Number.NaN;
  if (!Number.isFinite(ms)) return null;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return null;
  try {
    return date;
  } catch {
    return null;
  }
}

export function formatDate(isoDate?: string | null): string {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("T")[0].split("-");
  return `${d}.${m}.${y}`;
}

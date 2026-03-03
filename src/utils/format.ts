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

export function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("T")[0].split("-");
  return `${d}.${m}.${y}`;
}

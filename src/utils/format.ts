export function formatCurrency(value: string | number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(value));
}

export function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("T")[0].split("-");
  return `${d}.${m}.${y}`;
}

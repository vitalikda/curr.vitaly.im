export const formatCurrency = (value: string | number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(Number(value))
}

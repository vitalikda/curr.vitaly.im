export const getCurrencySymbol = (code: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: code,
    currencyDisplay: 'symbol',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
    .format(0)
    .replace(/\d/g, '')
}

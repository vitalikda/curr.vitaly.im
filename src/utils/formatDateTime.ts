export const formatDateTime = (timestamp: string | number) => {
  const date = new Date(timestamp).toISOString()
  const [year, month, day] = date.split('T')[0].split('-')
  return `${day}.${month}.${year}`
}

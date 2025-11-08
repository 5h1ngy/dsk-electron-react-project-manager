export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) {
    return 'Data non disponibile'
  }
  return date.toLocaleString()
}

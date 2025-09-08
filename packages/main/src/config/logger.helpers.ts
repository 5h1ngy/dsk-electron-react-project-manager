export const padNumber = (value: number, size = 2): string => value.toString().padStart(size, '0')

export const formatLogContext = (context?: string): string => {
  if (!context) {
    return ''
  }
  return ` [${context}]`
}


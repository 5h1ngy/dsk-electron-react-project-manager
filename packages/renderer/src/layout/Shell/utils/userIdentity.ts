const COLORS = ['#9254de', '#fa8c16', '#13c2c2', '#f759ab'] as const

const getInitialCharacter = (segment: string): string =>
  segment.trim().charAt(0)?.toUpperCase() ?? ''

export const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return ''
  }
  if (parts.length === 1) {
    return getInitialCharacter(parts[0])
  }
  return `${getInitialCharacter(parts[0])}${getInitialCharacter(parts[parts.length - 1])}`
}

export const pickColor = (text: string): string => {
  if (!text) {
    return COLORS[0]
  }
  const sum = [...text].reduce((accumulator, char) => accumulator + char.charCodeAt(0), 0)
  return COLORS[sum % COLORS.length]
}


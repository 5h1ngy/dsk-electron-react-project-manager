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

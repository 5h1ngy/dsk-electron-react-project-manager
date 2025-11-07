const getInitialCharacter = (segment?: string | null): string =>
  segment?.trim().charAt(0)?.toUpperCase() ?? ''

export const getInitials = (name?: string | null): string => {
  if (!name) {
    return ''
  }
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return ''
  }
  if (parts.length === 1) {
    return getInitialCharacter(parts[0])
  }
  return `${getInitialCharacter(parts[0])}${getInitialCharacter(parts[parts.length - 1])}`
}

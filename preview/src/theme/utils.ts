const clamp = (value: number, min = 0, max = 255) => Math.min(max, Math.max(min, value))

const parseHex = (value: string): [number, number, number] => {
  const clean = value.replace('#', '').trim()
  const normalized =
    clean.length === 3 ? clean.split('').map((char) => char.repeat(2)).join('') : clean.padEnd(6, '0')
  return [
    parseInt(normalized.substring(0, 2), 16),
    parseInt(normalized.substring(2, 4), 16),
    parseInt(normalized.substring(4, 6), 16)
  ]
}

const parseRgbString = (value: string): [number, number, number] | null => {
  const match = value.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i)
  if (!match) {
    return null
  }
  return [Number.parseInt(match[1], 10), Number.parseInt(match[2], 10), Number.parseInt(match[3], 10)]
}

const resolveRgb = (value: string): [number, number, number] => {
  if (!value) {
    return [0, 0, 0]
  }
  if (value.trim().startsWith('#')) {
    return parseHex(value)
  }
  const parsed = parseRgbString(value)
  return parsed ?? [0, 0, 0]
}

const formatHex = (components: number[]): string =>
  `#${components.map((value) => clamp(value).toString(16).padStart(2, '0')).join('')}`

const mixColor = (color: string, amount: number, target: string): string => {
  const [sr, sg, sb] = resolveRgb(color)
  const [tr, tg, tb] = resolveRgb(target)

  const blend = (source: number, destination: number) =>
    Math.round(source + (destination - source) * amount)

  return formatHex([blend(sr, tr), blend(sg, tg), blend(sb, tb)])
}

export const lighten = (color: string, amount: number) => mixColor(color, amount, '#ffffff')
export const darken = (color: string, amount: number) => mixColor(color, amount, '#000000')
export const transparentize = (color: string, alpha: number) => {
  const normalizedAlpha = Math.min(1, Math.max(0, alpha))
  const [r, g, b] = resolveRgb(color)
  return `rgba(${r}, ${g}, ${b}, ${normalizedAlpha})`
}

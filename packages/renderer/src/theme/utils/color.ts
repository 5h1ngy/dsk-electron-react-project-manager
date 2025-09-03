const clamp = (value: number, min = 0, max = 255) => Math.min(max, Math.max(min, value))

const toRgb = (hex: string): [number, number, number] => {
  const clean = hex.replace('#', '')
  return [
    parseInt(clean.substring(0, 2), 16),
    parseInt(clean.substring(2, 4), 16),
    parseInt(clean.substring(4, 6), 16)
  ]
}

const formatHex = (components: number[]): string =>
  `#${components.map((value) => clamp(value).toString(16).padStart(2, '0')).join('')}`

export const mixColor = (color: string, amount: number, target: string): string => {
  const [sr, sg, sb] = toRgb(color)
  const [tr, tg, tb] = toRgb(target)

  const blend = (source: number, destination: number) =>
    Math.round(source + (destination - source) * amount)

  return formatHex([blend(sr, tr), blend(sg, tg), blend(sb, tb)])
}

export const lighten = (color: string, amount: number) => mixColor(color, amount, '#ffffff')
export const darken = (color: string, amount: number) => mixColor(color, amount, '#000000')

import type { ThemeMode } from '@renderer/store/slices/theme'
import { darken, lighten } from '@renderer/theme/utils/color'

import type { PaletteTokens } from '@renderer/theme/foundations/palette'

export interface BrandTokens {
  primary: string
  primaryHover: string
  primaryActive: string
  primarySubtle: string
  primarySurface: string
  onPrimary: string
  secondary: string
  secondaryHover: string
  secondaryActive: string
  secondarySurface: string
  secondaryBorder: string
  onSecondary: string
}

export const ACCENT_PRESETS = [
  '#2563EB',
  '#6366F1',
  '#0EA5E9',
  '#10B981',
  '#F97316',
  '#F43F5E'
] as const

export const buildBrandTokens = (
  accentColor: string,
  palette: PaletteTokens,
  mode: ThemeMode
): BrandTokens => {
  const primary = accentColor
  const primaryHover = lighten(accentColor, 0.12)
  const primaryActive = darken(accentColor, 0.18)

  const primarySurface = mode === 'dark' ? darken(accentColor, 0.6) : lighten(accentColor, 0.58)
  const secondaryBase = mode === 'dark' ? lighten(accentColor, 0.32) : darken(accentColor, 0.15)
  const secondaryHover =
    mode === 'dark' ? lighten(secondaryBase, 0.08) : darken(secondaryBase, 0.08)
  const secondaryActive =
    mode === 'dark' ? darken(secondaryBase, 0.08) : darken(secondaryBase, 0.16)
  const secondarySurface = mode === 'dark' ? darken(accentColor, 0.45) : lighten(accentColor, 0.45)
  const secondaryBorder = mode === 'dark' ? darken(accentColor, 0.3) : lighten(accentColor, 0.28)

  return {
    primary,
    primaryHover,
    primaryActive,
    primarySubtle: mode === 'dark' ? darken(accentColor, 0.3) : lighten(accentColor, 0.2),
    primarySurface,
    onPrimary: resolveAccentForeground(accentColor, palette, mode),
    secondary: secondaryBase,
    secondaryHover,
    secondaryActive,
    secondarySurface,
    secondaryBorder,
    onSecondary: resolveAccentForeground(secondaryBase, palette, mode)
  }
}

const HEX_LENGTH = 6

const parseChannel = (segment: string) => parseInt(segment, 16)

const toChannels = (hex: string) => {
  const normalized = hex.replace('#', '')
  if (normalized.length !== HEX_LENGTH) {
    return { r: 255, g: 255, b: 255 }
  }
  const r = parseChannel(normalized.slice(0, 2))
  const g = parseChannel(normalized.slice(2, 4))
  const b = parseChannel(normalized.slice(4, 6))
  return { r, g, b }
}

export const resolveAccentForeground = (
  accentColor: string,
  palette: PaletteTokens,
  mode: ThemeMode
) => {
  if (mode === 'dark') {
    return palette.textOnDark
  }

  const { r, g, b } = toChannels(accentColor)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 140 ? palette.textOnBright : palette.textOnDark
}

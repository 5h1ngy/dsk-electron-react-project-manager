import type { CSSProperties } from 'react'

import type { ThemeButtonStyleDependencies } from '@renderer/components/ThemeControls.types'

export const ACCENT_COLORS = ['#00F5D4', '#00D4FF', '#5BFF70', '#FF00C8', '#FFB400', '#C0FF00'] as const

const HEX_PAIR_LENGTH = 2

const parseChannel = (segment: string): number => parseInt(segment, 16)

const extractRgbChannels = (hexColor: string): [number, number, number] => {
  const sanitized = hexColor.replace('#', '')

  if (sanitized.length !== 6) {
    return [255, 255, 255]
  }

  const r = parseChannel(sanitized.substring(0, HEX_PAIR_LENGTH))
  const g = parseChannel(sanitized.substring(HEX_PAIR_LENGTH, HEX_PAIR_LENGTH * 2))
  const b = parseChannel(sanitized.substring(HEX_PAIR_LENGTH * 2, HEX_PAIR_LENGTH * 3))

  return [r, g, b]
}

export const resolveAccentForeground = (accentColor: string): string => {
  const [r, g, b] = extractRgbChannels(accentColor)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 140 ? '#0f172a' : '#ffffff'
}

export const buildThemeButtonStyle = ({
  accentColor,
  iconColor
}: ThemeButtonStyleDependencies): CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  paddingInline: 16,
  height: 40,
  borderRadius: 16,
  background: accentColor,
  borderColor: accentColor,
  boxShadow: '0 10px 24px rgba(15, 23, 42, 0.18)',
  color: iconColor,
  fontWeight: 600
})

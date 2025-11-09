import type { ThemeConfig } from 'antd'
import { theme as antdTheme } from 'antd'

import type { ThemeMode } from './foundations/palette'
import { resolvePalette } from './foundations/palette'
import { buildBrandTokens } from './foundations/brand'
import { buildSpacingTokens } from './foundations/spacing'
import { buildShapeTokenOverrides } from './foundations/shape'
import { buildTypographyTokens } from './foundations/typography'
import { buildShadowTokens } from './foundations/shadow'

const { darkAlgorithm, defaultAlgorithm } = antdTheme

export const ACCENT_OPTIONS = ['#ff7b4f', '#f97316', '#f43f5e', '#4c6fff']

export const createThemeConfig = (mode: ThemeMode, accentColor: string): ThemeConfig => {
  const palette = resolvePalette(mode)
  const brand = buildBrandTokens(accentColor, palette, mode)
  const spacing = buildSpacingTokens()
  const shape = buildShapeTokenOverrides()
  const typography = buildTypographyTokens()
  const shadow = buildShadowTokens()

  const token = {
    ...spacing,
    ...shape,
    ...typography,
    ...shadow,
    colorPrimary: brand.primary,
    colorPrimaryHover: brand.primaryHover,
    colorPrimaryActive: brand.primaryActive,
    colorInfo: brand.secondary,
    colorInfoHover: brand.secondaryHover,
    colorInfoActive: brand.secondaryActive,
    colorBgBase: mode === 'dark' ? '#040614' : '#f5f7ff',
    colorBgLayout: mode === 'dark' ? '#040614' : '#f5f7ff',
    colorBgContainer: mode === 'dark' ? '#0c1020' : '#ffffff',
    colorBgElevated: mode === 'dark' ? '#111525' : '#ffffff',
    colorTextBase: mode === 'dark' ? '#ffffff' : '#0a0d1c',
    colorTextSecondary: mode === 'dark' ? '#cbd5ff' : '#4b4f68',
    colorBorder: mode === 'dark' ? '#1f2435' : '#e4e8ff',
    colorBorderSecondary: mode === 'dark' ? '#2a2f44' : '#d5dbff',
    colorBgMask: mode === 'dark' ? 'rgba(5,6,12,0.85)' : 'rgba(245,247,255,0.95)',
    colorLink: brand.primary,
    colorLinkHover: brand.primaryHover,
    colorLinkActive: brand.primaryActive,
    controlOutline: brand.primaryHover
  }

  return {
    algorithm: mode === 'dark' ? [darkAlgorithm] : [defaultAlgorithm],
    token
  }
}

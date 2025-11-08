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

export const ACCENT_OPTIONS = ['#2563EB', '#6366F1', '#0EA5E9', '#10B981', '#F97316', '#F43F5E']

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
    colorBgBase: palette.surfaceBase,
    colorBgLayout: palette.surfaceApp,
    colorBgContainer: palette.surfaceContainer,
    colorBgElevated: palette.surfaceElevated,
    colorTextBase: palette.textPrimary,
    colorTextSecondary: palette.textSecondary,
    colorBorder: palette.borderSubtle,
    colorBorderSecondary: palette.borderStrong,
    colorBgMask: palette.surfaceBackdrop,
    colorLink: brand.primary,
    colorLinkHover: brand.primaryHover,
    colorLinkActive: brand.primaryActive,
    controlOutline: brand.primaryHover,
    brandPrimary: brand.primary,
    brandPrimarySurface: brand.primarySurface,
    brandOnPrimary: brand.onPrimary,
    brandSecondary: brand.secondary,
    brandSecondarySurface: brand.secondarySurface,
    brandSecondaryBorder: brand.secondaryBorder,
    brandOnSecondary: brand.onSecondary
  }

  return {
    algorithm: mode === 'dark' ? [darkAlgorithm] : [defaultAlgorithm],
    token
  }
}

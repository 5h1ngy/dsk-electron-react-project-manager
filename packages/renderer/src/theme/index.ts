import type { ThemeConfig } from 'antd'
import { theme as antdTheme } from 'antd'

import type { ThemeMode } from '@renderer/store/slices/theme'

import { buildDarkComponents } from '@renderer/theme/components/dark'
import { buildLightComponents } from '@renderer/theme/components/light'
import { buildBrandTokens } from '@renderer/theme/foundations/brand'
import { buildShadowTokens } from '@renderer/theme/foundations/shadow'
import { buildSpacingTokens, spacingScale } from '@renderer/theme/foundations/spacing'
import { buildShapeTokenOverrides, shapeTokens } from '@renderer/theme/foundations/shape'
import { buildTypographyTokens } from '@renderer/theme/foundations/typography'
import { resolvePalette } from '@renderer/theme/foundations/palette'

const { darkAlgorithm, defaultAlgorithm } = antdTheme

export const createThemeConfig = (mode: ThemeMode, accentColor: string): ThemeConfig => {
  const palette = resolvePalette(mode)
  const brand = buildBrandTokens(accentColor, palette, mode)
  const spacing = buildSpacingTokens()
  const shapeOverrides = buildShapeTokenOverrides()
  const typography = buildTypographyTokens()
  const shadow = buildShadowTokens()

  const tokenOverrides = {
    ...spacing,
    ...shapeOverrides,
    ...typography,
    ...shadow,
    colorPrimary: brand.primary,
    colorPrimaryHover: brand.primaryHover,
    colorPrimaryActive: brand.primaryActive,
    colorInfo: brand.secondary,
    colorInfoHover: brand.secondaryHover,
    colorInfoActive: brand.secondaryActive,
    colorInfoBg: brand.secondarySurface,
    colorInfoText: brand.onSecondary,
    colorLink: brand.primary,
    colorLinkHover: brand.primaryHover,
    colorLinkActive: brand.primaryActive,
    colorTextSelection: brand.primarySubtle,
    colorTextLightSolid: brand.onPrimary,
    controlOutline: brand.primaryHover,
    colorBgBase: palette.surfaceApp,
    colorBgLayout: palette.surfaceApp,
    colorBgContainer: palette.surfaceContainer,
    colorBgElevated: palette.surfaceElevated,
    colorBgSpotlight: palette.surfaceMuted,
    colorFillSecondary: brand.secondarySurface,
    colorTextBase: palette.textPrimary,
    colorTextSecondary: palette.textSecondary,
    colorTextHeading: palette.textPrimary,
    colorBorder: palette.borderSubtle,
    colorBorderSecondary: brand.secondaryBorder,
    colorSplit: palette.borderStrong,
    colorBgMask: palette.surfaceBackdrop,
    motionDurationMid: '0.22s',
    brandPrimary: brand.primary,
    brandPrimarySurface: brand.primarySurface,
    brandOnPrimary: brand.onPrimary,
    brandSecondary: brand.secondary,
    brandSecondaryHover: brand.secondaryHover,
    brandSecondaryActive: brand.secondaryActive,
    brandSecondarySurface: brand.secondarySurface,
    brandSecondaryBorder: brand.secondaryBorder,
    brandOnSecondary: brand.onSecondary
  }

  return {
    algorithm: mode === 'dark' ? [darkAlgorithm] : [defaultAlgorithm],
    token: tokenOverrides,
    components:
      mode === 'dark'
        ? buildDarkComponents(palette, brand, spacingScale, shapeTokens)
        : buildLightComponents(palette, brand, spacingScale, shapeTokens)
  }
}

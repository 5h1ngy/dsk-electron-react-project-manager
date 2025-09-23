import type { ThemeConfig } from 'antd'

import type { BrandTokens } from '@renderer/theme/foundations/brand'
import type { PaletteTokens } from '@renderer/theme/foundations/palette'
import type { ShapeTokens } from '@renderer/theme/foundations/shape'
import type { SpacingScale } from '@renderer/theme/foundations/spacing'
import { darken, lighten } from '@renderer/theme/utils/color'

export const buildLightComponents = (
  palette: PaletteTokens,
  brand: BrandTokens,
  spacing: SpacingScale,
  shape: ShapeTokens
): ThemeConfig['components'] => ({
  Layout: {
    headerBg: palette.surfaceContainer,
    headerColor: palette.textPrimary,
    siderBg: palette.surfaceBase,
    footerBg: palette.surfaceContainer,
    bodyBg: palette.surfaceBase
  },
  Card: {
    colorBgContainer: palette.surfaceContainer,
    colorBorderSecondary: palette.borderStrong,
    boxShadow: '0 18px 48px rgba(15, 23, 42, 0.12)',
    headerBg: palette.surfaceContainer
  },
  Modal: {
    headerBg: palette.surfaceContainer,
    contentBg: palette.surfaceContainer
  },
  Input: {
    hoverBorderColor: brand.primaryHover,
    activeBorderColor: brand.primary,
    addonBg: palette.surfaceMuted,
    paddingInline: spacing.md,
    paddingInlineSM: spacing.sm,
    paddingInlineLG: spacing.lg
  },
  Select: {
    optionSelectedBg: lighten(brand.primary, 0.55),
    optionActiveBg: lighten(brand.primary, 0.65),
    optionSelectedColor: darken(brand.primary, 0.35),
    optionSelectedFontWeight: 600,
    optionPadding: `${spacing.sm}px ${spacing.md}px`
  },
  Tag: {
    defaultBg: lighten(brand.primary, 0.45),
    defaultColor: darken(brand.primary, 0.25)
  },
  Table: {
    headerBg: lighten(palette.surfaceBase, 0.02),
    headerColor: palette.textPrimary,
    headerSortActiveBg: lighten(brand.primary, 0.55),
    rowHoverBg: lighten(brand.primary, 0.65),
    rowSelectedBg: lighten(brand.primary, 0.55),
    borderColor: palette.borderStrong,
    cellPaddingBlock: spacing.md,
    cellPaddingInline: spacing.lg
  },
  Tabs: {
    itemColor: palette.textSecondary,
    itemHoverColor: palette.textPrimary,
    inkBarColor: brand.primary,
    horizontalItemPadding: `${spacing.sm}px ${spacing.md}px`
  },
  Pagination: {
    itemBg: palette.surfaceContainer,
    itemActiveBg: brand.primary,
    itemActiveColor: brand.onPrimary,
    itemInputBg: palette.surfaceContainer,
    itemSize: shape.controlHeightSM
  },
  Segmented: {
    itemColor: palette.textSecondary,
    itemHoverColor: palette.textPrimary,
    itemHoverBg: lighten(brand.primary, 0.6),
    itemSelectedBg: brand.primary,
    itemSelectedColor: brand.onPrimary,
    trackBg: lighten(palette.surfaceBase, 0.06),
    trackPadding: 2
  },
  Switch: {
    colorPrimary: brand.primary,
    colorPrimaryHover: brand.primaryHover,
    handleBg: palette.surfaceContainer,
    handleShadow: '0 4px 8px rgba(15, 23, 42, 0.12)',
    handleSize: 20,
    trackHeight: 24,
    trackMinWidth: 44,
    trackPadding: 3,
    innerMinMargin: 6,
    innerMaxMargin: 12
  },
  Menu: {
    itemBorderRadius: shape.radius,
    itemPaddingInline: spacing.md,
    itemMarginInline: 0,
    itemMarginBlock: spacing.xs,
    itemColor: palette.textSecondary,
    itemHoverColor: palette.textPrimary,
    itemHoverBg: lighten(brand.primary, 0.7),
    itemSelectedBg: brand.primary,
    itemSelectedColor: brand.onPrimary,
    itemActiveBg: lighten(brand.primary, 0.6)
  },
  Typography: {
    titleMarginBottom: spacing.md
  }
})




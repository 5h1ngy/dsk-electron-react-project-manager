import type { ThemeConfig } from 'antd'

import type { BrandTokens } from '@renderer/theme/foundations/brand'
import type { PaletteTokens } from '@renderer/theme/foundations/palette'
import type { ShapeTokens } from '@renderer/theme/foundations/shape'
import type { SpacingScale } from '@renderer/theme/foundations/spacing'
import { darken, lighten } from '@renderer/theme/utils/color'

export const buildDarkComponents = (
  palette: PaletteTokens,
  brand: BrandTokens,
  spacing: SpacingScale,
  shape: ShapeTokens
): ThemeConfig['components'] => ({
  Layout: {
    headerBg: palette.surfaceContainer,
    headerColor: palette.textPrimary,
    siderBg: palette.surfaceElevated,
    footerBg: palette.surfaceContainer,
    bodyBg: palette.surfaceBase
  },
  Card: {
    colorBgContainer: palette.surfaceElevated,
    colorBorderSecondary: palette.borderStrong,
    boxShadow: '0 24px 48px rgba(2, 6, 23, 0.45)',
    headerBg: palette.surfaceElevated
  },
  Modal: {
    headerBg: palette.surfaceElevated,
    contentBg: palette.surfaceElevated
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
    optionSelectedBg: darken(brand.primary, 0.55),
    optionActiveBg: darken(brand.primary, 0.6),
    optionSelectedColor: lighten(brand.primary, 0.4),
    optionSelectedFontWeight: 600,
    optionPadding: `${spacing.sm}px ${spacing.md}px`
  },
  Tag: {
    defaultBg: darken(brand.primary, 0.45),
    defaultColor: lighten(brand.primary, 0.6)
  },
  Table: {
    headerBg: darken(palette.surfaceElevated, 0.08),
    headerColor: palette.textPrimary,
    headerSortActiveBg: darken(brand.primary, 0.55),
    rowHoverBg: darken(brand.primary, 0.68),
    rowSelectedBg: darken(brand.primary, 0.58),
    borderColor: palette.borderStrong,
    cellPaddingBlock: spacing.md,
    cellPaddingInline: spacing.lg,
    colorText: palette.textPrimary,
    colorTextHeading: palette.textPrimary,
    colorTextSecondary: palette.textSecondary
  },
  Tabs: {
    itemColor: palette.textSecondary,
    itemHoverColor: palette.textPrimary,
    itemActiveColor: brand.onPrimary,
    inkBarColor: brand.primary,
    horizontalItemPadding: `${spacing.sm}px ${spacing.md}px`
  },
  Pagination: {
    itemBg: palette.surfaceElevated,
    itemActiveBg: brand.primary,
    itemActiveColor: brand.onPrimary,
    itemInputBg: palette.surfaceContainer,
    itemSize: shape.controlHeightSM
  },
  Segmented: {
    itemColor: palette.textSecondary,
    itemHoverColor: palette.textPrimary,
    itemHoverBg: darken(brand.primary, 0.55),
    itemSelectedBg: darken(brand.primary, 0.5),
    itemSelectedColor: brand.onPrimary,
    trackBg: palette.surfaceElevated,
    trackPadding: 2
  },
  Switch: {
    handleBg: palette.surfaceElevated,
    handleShadow: '0 4px 10px rgba(2, 6, 23, 0.45)',
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
    itemSelectedBg: darken(brand.primary, 0.5),
    itemSelectedColor: brand.onPrimary,
    itemActiveBg: darken(brand.primary, 0.45)
  },
  Typography: {
    titleMarginBottom: spacing.md,
    colorText: palette.textPrimary,
    colorTextDescription: palette.textSecondary
  }
})

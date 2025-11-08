export interface SpacingScale {
  xxs: number
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  xxl: number
  xxxl: number
}

export const spacingScale: SpacingScale = {
  xxs: 4,
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32
}

export const buildSpacingTokens = () => ({
  sizeUnit: spacingScale.xxs,
  sizeStep: 4,
  paddingXXS: spacingScale.xxs,
  paddingXS: spacingScale.xs,
  paddingSM: spacingScale.sm,
  padding: spacingScale.md,
  paddingMD: spacingScale.md,
  paddingLG: spacingScale.lg,
  paddingXL: spacingScale.xl,
  paddingContentHorizontalLG: spacingScale.xl,
  paddingContentHorizontal: spacingScale.md,
  marginXXS: spacingScale.xxs,
  marginXS: spacingScale.xs,
  marginSM: spacingScale.sm,
  margin: spacingScale.md,
  marginMD: spacingScale.md,
  marginLG: spacingScale.lg,
  marginXL: spacingScale.xl,
  marginXXL: spacingScale.xxl,
  marginXXXL: spacingScale.xxxl,
  controlPaddingHorizontal: spacingScale.md,
  controlPaddingHorizontalSM: spacingScale.sm,
  controlPaddingHorizontalLG: spacingScale.lg
})

import type { ThemeConfig } from 'antd'
import { darken, lighten } from '@renderer/theme/utils/color'

export type SharedTokenOverrides = Partial<ThemeConfig['token']> & {
  colorPrimary: string
  colorPrimaryHover: string
  colorPrimaryActive: string
  colorInfo: string
  colorLink: string
  colorLinkHover: string
  colorLinkActive: string
  colorTextSelection: string
  controlOutline: string
  borderRadius: number
  borderRadiusLG: number
  borderRadiusSM: number
  controlHeight: number
  controlHeightSM: number
  controlHeightLG: number
  controlPaddingHorizontal: number
  controlPaddingHorizontalSM: number
  controlRadius: number
  fontFamily: string
  fontSize: number
  fontSizeLG: number
  fontSizeHeading1: number
  fontSizeHeading2: number
  fontSizeHeading3: number
  fontSizeHeading4: number
  fontSizeHeading5: number
  lineHeight: number
  lineHeightHeading1: number
  lineHeightHeading2: number
  lineHeightHeading3: number
  lineHeightHeading4: number
  lineHeightHeading5: number
  sizeUnit: number
  sizeStep: number
  sizePopupArrow: number
  motionDurationMid: string
  boxShadowSecondary: string
}

export const buildSharedTokens = (accentColor: string): SharedTokenOverrides => {
  const hover = lighten(accentColor, 0.15)
  const active = darken(accentColor, 0.2)

  return {
    colorPrimary: accentColor,
    colorPrimaryHover: hover,
    colorPrimaryActive: active,
    colorInfo: accentColor,
    colorLink: accentColor,
    colorLinkHover: hover,
    colorLinkActive: active,
    colorTextSelection: lighten(accentColor, 0.35),
    controlOutline: hover,
    borderRadius: 12,
    borderRadiusLG: 18,
    borderRadiusSM: 10,
    controlHeight: 48,
    controlHeightSM: 40,
    controlHeightLG: 56,
    controlPaddingHorizontal: 18,
    controlPaddingHorizontalSM: 14,
    controlRadius: 14,
    fontFamily: `Inter, "SF Pro Display", "Segoe UI", system-ui, -apple-system, sans-serif`,
    fontSize: 16,
    fontSizeLG: 18,
    fontSizeHeading1: 40,
    fontSizeHeading2: 32,
    fontSizeHeading3: 26,
    fontSizeHeading4: 22,
    fontSizeHeading5: 18,
    lineHeight: 1.6,
    lineHeightHeading1: 1.2,
    lineHeightHeading2: 1.25,
    lineHeightHeading3: 1.3,
    lineHeightHeading4: 1.35,
    lineHeightHeading5: 1.4,
    sizeUnit: 6,
    sizeStep: 6,
    sizePopupArrow: 18,
    motionDurationMid: '0.25s',
    boxShadowSecondary: '0 18px 48px rgba(15, 23, 42, 0.18)'
  }
}

export const extractAccentVariants = (sharedTokens: SharedTokenOverrides) => ({
  accent: sharedTokens.colorPrimary,
  hover: sharedTokens.colorPrimaryHover,
  active: sharedTokens.colorPrimaryActive
})

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
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    controlHeight: 42,
    controlHeightSM: 36,
    controlHeightLG: 50,
    controlPaddingHorizontal: 14,
    controlPaddingHorizontalSM: 12,
    controlRadius: 10,
    fontFamily: `Inter, "SF Pro Display", "Segoe UI", system-ui, -apple-system, sans-serif`,
    fontSize: 15,
    fontSizeLG: 17,
    fontSizeHeading1: 36,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 17,
    lineHeight: 1.5,
    lineHeightHeading1: 1.18,
    lineHeightHeading2: 1.22,
    lineHeightHeading3: 1.28,
    lineHeightHeading4: 1.32,
    lineHeightHeading5: 1.35,
    sizeUnit: 5,
    sizeStep: 5,
    sizePopupArrow: 14,
    motionDurationMid: '0.22s',
    boxShadowSecondary: '0 12px 32px rgba(15, 23, 42, 0.16)'
  }
}

export const extractAccentVariants = (sharedTokens: SharedTokenOverrides) => ({
  accent: sharedTokens.colorPrimary,
  hover: sharedTokens.colorPrimaryHover,
  active: sharedTokens.colorPrimaryActive
})

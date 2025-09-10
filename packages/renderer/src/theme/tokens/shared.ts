import { darken, lighten } from '@renderer/theme/utils/color'

export interface SharedTokenOverrides {
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
    borderRadiusSM: 6
  }
}

export const extractAccentVariants = (sharedTokens: SharedTokenOverrides) => ({
  accent: sharedTokens.colorPrimary,
  hover: sharedTokens.colorPrimaryHover,
  active: sharedTokens.colorPrimaryActive
})

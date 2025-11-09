import type { GlobalToken } from 'antd/es/theme/interface'

import type { ThemeMode } from './foundations/palette'
import { darken, lighten, transparentize } from './utils'

export interface SurfacePalette {
  pageBackground: string
  pageSolid: string
  heroBackdrop: string
  trayBackground: string
  trayBorder: string
  trayShadow: string
  pillBackground: string
  pillBorder: string
  pillShadow: string
  mockupCardBackground: string
  mockupImageBackground: string
}

export const buildSurfacePalette = (
  token: GlobalToken,
  mode: ThemeMode,
  accent: string
): SurfacePalette => {
  const base = mode === 'dark' ? token.colorBgBase : token.colorBgContainer
  const elevated = token.colorBgElevated
  const overlay =
    mode === 'dark' ? darken(elevated, 0.1) : lighten(elevated, 0.15)
  const accentGlow = transparentize(lighten(accent, 0.25), mode === 'dark' ? 0.22 : 0.32)
  const accentMist = transparentize(darken(accent, 0.08), mode === 'dark' ? 0.28 : 0.2)
  const gridColor = transparentize(
    mode === 'dark' ? token.colorTextLightSolid ?? '#ffffff' : token.colorTextBase,
    mode === 'dark' ? 0.04 : 0.06
  )
  const gridAngle = mode === 'dark' ? 125 : 120
  const gridSpacing = mode === 'dark' ? 18 : 16
  const heroBackdrop = `
    radial-gradient(circle at 15% 20%, ${accentGlow}, transparent 55%),
    radial-gradient(circle at 85% 8%, ${accentMist}, transparent 50%),
    repeating-linear-gradient(${gridAngle}deg, ${gridColor}, ${gridColor} 2px, transparent 2px, transparent ${gridSpacing}px),
    linear-gradient(135deg, ${base} 0%, ${overlay} 100%)`
  const pageSolid =
    mode === 'dark' ? darken(base, 0.05) : lighten(base, 0.03)

  const trayBackground = transparentize(
    mode === 'dark' ? darken(elevated, 0.2) : lighten(elevated, 0.08),
    mode === 'dark' ? 0.92 : 0.86
  )
  const trayBorder = mode === 'dark' ? token.colorBorder : token.colorBorderSecondary
  const trayShadow = mode === 'dark' ? token.boxShadowSecondary : token.boxShadow

  const pillBackground = transparentize(
    mode === 'dark' ? lighten(elevated, 0.12) : darken(elevated, 0.04),
    mode === 'dark' ? 0.8 : 0.9
  )

  return {
    pageBackground: heroBackdrop,
    pageSolid,
    heroBackdrop,
    trayBackground,
    trayBorder,
    trayShadow,
    pillBackground,
    pillBorder: trayBorder,
    pillShadow: trayShadow,
    mockupCardBackground: overlay,
    mockupImageBackground: mode === 'dark' ? token.colorBgBase : token.colorBgContainer
  }
}

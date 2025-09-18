import { useMemo } from 'react'
import { theme } from 'antd'

import { resolveAccentForeground } from '@renderer/theme/foundations/brand'
import { resolvePalette } from '@renderer/theme/foundations/palette'

export interface SiderStyle {
  background: string
  borderColor: string
  accent: string
  accentForeground: string
  muted: string
  text: string
  shadow: string
}

export const useSiderStyles = (themeMode: 'light' | 'dark'): SiderStyle => {
  const { token } = theme.useToken()
  const palette = useMemo(() => resolvePalette(themeMode), [themeMode])

  return useMemo(() => {
    const background =
      themeMode === 'dark' ? token.colorBgElevated : token.colorBgContainer

    return {
      background,
      borderColor: token.colorBorderSecondary,
      accent: token.colorPrimary,
      accentForeground: resolveAccentForeground(token.colorPrimary, palette),
      muted: token.colorTextSecondary,
      text: token.colorTextHeading,
      shadow: themeMode === 'dark' ? '0 12px 28px rgba(2, 6, 23, 0.4)' : '0 6px 18px rgba(15, 23, 42, 0.12)'
    }
  }, [
    palette,
    themeMode,
    token.colorBgContainer,
    token.colorBgElevated,
    token.colorBorderSecondary,
    token.colorPrimary,
    token.colorTextHeading,
    token.colorTextSecondary
  ])
}

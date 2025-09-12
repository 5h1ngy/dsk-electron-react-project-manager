import { useMemo } from 'react'
import { theme } from 'antd'

export interface SiderStyle {
  background: string
  borderColor: string
  accent: string
  muted: string
  text: string
}

export const useSiderStyles = (themeMode: 'light' | 'dark'): SiderStyle => {
  const { token } = theme.useToken()

  return useMemo(
    () => ({
      background: themeMode === 'dark' ? token.colorBgElevated : token.colorBgContainer,
      borderColor: token.colorSplit,
      accent: token.colorPrimary,
      muted: token.colorTextTertiary,
      text: themeMode === 'dark' ? token.colorTextLightSolid : token.colorTextHeading
    }),
    [themeMode, token]
  )
}

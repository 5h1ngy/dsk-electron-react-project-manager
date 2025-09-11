import { useMemo } from 'react'
import { theme } from 'antd'

export interface SiderStyle {
  background: string
  borderColor: string
}

export const useSiderStyles = (themeMode: 'light' | 'dark'): SiderStyle => {
  const { token } = theme.useToken()

  return useMemo(
    () => ({
      background: themeMode === 'dark' ? token.colorBgElevated : token.colorBgContainer,
      borderColor: token.colorSplit
    }),
    [themeMode, token]
  )
}

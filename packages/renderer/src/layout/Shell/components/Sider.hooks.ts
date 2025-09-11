import { useMemo } from 'react'
import { theme } from 'antd'

export interface ShellSiderStyle {
  background: string
  borderColor: string
}

export const useShellSiderStyles = (themeMode: 'light' | 'dark'): ShellSiderStyle => {
  const { token } = theme.useToken()

  return useMemo(
    () => ({
      background: themeMode === 'dark' ? token.colorBgElevated : token.colorBgContainer,
      borderColor: token.colorSplit
    }),
    [themeMode, token]
  )
}


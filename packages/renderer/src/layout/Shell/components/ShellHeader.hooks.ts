import { useMemo } from 'react'
import { theme } from 'antd'
import type { CSSProperties } from 'react'

export const useShellHeaderStyles = (): CSSProperties => {
  const { token } = theme.useToken()

  return useMemo(
    () => ({
      background: token.colorBgElevated,
      borderBottom: `1px solid ${token.colorSplit}`,
      paddingInline: 24
    }),
    [token]
  )
}


import { useMemo } from 'react'
import { theme } from 'antd'
import type { CSSProperties } from 'react'

export const useHeaderStyles = (): CSSProperties => {
  const { token } = theme.useToken()

  return useMemo(
    () => ({
      background: token.colorBgElevated,
      borderBottom: `1px solid ${token.colorSplit}`,
      paddingInline: 24,
      paddingBlock: 12,
      position: 'sticky' as const,
      top: 0,
      zIndex: token.zIndexPopupBase,
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)'
    }),
    [token]
  )
}

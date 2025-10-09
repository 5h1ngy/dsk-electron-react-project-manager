import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import type { BreadcrumbProps } from 'antd'

export const useBreadcrumbStyle = (
  items: BreadcrumbProps['items']
): CSSProperties | undefined => {
  return useMemo(() => {
    if ((items?.length ?? 0) === 1) {
      return {
        fontSize: '1.125rem',
        fontWeight: 600,
        lineHeight: 1.4
      }
    }

    return undefined
  }, [items])
}


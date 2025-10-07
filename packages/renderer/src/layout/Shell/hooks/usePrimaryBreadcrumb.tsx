import { useMemo } from 'react'
import type { BreadcrumbProps } from 'antd'

export const usePrimaryBreadcrumb = (items: BreadcrumbProps['items']): BreadcrumbProps['items'] => {
  return useMemo(() => items, [items])
}

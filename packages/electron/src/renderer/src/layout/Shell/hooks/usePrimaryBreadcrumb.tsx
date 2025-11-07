import { useMemo } from 'react'
import type { BreadcrumbProps } from 'antd'

const CLICKABLE_CLASS = 'app-breadcrumb-clickable'

export const usePrimaryBreadcrumb = (items: BreadcrumbProps['items']): BreadcrumbProps['items'] => {
  return useMemo(() => {
    if (!items) {
      return items
    }

    return items.map((item) => {
      if (!item) {
        return item
      }

      const isInteractive = Boolean(item.onClick || item.href)
      if (!isInteractive) {
        return item
      }

      const existingClassName =
        typeof item.className === 'string' && item.className.length > 0 ? item.className : ''
      const className = existingClassName
        ? `${existingClassName} ${CLICKABLE_CLASS}`
        : CLICKABLE_CLASS

      return {
        ...item,
        className
      }
    })
  }, [items])
}

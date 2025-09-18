import { useMemo } from 'react'
import { theme, Typography, type BreadcrumbProps } from 'antd'
import { isValidElement } from 'react'

export const usePrimaryBreadcrumb = (items: BreadcrumbProps['items']): BreadcrumbProps['items'] => {
  const { token } = theme.useToken()

  return useMemo(() => {
    if (!items || items.length === 0) {
      return items
    }

    const [first, ...rest] = items
    const title = first?.title

    const enhancedTitle = isValidElement(title)
      ? (
          <span
            style={{
              fontSize: token.fontSizeLG,
              fontWeight: token.fontWeightStrong,
              display: 'inline-flex',
              alignItems: 'center',
              gap: token.marginXXS
            }}
          >
            {title}
          </span>
        )
      : typeof title === 'string'
        ? (
            <Typography.Text strong style={{ fontSize: token.fontSizeLG }}>
              {title}
            </Typography.Text>
          )
        : title

    return [{ ...first, title: enhancedTitle }, ...rest]
  }, [items, token.fontSizeLG, token.fontWeightStrong, token.marginXXS])
}

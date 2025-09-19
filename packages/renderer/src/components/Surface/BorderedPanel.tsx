import type { CSSProperties, PropsWithChildren, ReactNode } from 'react'
import { Card, theme } from 'antd'

type PanelPadding = 'sm' | 'md' | 'lg'

const mapPadding = (padding: PanelPadding, token: ReturnType<typeof theme.useToken>['token']) => {
  switch (padding) {
    case 'sm':
      return token.paddingSM
    case 'md':
      return token.padding
    default:
      return token.paddingLG
  }
}

export interface BorderedPanelProps {
  title?: ReactNode
  extra?: ReactNode
  style?: CSSProperties
  bodyStyle?: CSSProperties
  headerStyle?: CSSProperties
  className?: string
  padding?: PanelPadding
}

export const BorderedPanel = ({
  children,
  title,
  extra,
  style,
  bodyStyle,
  headerStyle,
  className,
  padding = 'md'
}: PropsWithChildren<BorderedPanelProps>) => {
  const { token } = theme.useToken()
  const brandAwareToken = token as typeof token & {
    brandSecondaryBorder?: string
  }
  const borderColor = brandAwareToken.brandSecondaryBorder ?? token.colorBorderSecondary

  return (
    <Card
      title={title}
      extra={extra}
      variant="outlined"
      className={className}
      style={{
        background: 'transparent',
        boxShadow: 'none',
        borderColor,
        ...style
      }}
      styles={{
        header: {
          borderBottom: 'none',
          padding: 0,
          marginBottom: token.marginSM,
          ...headerStyle
        },
        body: {
          padding: mapPadding(padding, token),
          ...bodyStyle
        }
      }}
    >
      {children}
    </Card>
  )
}

BorderedPanel.displayName = 'BorderedPanel'

export default BorderedPanel

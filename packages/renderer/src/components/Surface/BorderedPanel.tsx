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
  className?: string
  padding?: PanelPadding
}

export const BorderedPanel = ({
  children,
  title,
  extra,
  style,
  bodyStyle,
  className,
  padding = 'md'
}: PropsWithChildren<BorderedPanelProps>) => {
  const { token } = theme.useToken()

  return (
    <Card
      title={title}
      extra={extra}
      bordered
      className={className}
      headStyle={{ borderBottom: 'none', padding: 0, marginBottom: token.marginSM }}
      style={{
        background: 'transparent',
        boxShadow: 'none',
        borderColor: token.colorBorderSecondary,
        ...style
      }}
      bodyStyle={{
        padding: mapPadding(padding, token),
        ...bodyStyle
      }}
    >
      {children}
    </Card>
  )
}

BorderedPanel.displayName = 'BorderedPanel'

export default BorderedPanel

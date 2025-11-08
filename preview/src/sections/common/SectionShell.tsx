import { Card } from 'antd'
import type { CSSProperties, ReactNode } from 'react'

interface SectionShellProps {
  motionKey: string
  children: ReactNode
  style?: CSSProperties
  bodyStyle?: CSSProperties
}

export const SectionShell = ({ motionKey, children, style, bodyStyle }: SectionShellProps) => (
  <Card
    data-motion={motionKey}
    bordered={false}
    style={{ background: 'transparent', ...style }}
    bodyStyle={{ padding: 0, ...bodyStyle }}
  >
    {children}
  </Card>
)

import { Empty, Space, Typography } from 'antd'
import type { JSX, ReactNode } from 'react'

export interface EmptyStateProps {
  title?: string
  description?: string
  action?: ReactNode
  className?: string
}

export const EmptyState = ({
  title,
  description,
  action,
  className
}: EmptyStateProps): JSX.Element => {
  const content = (
    <Space direction="vertical" align="center" size={8}>
      {title ? (
        <Typography.Title level={5} style={{ margin: 0 }}>
          {title}
        </Typography.Title>
      ) : null}
      {description ? (
        <Typography.Text type="secondary" style={{ textAlign: 'center' }}>
          {description}
        </Typography.Text>
      ) : null}
      {action}
    </Space>
  )

  return (
    <Empty
      className={className}
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={content}
    />
  )
}

EmptyState.displayName = 'EmptyState'

export default EmptyState

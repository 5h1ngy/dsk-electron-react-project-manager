import { Card, Col, Row, Skeleton, Space, theme } from 'antd'
import type { ReactNode } from 'react'

import { useThemeTokens } from '@renderer/theme/hooks/useThemeTokens'

export type LoadingSkeletonVariant = 'table' | 'cards' | 'list'

export interface LoadingSkeletonProps {
  variant?: LoadingSkeletonVariant
  items?: number
  className?: string
}

const buildTableSkeleton = (items: number, titleWidth: number): ReactNode => (
  <Space direction="vertical" size="small">
    <Skeleton.Input active size="large" style={{ width: titleWidth }} />
    {Array.from({ length: items }).map((_, index) => (
      <Card key={`table-skeleton-${index}`} size="small" variant="borderless">
        <Skeleton
          active
          round
          title={false}
          paragraph={{ rows: 1, width: ['75%', '60%', '55%', '65%'][index % 4] }}
        />
      </Card>
    ))}
  </Space>
)

const buildCardsSkeleton = (items: number, gutter: number, titleWidth: number): ReactNode => (
  <Row gutter={[gutter, gutter]}>
    {Array.from({ length: items }).map((_, index) => (
      <Col xs={24} sm={12} lg={8} xl={6} key={`card-skeleton-${index}`}>
        <Card>
          <Space direction="vertical" size="small">
            <Skeleton.Button active size="small" shape="round" style={{ width: titleWidth }} />
            <Skeleton.Input active size="large" style={{ width: '100%' }} />
            <Skeleton active title={false} paragraph={{ rows: 2, width: ['95%', '80%'] }} />
          </Space>
        </Card>
      </Col>
    ))}
  </Row>
)

const buildListSkeleton = (items: number): ReactNode => (
  <Space direction="vertical" size="middle">
    {Array.from({ length: items }).map((_, index) => (
      <Card size="small" key={`list-skeleton-${index}`}>
        <Skeleton active paragraph={{ rows: 2 }} title={false} />
      </Card>
    ))}
  </Space>
)

const DEFAULT_ITEMS: Record<LoadingSkeletonVariant, number> = {
  table: 5,
  cards: 4,
  list: 4
}

export const LoadingSkeleton = ({ variant = 'list', items, className }: LoadingSkeletonProps) => {
  const { token } = theme.useToken()
  const { spacing } = useThemeTokens()
  const count = items ?? DEFAULT_ITEMS[variant]

  const controlHeightLG =
    typeof token.controlHeightLG === 'number' && Number.isFinite(token.controlHeightLG)
      ? token.controlHeightLG
      : 40
  const tableWidth = controlHeightLG * 5
  const cardTitleWidth = controlHeightLG * 2.5
  const gutter = spacing.lg

  const content: Record<LoadingSkeletonVariant, ReactNode> = {
    table: buildTableSkeleton(count, tableWidth),
    cards: buildCardsSkeleton(count, gutter, cardTitleWidth),
    list: buildListSkeleton(count)
  }

  return (
    <Space direction="vertical" size={0} className={className} style={{ width: '100%' }}>
      {content[variant]}
    </Space>
  )
}

LoadingSkeleton.displayName = 'LoadingSkeleton'

export default LoadingSkeleton

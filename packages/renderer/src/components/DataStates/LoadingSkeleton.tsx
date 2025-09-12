import { Card, Col, Row, Skeleton, Space } from 'antd'
import type { ReactNode } from 'react'

export type LoadingSkeletonVariant = 'table' | 'cards' | 'list'

export interface LoadingSkeletonProps {
  variant?: LoadingSkeletonVariant
  items?: number
  className?: string
}

const renderTableSkeleton = (items: number): ReactNode => (
  <Space direction="vertical" size="small" style={{ width: '100%' }}>
    <Skeleton.Input active size="large" style={{ width: 240 }} />
    {Array.from({ length: items }).map((_, index) => (
      <Card key={`table-skeleton-${index}`} size="small" bordered={false}>
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

const renderCardsSkeleton = (items: number): ReactNode => (
  <Row gutter={[16, 16]}>
    {Array.from({ length: items }).map((_, index) => (
      <Col xs={24} sm={12} lg={8} xl={6} key={`card-skeleton-${index}`}>
        <Card bordered>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Skeleton.Button active size="small" shape="round" style={{ width: 120 }} />
            <Skeleton.Input active size="large" style={{ width: '100%' }} />
            <Skeleton
              active
              title={false}
              paragraph={{ rows: 2, width: ['95%', '80%'] }}
            />
          </Space>
        </Card>
      </Col>
    ))}
  </Row>
)

const renderListSkeleton = (items: number): ReactNode => (
  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
    {Array.from({ length: items }).map((_, index) => (
      <Card size="small" key={`list-skeleton-${index}`}>
        <Skeleton active paragraph={{ rows: 2 }} title={false} />
      </Card>
    ))}
  </Space>
)

const renderers: Record<LoadingSkeletonVariant, (items: number) => ReactNode> = {
  table: renderTableSkeleton,
  cards: renderCardsSkeleton,
  list: renderListSkeleton
}

const DEFAULT_ITEMS: Record<LoadingSkeletonVariant, number> = {
  table: 5,
  cards: 4,
  list: 4
}

export const LoadingSkeleton = ({
  variant = 'list',
  items,
  className
}: LoadingSkeletonProps) => {
  const render = renderers[variant] ?? renderers.list
  const count = items ?? DEFAULT_ITEMS[variant]

  return (
    <div className={className} style={{ width: '100%' }}>
      {render(count)}
    </div>
  )
}

LoadingSkeleton.displayName = 'LoadingSkeleton'

export default LoadingSkeleton


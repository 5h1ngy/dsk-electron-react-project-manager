import { Card, Skeleton, Space, theme } from 'antd'
import type { ReactNode } from 'react'

export type LoadingSkeletonLayout = 'stack' | 'grid' | 'columns'

export interface LoadingSkeletonProps {
  layout?: LoadingSkeletonLayout
  items?: number
  className?: string
  minHeight?: number
}

const SkeletonBlock = ({
  index,
  minHeight,
  token
}: {
  index: number
  minHeight: number
  token: ReturnType<typeof theme.useToken>['token']
}) => (
  <Card
    key={`app-skeleton-${index}`}
    variant="borderless"
    style={{
      borderRadius: token.borderRadiusLG,
      background: token.colorFillTertiary,
      boxShadow: 'none',
      minHeight,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}
    styles={{
      body: {
        padding: token.paddingLG
      }
    }}
  >
    <Space direction="vertical" size={token.padding / 2} style={{ width: '100%' }}>
      <Skeleton.Button
        active
        size="small"
        shape="round"
        style={{ width: '40%', minWidth: 120, maxWidth: 180 }}
      />
      <Skeleton
        active
        title={false}
        paragraph={{
          rows: 3,
          width: ['90%', '72%', '58%']
        }}
      />
    </Space>
  </Card>
)

const renderStack = (
  blocks: ReactNode[],
  gap: number
): ReactNode => (
  <Space direction="vertical" size={gap} style={{ width: '100%' }}>
    {blocks}
  </Space>
)

const renderGrid = (
  blocks: ReactNode[],
  gap: number
): ReactNode => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap,
      width: '100%'
    }}
  >
    {blocks}
  </div>
)

const renderColumns = (
  blocks: ReactNode[],
  gap: number
): ReactNode => (
  <div style={{ width: '100%', overflowX: 'auto' }}>
    <div
      style={{
        display: 'grid',
        gridAutoFlow: 'column',
        gridAutoColumns: 'minmax(260px, 320px)',
        gap,
        paddingBottom: gap
      }}
    >
      {blocks}
    </div>
  </div>
)

const DEFAULT_ITEMS: Record<LoadingSkeletonLayout, number> = {
  stack: 4,
  grid: 4,
  columns: 4
}

export const LoadingSkeleton = ({
  layout = 'stack',
  items,
  className,
  minHeight = 140
}: LoadingSkeletonProps) => {
  const { token } = theme.useToken()
  const count = items ?? DEFAULT_ITEMS[layout]
  const gap = token.paddingLG

  const blocks = Array.from({ length: count }).map((_, index) => (
    <SkeletonBlock key={index} index={index} minHeight={minHeight} token={token} />
  ))

  const content =
    layout === 'grid'
      ? renderGrid(blocks, gap)
      : layout === 'columns'
        ? renderColumns(blocks, gap)
        : renderStack(blocks, gap)

  return (
    <div className={className} style={{ width: '100%' }}>
      {content}
    </div>
  )
}

LoadingSkeleton.displayName = 'LoadingSkeleton'

export default LoadingSkeleton

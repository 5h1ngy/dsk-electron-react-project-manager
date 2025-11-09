import { Button, Flex, Segmented, Space } from 'antd'
import { PlusOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons'
import type { SegmentedValue } from 'antd/es/segmented'
import type { CSSProperties, JSX, ReactNode } from 'react'

import type { SprintStatusFilter } from './types'

interface SegmentedOption {
  label: ReactNode
  value: SegmentedValue
}

interface SprintBoardToolbarProps {
  canManage: boolean
  onCreate: () => void
  statusFilter: SprintStatusFilter
  onStatusChange: (value: SprintStatusFilter) => void
  statusOptions: SegmentedOption[]
  segmentedStyle: CSSProperties
  onZoomIn: () => void
  onZoomOut: () => void
  canZoomIn: boolean
  canZoomOut: boolean
  zoomInLabel: string
  zoomOutLabel: string
  createLabel: string
}

export const SprintBoardToolbar = ({
  canManage,
  onCreate,
  statusFilter,
  onStatusChange,
  statusOptions,
  segmentedStyle,
  onZoomIn,
  onZoomOut,
  canZoomIn,
  canZoomOut,
  zoomInLabel,
  zoomOutLabel,
  createLabel
}: SprintBoardToolbarProps): JSX.Element => (
  <Flex align="center" justify="space-between" wrap gap={16} style={{ width: '100%' }}>
    <Space size={8}>
      {canManage ? (
        <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
          {createLabel}
        </Button>
      ) : null}
    </Space>
    <Space size={8} align="center" wrap>
      <Button
        type="text"
        icon={<ZoomOutOutlined />}
        onClick={onZoomOut}
        disabled={!canZoomOut}
        title={zoomOutLabel}
      />
      <Button
        type="text"
        icon={<ZoomInOutlined />}
        onClick={onZoomIn}
        disabled={!canZoomIn}
        title={zoomInLabel}
      />
      <Segmented
        size="large"
        value={statusFilter}
        onChange={(value) => onStatusChange(value as SprintStatusFilter)}
        options={statusOptions}
        style={segmentedStyle}
      />
    </Space>
  </Flex>
)

export default SprintBoardToolbar

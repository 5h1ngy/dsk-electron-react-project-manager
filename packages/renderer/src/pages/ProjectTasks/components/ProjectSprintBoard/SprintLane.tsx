import { Button, Flex, Space, Spin, Table, Tag, Typography } from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import type { ColumnsType } from 'antd/es/table'
import type { TFunction } from 'i18next'
import type { SprintDTO } from '@main/services/sprint/types'
import type { TaskDetailsDTO } from '@main/services/task/types'
import type { GlobalToken } from 'antd/es/theme/interface'
import type { JSX } from 'react'

import type {
  SprintDetailsSelectorResult,
  TaskTableRecord,
  TimelinePosition
} from './types'

interface SprintLaneProps {
  sprint: SprintDTO
  isExpanded: boolean
  onToggle: (sprintId: string) => void
  timelineSlots: Dayjs[]
  slotWidth: number
  computeRangePosition: (start: Dayjs, end: Dayjs) => TimelinePosition
  sprintStatusColors: Record<SprintDTO['status'], string>
  token: GlobalToken
  t: TFunction<'projects'>
  sprintKeyPrefix: string
  canManage: boolean
  onEdit: (sprint: SprintDTO) => void
  onDelete: (sprint: SprintDTO) => void
  formatDateRange: (start: string, end: string) => string
  detailsState?: SprintDetailsSelectorResult
  taskTableColumns: ColumnsType<TaskTableRecord>
}

export const SprintLane = ({
  sprint,
  isExpanded,
  onToggle,
  timelineSlots,
  slotWidth,
  computeRangePosition,
  sprintStatusColors,
  token,
  t,
  sprintKeyPrefix,
  canManage,
  onEdit,
  onDelete,
  formatDateRange,
  detailsState,
  taskTableColumns
}: SprintLaneProps): JSX.Element => {
  const sprintStart = dayjs(sprint.startDate).startOf('day')
  const sprintEnd = dayjs(sprint.endDate).endOf('day')
  const position = computeRangePosition(sprintStart, sprintEnd)
  const prefix = `${sprintKeyPrefix}-${String(sprint.sequence ?? 0).padStart(2, '0')}`
  const contentMinWidth = 240 + timelineSlots.length * slotWidth

  const sprintDetails = detailsState?.data ?? null
  const isLoadingDetails = detailsState?.status === 'loading' && !sprintDetails
  const metrics = sprintDetails?.metrics ?? sprint.metrics

  const taskTableData: TaskTableRecord[] = sprintDetails
    ? sprintDetails.tasks.map((task: TaskDetailsDTO) => ({
        key: task.id,
        title: `${task.key} - ${task.title}`,
        status: task.status,
        assignee:
          task.assignee?.displayName ??
          t('tasks.details.unassigned', { defaultValue: 'Non assegnato' }),
        dueDate: task.dueDate
      }))
    : []

  return (
    <div
      style={{
        borderRadius: token.borderRadiusLG,
        border: isExpanded
          ? `2px solid ${token.colorPrimary}`
          : `1px solid ${token.colorBorderSecondary}`,
        background: token.colorBgContainer,
        overflow: 'hidden',
        transition: 'border-color 0.2s ease',
        minWidth: contentMinWidth
      }}
    >
      <div
        onClick={() => onToggle(sprint.id)}
        style={{
          display: 'grid',
          gridTemplateColumns: `240px repeat(${timelineSlots.length}, minmax(${slotWidth}px, 1fr))`,
          alignItems: 'stretch',
          cursor: 'pointer',
          background: isExpanded ? token.colorPrimaryBg : token.colorBgContainer,
          transition: 'background-color 0.2s ease',
          minWidth: contentMinWidth
        }}
      >
        <div
          style={{
            padding: `${token.paddingMD}px ${token.paddingLG}px`,
            borderRight: `1px solid ${token.colorSplit}`,
            display: 'flex',
            flexDirection: 'column',
            gap: token.marginXS
          }}
        >
          <Space size={token.marginXS} wrap align="center">
            <Typography.Text type="secondary">{prefix}</Typography.Text>
            <Typography.Text strong>{sprint.name}</Typography.Text>
          </Space>
          <Space size={token.marginXS} wrap>
            <Tag color={sprintStatusColors[sprint.status]} bordered={false}>
              {t(`sprints.status.${sprint.status}`, { defaultValue: sprint.status })}
            </Tag>
            <Tag bordered={false}>
              {t('sprints.totalTasks', { defaultValue: 'Task totali' })}:{' '}
              {sprint.metrics.totalTasks}
            </Tag>
            {sprint.capacityMinutes !== null ? (
              <Tag bordered={false}>
                {t('sprints.capacityMinutes', { defaultValue: 'Capacita (minuti)' })}:{' '}
                {sprint.capacityMinutes}
              </Tag>
            ) : null}
          </Space>
          <Typography.Text type="secondary">
            {formatDateRange(sprint.startDate, sprint.endDate)}
          </Typography.Text>
          {sprint.goal ? (
            <Typography.Paragraph
              type="secondary"
              ellipsis={{ rows: 2 }}
              style={{ marginBottom: 0 }}
            >
              {sprint.goal}
            </Typography.Paragraph>
          ) : null}
          {canManage ? (
            <Space size={token.marginXS} wrap>
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={(event) => {
                  event.stopPropagation()
                  onEdit(sprint)
                }}
              >
                {t('common.edit', { defaultValue: 'Modifica' })}
              </Button>
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={(event) => {
                  event.stopPropagation()
                  onDelete(sprint)
                }}
              >
                {t('common.delete', { defaultValue: 'Elimina' })}
              </Button>
            </Space>
          ) : null}
        </div>
        <div
          style={{
            position: 'relative',
            gridColumn: `2 / span ${timelineSlots.length}`,
            minHeight: 96,
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
            gridTemplateColumns: `repeat(${timelineSlots.length}, minmax(${slotWidth}px, 1fr))`,
            pointerEvents: 'none'
          }}
          >
            {timelineSlots.map((slot, index) => (
              <div
                key={`${sprint.id}-grid-${slot.valueOf()}`}
                style={{
                  borderLeft: index === 0 ? 'none' : `1px solid ${token.colorSplit}`
                }}
              />
            ))}
          </div>

          <div
            style={{
              position: 'absolute',
              top: token.paddingMD,
              height: 48,
              borderRadius: token.borderRadiusLG,
              background: sprintStatusColors[sprint.status],
              color: token.colorWhite,
              padding: `${token.paddingXS}px ${token.paddingSM}px`,
              display: 'flex',
              alignItems: 'center',
              gap: token.marginSM,
              boxShadow: token.boxShadowTertiary,
              ...position
            }}
          >
            <Typography.Text strong style={{ color: token.colorWhite }}>
              {sprint.name}
            </Typography.Text>
            <Typography.Text style={{ color: token.colorWhite }}>
              {t('sprints.totalTasks', { defaultValue: 'Task totali' })}:{' '}
              {sprint.metrics.totalTasks}
            </Typography.Text>
          </div>
        </div>
      </div>
      {isExpanded ? (
        <div
          onClick={(event) => event.stopPropagation()}
          style={{
            padding: token.paddingLG,
            borderTop: `1px solid ${token.colorSplit}`,
            background: token.colorBgElevated
          }}
        >
          <Space direction="vertical" size={token.marginMD} style={{ width: '100%' }}>
            <Flex gap={token.marginLG} wrap>
              <Space direction="vertical" size={4}>
                <Typography.Text type="secondary">
                  {t('sprints.totalTasks', { defaultValue: 'Task totali' })}
                </Typography.Text>
                <Typography.Text strong>{metrics.totalTasks}</Typography.Text>
              </Space>
              <Space direction="vertical" size={4}>
                <Typography.Text type="secondary">
                  {t('sprints.estimatedMinutes', { defaultValue: 'Stimati' })}
                </Typography.Text>
                <Typography.Text strong>{metrics.estimatedMinutes ?? 0}</Typography.Text>
              </Space>
            </Flex>
            <div style={{ width: '100%', overflowX: 'auto' }}>
              {isLoadingDetails ? (
                <Flex align="center" justify="center" style={{ width: '100%', minHeight: 160 }}>
                  <Spin />
                </Flex>
              ) : (
                <Table<TaskTableRecord>
                  size="small"
                  rowKey="key"
                  columns={taskTableColumns}
                  dataSource={taskTableData}
                  pagination={{
                    pageSize: 8,
                    showSizeChanger: false
                  }}
                  scroll={{ x: 'max-content' }}
                  locale={{
                    emptyText: t('sprints.details.emptyTasks', {
                      defaultValue: 'Nessun task nello sprint'
                    })
                  }}
                />
              )}
            </div>
          </Space>
        </div>
      ) : null}
    </div>
  )
}

export default SprintLane

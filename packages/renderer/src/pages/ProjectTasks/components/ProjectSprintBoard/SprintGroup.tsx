import { Space, Typography } from 'antd'
import type dayjs from 'dayjs'
import type { TFunction } from 'i18next'
import type { SprintDTO } from '@main/services/sprint/types'
import type { GlobalToken } from 'antd/es/theme/interface'
import type { JSX } from 'react'

import SprintLane from './SprintLane'
import type {
  FormatSlotLabelFn,
  GroupedSprints,
  SprintDetailsSelectorResult,
  TaskTableColumns,
  TimelinePosition
} from './types'

interface SprintGroupProps {
  group: GroupedSprints
  timelineSlots: dayjs.Dayjs[]
  slotWidth: number
  formatSlotLabel: FormatSlotLabelFn
  formatDateRange: (start: string, end: string) => string
  computeRangePosition: (start: dayjs.Dayjs, end: dayjs.Dayjs) => TimelinePosition
  sprintStatusColors: Record<SprintDTO['status'], string>
  expandedSprintIds: string[]
  onToggleSprint: (sprintId: string) => void
  sprintDetailsMap: Record<string, SprintDetailsSelectorResult | undefined>
  canManage: boolean
  onEditSprint: (sprint: SprintDTO) => void
  onDeleteSprint: (sprint: SprintDTO) => void
  sprintKeyPrefix: string
  token: GlobalToken
  t: TFunction<'projects'>
  taskTableColumns: TaskTableColumns
}

const SprintGroup = ({
  group,
  timelineSlots,
  slotWidth,
  formatSlotLabel,
  formatDateRange,
  computeRangePosition,
  sprintStatusColors,
  expandedSprintIds,
  onToggleSprint,
  sprintDetailsMap,
  canManage,
  onEditSprint,
  onDeleteSprint,
  sprintKeyPrefix,
  token,
  t,
  taskTableColumns
}: SprintGroupProps): JSX.Element => {
  const contentMinWidth = 240 + timelineSlots.length * slotWidth

  return (
    <Space direction="vertical" size={token.marginSM} style={{ width: '100%' }}>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `240px repeat(${timelineSlots.length}, minmax(${slotWidth}px, 1fr))`,
        alignItems: 'stretch',
        padding: `${token.paddingSM}px 0`,
        background: token.colorBgLayout,
        borderRadius: token.borderRadiusSM,
        minWidth: contentMinWidth
      }}
    >
      <div style={{ paddingInline: token.paddingMD }}>
        <Space size={8} wrap align="center">
          <Typography.Text strong>{group.label}</Typography.Text>
          <Typography.Text type="secondary">
            {t('sprints.group.totalTasks', { defaultValue: 'Task' })}: {group.totals.tasks}
          </Typography.Text>
          <Typography.Text type="secondary">
            {t('sprints.estimatedMinutes', { defaultValue: 'Stimati' })}: {group.totals.estimated}
          </Typography.Text>
          <Typography.Text type="secondary">
            {t('sprints.spentMinutes', { defaultValue: 'Registrati' })}: {group.totals.spent}
          </Typography.Text>
          {group.totals.utilization !== null ? (
            <Typography.Text type="secondary">
              {t('sprints.utilization', { defaultValue: 'Utilizzo' })}:{' '}
              {Math.round(group.totals.utilization)}%
            </Typography.Text>
          ) : null}
        </Space>
      </div>
      {timelineSlots.map((slot, index) => {
        const { label, subLabel } = formatSlotLabel(slot)
        return (
          <div
            key={`${group.status}-slot-${slot.valueOf()}`}
            style={{
              borderLeft: index === 0 ? 'none' : `1px solid ${token.colorSplit}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4
            }}
          >
            <Typography.Text strong>{label}</Typography.Text>
            <Typography.Text type="secondary">{subLabel}</Typography.Text>
          </div>
        )
      })}
    </div>

    <Space
      direction="vertical"
      size={token.marginSM}
      style={{ width: '100%', minWidth: contentMinWidth }}
    >
      {group.sprints.map((sprint) => (
        <SprintLane
          key={sprint.id}
          sprint={sprint}
          isExpanded={expandedSprintIds.includes(sprint.id)}
          onToggle={onToggleSprint}
          timelineSlots={timelineSlots}
          slotWidth={slotWidth}
          computeRangePosition={computeRangePosition}
          sprintStatusColors={sprintStatusColors}
          token={token}
          t={t}
          sprintKeyPrefix={sprintKeyPrefix}
          canManage={canManage}
          onEdit={onEditSprint}
          onDelete={onDeleteSprint}
          formatDateRange={formatDateRange}
          detailsState={sprintDetailsMap[sprint.id]}
          taskTableColumns={taskTableColumns}
        />
      ))}
    </Space>
  </Space>
  )
}

export default SprintGroup

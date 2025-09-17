import { useMemo, type JSX } from 'react'
import { AppstoreOutlined, PlusOutlined, TableOutlined } from '@ant-design/icons'
import { Button, DatePicker, Input, Segmented, Select, Space, Switch, Typography } from 'antd'
import type { SelectProps } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import dayjs, { type Dayjs } from 'dayjs'
import { useTranslation } from 'react-i18next'

import type { SelectOption, TaskFilters } from '@renderer/pages/ProjectTasks/ProjectTasks.types'
import { BorderedPanel } from '@renderer/components/Surface/BorderedPanel'

const { RangePicker } = DatePicker

type Option = SelectProps['options']

export interface TaskFiltersBarProps {
  filters: TaskFilters
  statusOptions: SelectOption[]
  priorityOptions: SelectOption[]
  assigneeOptions: SelectOption[]
  onChange: (patch: Partial<TaskFilters>) => void
  viewMode: 'table' | 'cards'
  onViewModeChange: (mode: 'table' | 'cards') => void
  onCreate?: () => void
  canCreate?: boolean
}

export const TaskFiltersBar = ({
  filters,
  statusOptions,
  priorityOptions,
  assigneeOptions,
  onChange,
  viewMode,
  onViewModeChange,
  onCreate,
  canCreate = true
}: TaskFiltersBarProps): JSX.Element => {
  const { t } = useTranslation('projects')

  const dueRangeValue = useMemo<[Dayjs | null, Dayjs | null] | null>(() => {
    if (!filters.dueDateRange) {
      return null
    }
    const [start, end] = filters.dueDateRange
    return [start ? dayjs(start) : null, end ? dayjs(end) : null]
  }, [filters.dueDateRange])

  const viewSegmentedOptions = useMemo(
    () => [
      {
        label: (
          <Space size={6}>
            <TableOutlined />
            {t('viewSwitcher.table')}
          </Space>
        ),
        value: 'table'
      },
      {
        label: (
          <Space size={6}>
            <AppstoreOutlined />
            {t('viewSwitcher.cards')}
          </Space>
        ),
        value: 'cards'
      }
    ],
    [t]
  )

  const selectOption = (options: SelectOption[]): Option =>
    options.map((option) => ({ label: option.label, value: option.value }))

  const handleRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (!dates) {
      onChange({ dueDateRange: null })
      return
    }
    const [start, end] = dates
    if (!start && !end) {
      onChange({ dueDateRange: null })
      return
    }
    onChange({
      dueDateRange: [
        start ? start.startOf('day').toISOString() : null,
        end ? end.endOf('day').toISOString() : null
      ]
    })
  }

  return (
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      <BorderedPanel padding="lg" style={{ width: '100%' }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            value={filters.searchQuery}
            onChange={(event) => onChange({ searchQuery: event.target.value })}
            placeholder={t('details.tasksSearchPlaceholder')}
            size="large"
            style={{ minWidth: 220 }}
          />
          <Space size="middle" wrap style={{ width: '100%' }}>
            <Select
              size="large"
              style={{ minWidth: 200 }}
              value={filters.status}
              onChange={(value) => onChange({ status: value as TaskFilters['status'] })}
              options={selectOption(statusOptions)}
            />
            <Select
              size="large"
              style={{ minWidth: 200 }}
              value={filters.priority}
              onChange={(value) => onChange({ priority: value as TaskFilters['priority'] })}
              options={selectOption(priorityOptions)}
            />
            <Select
              size="large"
              style={{ minWidth: 220 }}
              value={filters.assignee}
              onChange={(value) => onChange({ assignee: value as TaskFilters['assignee'] })}
              options={selectOption(assigneeOptions)}
            />
            <RangePicker
              size="large"
              value={dueRangeValue}
              onChange={(dates) => handleRangeChange(dates as [Dayjs | null, Dayjs | null] | null)}
              style={{ minWidth: 260 }}
              allowClear
              placeholder={[
                t('details.filters.dueDateRange.start'),
                t('details.filters.dueDateRange.end')
              ]}
            />
            <Space size={6} align="center">
              <Switch
                checked={filters.showCommentColumn}
                onChange={(checked) => onChange({ showCommentColumn: checked })}
              />
              <Typography.Text type="secondary">{t('details.filters.showComments')}</Typography.Text>
            </Space>
          </Space>
        </Space>
      </BorderedPanel>
      <BorderedPanel padding="md" style={{ width: '100%' }}>
        <Space
          size="middle"
          align="center"
          style={{ width: '100%', justifyContent: 'space-between' }}
          wrap
        >
          <Segmented
            size="large"
            value={viewMode}
            onChange={(next) => onViewModeChange(next as 'table' | 'cards')}
            options={viewSegmentedOptions}
          />
          <Space size="small" wrap>
            {onCreate ? (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={onCreate}
                disabled={!canCreate}
              >
                {t('tasks.actions.create')}
              </Button>
            ) : null}
          </Space>
        </Space>
      </BorderedPanel>
    </Space>
  )
}

TaskFiltersBar.displayName = 'TaskFiltersBar'

export default TaskFiltersBar

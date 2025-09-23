import { useMemo, type JSX } from 'react'
import { AppstoreOutlined, ColumnWidthOutlined, PlusOutlined, TableOutlined } from '@ant-design/icons'
import { Button, Collapse, DatePicker, Flex, Input, Segmented, Select, Space } from 'antd'
import type { SelectProps } from 'antd'
import type { ReactNode } from 'react'
import { SearchOutlined } from '@ant-design/icons'
import dayjs, { type Dayjs } from 'dayjs'
import { useTranslation } from 'react-i18next'
import { FilterOutlined, SettingOutlined } from '@ant-design/icons'

import type { SelectOption, TaskFilters } from '@renderer/pages/ProjectTasks/ProjectTasks.types'
import { BorderedPanel } from '@renderer/components/Surface/BorderedPanel'
import usePersistentCollapse from '@renderer/hooks/usePersistentCollapse'

const { RangePicker } = DatePicker

type Option = SelectProps['options']

export interface TaskFiltersBarProps {
  filters: TaskFilters
  statusOptions: SelectOption[]
  priorityOptions: SelectOption[]
  assigneeOptions: SelectOption[]
  onChange: (patch: Partial<TaskFilters>) => void
  viewMode: 'table' | 'cards' | 'board'
  onViewModeChange: (mode: 'table' | 'cards' | 'board') => void
  onCreate?: () => void
  canCreate?: boolean
  secondaryActions?: ReactNode
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
  canCreate = true,
  secondaryActions
}: TaskFiltersBarProps): JSX.Element => {
  const { t } = useTranslation('projects')
  const [activePanels, handlePanelsChange] = usePersistentCollapse('projectTasks.panels')

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
          <Space size={6} style={{ color: 'inherit' }}>
            <TableOutlined />
            <span>{t('viewSwitcher.table')}</span>
          </Space>
        ),
        value: 'table'
      },
      {
        label: (
          <Space size={6} style={{ color: 'inherit' }}>
            <ColumnWidthOutlined />
            <span>{t('viewSwitcher.board')}</span>
          </Space>
        ),
        value: 'board'
      },
      {
        label: (
          <Space size={6} style={{ color: 'inherit' }}>
            <AppstoreOutlined />
            <span>{t('viewSwitcher.cards')}</span>
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

  const filterContent = (
    <Flex vertical gap={12}>
      <Input
        allowClear
        prefix={<SearchOutlined />}
        value={filters.searchQuery}
        onChange={(event) => onChange({ searchQuery: event.target.value })}
        placeholder={t('details.tasksSearchPlaceholder')}
        size="large"
        style={{ minWidth: 200 }}
      />
      <Flex wrap gap={12} style={{ width: '100%' }}>
        <Select
          size="large"
          style={{ minWidth: 200, flex: '1 1 200px' }}
          value={filters.status}
          onChange={(value) => onChange({ status: value as TaskFilters['status'] })}
          options={selectOption(statusOptions)}
        />
        <Select
          size="large"
          style={{ minWidth: 200, flex: '1 1 200px' }}
          value={filters.priority}
          onChange={(value) => onChange({ priority: value as TaskFilters['priority'] })}
          options={selectOption(priorityOptions)}
        />
        <Select
          size="large"
          style={{ minWidth: 220, flex: '1 1 220px' }}
          value={filters.assignee}
          onChange={(value) => onChange({ assignee: value as TaskFilters['assignee'] })}
          options={selectOption(assigneeOptions)}
        />
        <RangePicker
          size="large"
          value={dueRangeValue}
          onChange={(dates) => handleRangeChange(dates as [Dayjs | null, Dayjs | null] | null)}
          style={{ minWidth: 260, flex: '1 1 260px' }}
          allowClear
          placeholder={[
            t('details.filters.dueDateRange.start'),
            t('details.filters.dueDateRange.end')
          ]}
        />
      </Flex>
    </Flex>
  )

  const actionsContent = (
    <Flex align="center" gap={12} wrap>
      <Segmented
        size="large"
        value={viewMode}
        onChange={(next) => onViewModeChange(next as 'table' | 'cards' | 'board')}
        options={viewSegmentedOptions}
      />
      {secondaryActions ? (
        <Space size="small" wrap>
          {secondaryActions}
        </Space>
      ) : null}
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
    </Flex>
  )

  return (
    <BorderedPanel padding="lg" style={{ width: '100%' }}>
      <Flex vertical gap={16}>
        <Flex vertical gap={12}>
          <Space size={6} align="center">
            <SettingOutlined />
            <span>{t('tasks.actionsPanel', { defaultValue: 'Azioni' })}</span>
          </Space>
          {actionsContent}
        </Flex>
        <Collapse
          bordered={false}
          activeKey={activePanels}
          onChange={handlePanelsChange}
          defaultActiveKey={[]}
          items={[
            {
              key: 'filters',
              label: (
                <Space size={6} align="center">
                  <FilterOutlined />
                  <span>{t('tasks.filterPanel', { defaultValue: 'Filtri' })}</span>
                </Space>
              ),
              children: filterContent
            }
          ]}
        />
      </Flex>
    </BorderedPanel>
  )
}

TaskFiltersBar.displayName = 'TaskFiltersBar'

export default TaskFiltersBar

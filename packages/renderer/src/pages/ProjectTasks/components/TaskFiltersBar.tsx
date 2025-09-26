import { useMemo, useState, type JSX } from 'react'
import { AppstoreOutlined, BarsOutlined, ColumnWidthOutlined, PlusOutlined, TableOutlined } from '@ant-design/icons'
import { Button, DatePicker, Drawer, Flex, Grid, Input, Segmented, Select, Space, theme } from 'antd'
import type { SelectProps } from 'antd'
import type { ReactNode } from 'react'
import { SearchOutlined } from '@ant-design/icons'
import dayjs, { type Dayjs } from 'dayjs'
import { useTranslation } from 'react-i18next'
import { FilterOutlined, SaveOutlined } from '@ant-design/icons'

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
  viewMode: 'table' | 'list' | 'cards' | 'board'
  onViewModeChange: (mode: 'table' | 'list' | 'cards' | 'board') => void
  onCreate?: () => void
  canCreate?: boolean
  secondaryActions?: ReactNode
  savedViewsControls?: ReactNode
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
  secondaryActions,
  savedViewsControls
}: TaskFiltersBarProps): JSX.Element => {
  const { t } = useTranslation('projects')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const screens = Grid.useBreakpoint()
  const { token } = theme.useToken()
  const toolbarSegmentedStyle = useMemo(
    () => ({
      background: token.colorFillTertiary,
      border: `${token.lineWidth}px solid ${token.colorFillQuaternary}`,
      boxShadow: token.boxShadowSecondary,
      padding: token.paddingXXS,
      borderRadius: token.borderRadiusLG
    }),
    [
      token.borderRadiusLG,
      token.boxShadowSecondary,
      token.colorFillQuaternary,
      token.colorFillTertiary,
      token.lineWidth,
      token.paddingXXS
    ]
  )

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
            <BarsOutlined />
            <span>{t('viewSwitcher.list')}</span>
          </Space>
        ),
        value: 'list'
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
    <Flex vertical gap={16}>
      {savedViewsControls ? (
        <BorderedPanel
          padding="md"
          bodyStyle={{
            display: 'flex',
            flexDirection: 'column',
            gap: token.paddingSM
          }}
          title={
            <Space size={6} align="center">
              <SaveOutlined />
              <span>
                {t('tasks.savedViews.panelTitle', {
                  defaultValue: t('tasks.savedViews.placeholder')
                })}
              </span>
            </Space>
          }
          style={{ width: '100%' }}
        >
          {savedViewsControls}
        </BorderedPanel>
      ) : null}
      <Input
        allowClear
        prefix={<SearchOutlined />}
        value={filters.searchQuery}
        onChange={(event) => onChange({ searchQuery: event.target.value })}
        placeholder={t('details.tasksSearchPlaceholder')}
        size="large"
      />
      <Flex vertical gap={12}>
        <Select
          size="large"
          value={filters.status}
          onChange={(value) => onChange({ status: value as TaskFilters['status'] })}
          options={selectOption(statusOptions)}
          style={{ width: '100%' }}
        />
        <Select
          size="large"
          value={filters.priority}
          onChange={(value) => onChange({ priority: value as TaskFilters['priority'] })}
          options={selectOption(priorityOptions)}
          style={{ width: '100%' }}
        />
        <Select
          size="large"
          value={filters.assignee}
          onChange={(value) => onChange({ assignee: value as TaskFilters['assignee'] })}
          options={selectOption(assigneeOptions)}
          style={{ width: '100%' }}
        />
        <RangePicker
          size="large"
          value={dueRangeValue}
          onChange={(dates) => handleRangeChange(dates as [Dayjs | null, Dayjs | null] | null)}
          allowClear
          placeholder={[
            t('details.filters.dueDateRange.start'),
            t('details.filters.dueDateRange.end')
          ]}
          style={{ width: '100%' }}
        />
      </Flex>
    </Flex>
  )

  const actionsContent = (
    <Flex align="center" wrap gap={12} style={{ width: '100%' }}>
      <Flex align="center" gap={12} wrap style={{ flex: '1 1 auto' }}>
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
      <Flex align="center" gap={12} wrap style={{ justifyContent: 'flex-end', flexShrink: 0 }}>
        <Segmented
          size="large"
          value={viewMode}
          onChange={(next) => onViewModeChange(next as 'table' | 'list' | 'cards' | 'board')}
          options={viewSegmentedOptions}
          style={toolbarSegmentedStyle}
        />
        <Button icon={<FilterOutlined />} size="large" onClick={() => setFiltersOpen(true)}>
          {t('tasks.openFilters')}
        </Button>
      </Flex>
    </Flex>
  )

  return (
    <>
      <BorderedPanel padding="lg" style={{ width: '100%' }}>
        {actionsContent}
      </BorderedPanel>
      <Drawer
        placement="right"
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        width={screens.lg ? 420 : '100%'}
        contentWrapperStyle={{
          borderRadius: `${token.borderRadiusLG}px`,
          margin: screens.lg ? token.marginLG : 0,
          border: `${token.lineWidth}px solid ${token.colorBorderSecondary}`,
          boxShadow: token.boxShadowSecondary,
          overflow: 'hidden'
        }}
        title={
          <Space size={6} align="center">
            <FilterOutlined />
            <span>{t('tasks.filterPanel', { defaultValue: 'Filtri' })}</span>
          </Space>
        }
        styles={{
          header: { padding: token.paddingLG, marginBottom: 0 },
          body: { padding: token.paddingLG, display: 'flex', flexDirection: 'column', gap: 16 },
          footer: {
            padding: token.paddingLG,
            borderTop: `${token.lineWidth}px solid ${token.colorBorderSecondary}`
          }
        }}
        footer={
          <Flex justify="space-between" align="center" style={{ width: '100%' }}>
            <Button
              onClick={() => {
                onChange({
                  searchQuery: '',
                  status: 'all',
                  priority: 'all',
                  assignee: 'all',
                  dueDateRange: null
                })
              }}
            >
              {t('tasks.resetFilters', { defaultValue: 'Reimposta filtri' })}
            </Button>
            <Button type="primary" onClick={() => setFiltersOpen(false)}>
              {t('tasks.closeFilters', { defaultValue: 'Chiudi' })}
            </Button>
          </Flex>
        }
      >
        {filterContent}
      </Drawer>
    </>
  )
}

TaskFiltersBar.displayName = 'TaskFiltersBar'

export default TaskFiltersBar


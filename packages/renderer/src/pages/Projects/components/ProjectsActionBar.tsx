import { useMemo, type JSX, type ReactNode } from 'react'
import {
  AppstoreOutlined,
  FilterOutlined,
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
  TableOutlined,
  TeamOutlined,
  UserOutlined
} from '@ant-design/icons'
import { Button, Collapse, DatePicker, Flex, Input, Segmented, Select, Space } from 'antd'
import type { ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import dayjs, { type Dayjs } from 'dayjs'

import { BorderedPanel } from '@renderer/components/Surface/BorderedPanel'
import usePersistentCollapse from '@renderer/hooks/usePersistentCollapse'
import type { CreatedRange, RoleFilter, ViewMode } from '@renderer/pages/Projects/hooks/useProjectsPage'

const { RangePicker } = DatePicker

export interface ProjectsActionBarProps {
  onCreate: () => void
  onRefresh: () => void
  searchValue: string
  onSearchChange: (value: string) => void
  isRefreshing: boolean
  isCreating: boolean
  canCreate: boolean
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  availableTags: string[]
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  roleFilter: RoleFilter
  onRoleFilterChange: (role: RoleFilter) => void
  ownedOnly: boolean
  onOwnedOnlyChange: (value: boolean) => void
  createdBetween: CreatedRange
  onCreatedBetweenChange: (range: CreatedRange) => void
  secondaryActions?: ReactNode
}

export const ProjectsActionBar = ({
  onCreate,
  onRefresh,
  searchValue,
  onSearchChange,
  isRefreshing,
  isCreating,
  canCreate,
  viewMode,
  onViewModeChange,
  availableTags,
  selectedTags,
  onTagsChange,
  roleFilter,
  onRoleFilterChange,
  ownedOnly,
  onOwnedOnlyChange,
  createdBetween,
  onCreatedBetweenChange,
  secondaryActions
}: ProjectsActionBarProps): JSX.Element => {
  const { t } = useTranslation('projects')
  const [activePanels, handlePanelsChange] = usePersistentCollapse('projects.panels')
  const rangeValue = useMemo<[Dayjs | null, Dayjs | null] | null>(() => {
    if (!createdBetween) {
      return null
    }
    const [start, end] = createdBetween
    return [start ? dayjs(start) : null, end ? dayjs(end) : null]
  }, [createdBetween])

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value)
  }

  const handleRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (!dates) {
      onCreatedBetweenChange(null)
      return
    }
    const [start, end] = dates
    if (!start && !end) {
      onCreatedBetweenChange(null)
      return
    }
    onCreatedBetweenChange([
      start ? start.startOf('day').toISOString() : null,
      end ? end.endOf('day').toISOString() : null
    ])
  }

  const filterContent = (
    <Flex wrap gap={12} style={{ width: '100%' }}>
      <Input
        placeholder={t('filters.searchPlaceholder')}
        allowClear
        value={searchValue}
        onChange={handleSearchChange}
        size="large"
        style={{ flex: '2 1 280px', minWidth: 260 }}
      />
      <RangePicker
        allowClear
        value={rangeValue}
        onChange={(dates) => handleRangeChange(dates as [Dayjs | null, Dayjs | null] | null)}
        style={{ minWidth: 220, flex: '1 1 260px' }}
        placeholder={[t('filters.createdRange.start'), t('filters.createdRange.end')]}
      />
      <Select
        mode="multiple"
        size="large"
        style={{ minWidth: 220, flex: '1 1 220px' }}
        placeholder={t('filters.tagsPlaceholder')}
        value={selectedTags}
        onChange={onTagsChange}
        options={availableTags.map((tag) => ({ label: tag, value: tag }))}
        allowClear
      />
      <Select
        size="large"
        value={roleFilter}
        onChange={(value) => onRoleFilterChange(value as RoleFilter)}
        style={{ minWidth: 200, flex: '1 1 200px' }}
        options={[
          { value: 'all', label: t('filters.roleOptions.all') },
          { value: 'admin', label: t('filters.roleOptions.admin') },
          { value: 'edit', label: t('filters.roleOptions.edit') },
          { value: 'view', label: t('filters.roleOptions.view') }
        ]}
      />
    </Flex>
  )

  const actionsContent = (
    <Flex align="center" wrap gap={12}>
      <Segmented
        size="large"
        value={ownedOnly ? 'owned' : 'all'}
        onChange={(next) => onOwnedOnlyChange(next === 'owned')}
        options={[
          {
            label: (
              <Space size={6} style={{ color: 'inherit' }}>
                <TeamOutlined />
                <span>{t('filters.ownedOptions.all')}</span>
              </Space>
            ),
            value: 'all'
          },
          {
            label: (
              <Space size={6} style={{ color: 'inherit' }}>
                <UserOutlined />
                <span>{t('filters.ownedOptions.mine')}</span>
              </Space>
            ),
            value: 'owned'
          }
        ]}
      />
      <Segmented
        size="large"
        value={viewMode}
        onChange={(next) => onViewModeChange(next as ViewMode)}
        options={[
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
                <AppstoreOutlined />
                <span>{t('viewSwitcher.cards')}</span>
              </Space>
            ),
            value: 'cards'
          }
        ]}
      />
      <Space size="small" wrap>
        {secondaryActions}
        <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={isRefreshing}>
          {t('actions.refresh')}
        </Button>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onCreate}
          loading={isCreating}
          disabled={!canCreate}
        >
          {t('actions.create')}
        </Button>
      </Space>
    </Flex>
  )

  return (
    <BorderedPanel padding="lg" style={{ width: '100%' }}>
      <Flex vertical gap={16}>
        <Flex vertical gap={12}>
          <Space size={6} align="center">
            <SettingOutlined />
            <span>{t('actions.panelTitle', { defaultValue: 'Azioni' })}</span>
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
                  <span>{t('filters.panelTitle', { defaultValue: 'Filtri' })}</span>
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

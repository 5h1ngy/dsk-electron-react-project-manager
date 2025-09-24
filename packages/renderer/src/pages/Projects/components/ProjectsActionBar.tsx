import { useMemo, useState, type JSX, type ReactNode } from 'react'
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
import { Button, DatePicker, Drawer, Flex, Grid, Input, Segmented, Select, Space } from 'antd'
import type { ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import dayjs, { type Dayjs } from 'dayjs'

import { BorderedPanel } from '@renderer/components/Surface/BorderedPanel'
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
  const [filtersOpen, setFiltersOpen] = useState(false)
  const screens = Grid.useBreakpoint()
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
    <Flex vertical gap={16} style={{ width: '100%' }}>
      <Input
        placeholder={t('filters.searchPlaceholder')}
        allowClear
        value={searchValue}
        onChange={handleSearchChange}
        size="large"
      />
      <Flex vertical gap={12}>
        <RangePicker
          allowClear
          value={rangeValue}
          onChange={(dates) => handleRangeChange(dates as [Dayjs | null, Dayjs | null] | null)}
          placeholder={[t('filters.createdRange.start'), t('filters.createdRange.end')]}
          style={{ width: '100%' }}
        />
        <Select
          mode="multiple"
          size="large"
          placeholder={t('filters.tagsPlaceholder')}
          value={selectedTags}
          onChange={onTagsChange}
          options={availableTags.map((tag) => ({ label: tag, value: tag }))}
          allowClear
          style={{ width: '100%' }}
        />
        <Select
          size="large"
          value={roleFilter}
          onChange={(value) => onRoleFilterChange(value as RoleFilter)}
          options={[
            { value: 'all', label: t('filters.roleOptions.all') },
            { value: 'admin', label: t('filters.roleOptions.admin') },
            { value: 'edit', label: t('filters.roleOptions.edit') },
            { value: 'view', label: t('filters.roleOptions.view') }
          ]}
          style={{ width: '100%' }}
        />
      </Flex>
    </Flex>
  )

  const actionsContent = (
    <Flex align="center" wrap gap={12}>
      <Button
        icon={<FilterOutlined />}
        onClick={() => setFiltersOpen(true)}
        size="large"
      >
        {t('filters.openButton')}
      </Button>
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
    <>
      <BorderedPanel padding="lg" style={{ width: '100%' }}>
        <Flex vertical gap={12}>
          <Space size={6} align="center">
            <SettingOutlined />
            <span>{t('actions.panelTitle', { defaultValue: 'Azioni' })}</span>
          </Space>
          {actionsContent}
        </Flex>
      </BorderedPanel>
      <Drawer
        title={
          <Space size={6} align="center">
            <FilterOutlined />
            <span>{t('filters.panelTitle', { defaultValue: 'Filtri' })}</span>
          </Space>
        }
        placement="right"
        width={screens.lg ? 420 : '100%'}
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        destroyOnClose={false}
        maskClosable
      >
        {filterContent}
      </Drawer>
    </>
  )
}

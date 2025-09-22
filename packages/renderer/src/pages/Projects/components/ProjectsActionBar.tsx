import { useMemo, type JSX } from 'react'
import { AppstoreOutlined, PlusOutlined, ReloadOutlined, TableOutlined } from '@ant-design/icons'
import { Button, DatePicker, Input, Segmented, Select, Space, Switch, Typography } from 'antd'
import type { ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import dayjs, { type Dayjs } from 'dayjs'

import { BorderedPanel } from '@renderer/components/Surface/BorderedPanel'

type ViewMode = 'table' | 'cards'
type RoleFilter = 'all' | 'admin' | 'edit' | 'view'
type CreatedRange = [string | null, string | null] | null

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
  onCreatedBetweenChange
}: ProjectsActionBarProps): JSX.Element => {
  const { t } = useTranslation('projects')
  const rangeValue = useMemo<[Dayjs | null, Dayjs | null] | null>(() => {
    if (!createdBetween) {
      return null
    }
    const [start, end] = createdBetween
    return [
      start ? dayjs(start) : null,
      end ? dayjs(end) : null
    ]
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

  return (
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      <BorderedPanel padding="lg" style={{ width: '100%' }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Input
            placeholder={t('filters.searchPlaceholder')}
            allowClear
            value={searchValue}
            onChange={handleSearchChange}
            style={{ maxWidth: 360 }}
          />
          <Space size="middle" wrap align="center">
            <RangePicker
              allowClear
              value={rangeValue}
              onChange={(dates) => handleRangeChange(dates as [Dayjs | null, Dayjs | null] | null)}
              style={{ minWidth: 260 }}
              placeholder={[
                t('filters.createdRange.start'),
                t('filters.createdRange.end')
              ]}
            />
            <Select
              mode="multiple"
              style={{ minWidth: 220 }}
              placeholder={t('filters.tagsPlaceholder')}
              value={selectedTags}
              onChange={onTagsChange}
              options={availableTags.map((tag) => ({ label: tag, value: tag }))}
              allowClear
            />
            <Select
              value={roleFilter}
              onChange={(value) => onRoleFilterChange(value as RoleFilter)}
              style={{ width: 200 }}
              options={[
                { value: 'all', label: t('filters.roleOptions.all') },
                { value: 'admin', label: t('filters.roleOptions.admin') },
                { value: 'edit', label: t('filters.roleOptions.edit') },
                { value: 'view', label: t('filters.roleOptions.view') }
              ]}
            />
            <Space align="center">
              <Switch checked={ownedOnly} onChange={(checked) => onOwnedOnlyChange(checked)} />
              <Typography.Text>{t('filters.ownedOnly')}</Typography.Text>
            </Space>
          </Space>
        </Space>
      </BorderedPanel>
      <BorderedPanel padding="md" style={{ width: '100%' }}>
        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }} wrap>
          <Segmented
            size="large"
            value={viewMode}
            onChange={(next) => onViewModeChange(next as ViewMode)}
            options={[
              {
                label: (
                  <Space size={6}>
                    <TableOutlined />
                    <Typography.Text type="secondary">{t('viewSwitcher.table')}</Typography.Text>
                  </Space>
                ),
                value: 'table'
              },
              {
                label: (
                  <Space size={6}>
                    <AppstoreOutlined />
                    <Typography.Text type="secondary">{t('viewSwitcher.cards')}</Typography.Text>
                  </Space>
                ),
                value: 'cards'
              }
            ]}
          />
          <Space size="small" wrap>
            <Button
              icon={<ReloadOutlined />}
              onClick={onRefresh}
              loading={isRefreshing}
            >
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
        </Space>
      </BorderedPanel>
    </Space>
  )
}



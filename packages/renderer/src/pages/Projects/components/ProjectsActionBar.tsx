import type { JSX } from 'react'
import { Button, Input, Select, Space, Switch, Tooltip, Typography } from 'antd'
import { AppstoreOutlined, PlusOutlined, ReloadOutlined, TableOutlined } from '@ant-design/icons'
import type { ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'

type ViewMode = 'table' | 'cards'
type RoleFilter = 'all' | 'admin' | 'edit' | 'view'

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
  onOwnedOnlyChange
}: ProjectsActionBarProps): JSX.Element => {
  const { t } = useTranslation('projects')

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value)
  }

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }} wrap>
        <Input
          placeholder={t('filters.searchPlaceholder')}
          style={{ maxWidth: 360 }}
          allowClear
          value={searchValue}
          onChange={handleSearchChange}
        />
        <Space align="center" wrap>
          <Space align="center">
            <TableOutlined style={{ color: viewMode === 'table' ? '#1677ff' : undefined }} />
            <Switch
              checked={viewMode === 'cards'}
              onChange={(checked) => onViewModeChange(checked ? 'cards' : 'table')}
              checkedChildren={<AppstoreOutlined />}
              unCheckedChildren={<TableOutlined />}
            />
            <Typography.Text type="secondary">
              {viewMode === 'cards' ? t('viewSwitcher.cards') : t('viewSwitcher.table')}
            </Typography.Text>
          </Space>
          <Tooltip title={t('actions.refreshHint')}>
            <Button
              icon={<ReloadOutlined />}
              onClick={onRefresh}
              loading={isRefreshing}
              aria-label={t('actions.refresh')}
            />
          </Tooltip>
          <Tooltip
            title={
              canCreate
                ? t('actions.createHint')
                : t('permissions.createDeniedTooltip')
            }
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onCreate}
              loading={isCreating}
              disabled={!canCreate}
            >
              {t('actions.create')}
            </Button>
          </Tooltip>
        </Space>
      </Space>
      <Space size="middle" wrap>
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
  )
}



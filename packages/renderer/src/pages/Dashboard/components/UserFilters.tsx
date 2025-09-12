import { useMemo, type JSX } from 'react'
import { Input, Segmented, Select, Space, Tooltip, Typography } from 'antd'
import { AppstoreOutlined, SearchOutlined, TableOutlined, UserSwitchOutlined } from '@ant-design/icons'
import type { SegmentedValue } from 'antd/es/segmented'
import { useTranslation } from 'react-i18next'

import type { RoleName } from '@main/services/auth/constants'

export interface UserFiltersValue {
  search: string
  role: RoleName | 'all'
  status: 'all' | 'active' | 'inactive'
}

export interface UserFiltersProps {
  value: UserFiltersValue
  roleOptions: RoleName[]
  onChange: (value: Partial<UserFiltersValue>) => void
  viewMode: 'table' | 'cards'
  onViewModeChange: (mode: 'table' | 'cards') => void
  'aria-label'?: string
}

export const UserFilters = ({
  value,
  roleOptions,
  onChange,
  viewMode,
  onViewModeChange,
  'aria-label': ariaLabel
}: UserFiltersProps): JSX.Element => {
  const { t } = useTranslation('dashboard')
  const segmentedValue = useMemo<SegmentedValue>(() => value.status, [value.status])
  const viewSegmentedValue = useMemo<SegmentedValue>(() => viewMode, [viewMode])

  return (
    <Space direction="vertical" size="small" style={{ width: '100%' }} role="group" aria-label={ariaLabel}>
      <Space
        size="middle"
        style={{ width: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}
        align="center"
      >
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder={t('filters.users.searchPlaceholder')}
          value={value.search}
          onChange={(event) => onChange({ search: event.target.value })}
          style={{ minWidth: 220, flex: 1 }}
          size="large"
        />
        <Segmented
          size="large"
          value={viewSegmentedValue}
          onChange={(next) => onViewModeChange(next as 'table' | 'cards')}
          options={[
            {
              label: (
                <Space size={6}>
                  <TableOutlined />
                  <Typography.Text>{t('filters.users.view.table')}</Typography.Text>
                </Space>
              ),
              value: 'table'
            },
            {
              label: (
                <Space size={6}>
                  <AppstoreOutlined />
                  <Typography.Text>{t('filters.users.view.cards')}</Typography.Text>
                </Space>
              ),
              value: 'cards'
            }
          ]}
        />
      </Space>
      <Space size="middle" wrap align="center">
        <Tooltip title={t('filters.users.statusTooltip')}>
          <Segmented
            size="large"
            value={segmentedValue}
            onChange={(next) => onChange({ status: next as UserFiltersValue['status'] })}
            options={[
              { label: t('filters.users.status.all'), value: 'all' },
              { label: t('filters.users.status.active'), value: 'active' },
              { label: t('filters.users.status.inactive'), value: 'inactive' }
            ]}
          />
        </Tooltip>
        <Select<RoleName | 'all'>
          allowClear={false}
          size="large"
          style={{ minWidth: 200 }}
          value={value.role}
          onChange={(next) => onChange({ role: next })}
          options={[
            { label: t('filters.users.roles.all'), value: 'all' },
            ...roleOptions.map((role) => ({
              label: t(`roles.${role}`, { defaultValue: role }),
              value: role
            }))
          ]}
          suffixIcon={<UserSwitchOutlined />}
        />
      </Space>
    </Space>
  )
}

UserFilters.displayName = 'UserFilters'

export default UserFilters

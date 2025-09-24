import { useMemo, useState, type JSX } from 'react'
import { Button, Drawer, Flex, Grid, Input, Segmented, Select, Space, Typography, theme } from 'antd'
import {
  AppstoreOutlined,
  FilterOutlined,
  SearchOutlined,
  SettingOutlined,
  TableOutlined,
  UserSwitchOutlined
} from '@ant-design/icons'
import type { SegmentedValue } from 'antd/es/segmented'
import { useTranslation } from 'react-i18next'

import type { RoleName } from '@main/services/auth/constants'
import { BorderedPanel } from '@renderer/components/Surface/BorderedPanel'

export interface UserFiltersValue {
  search: string
  role: RoleName | 'all'
  status: 'all' | 'active' | 'inactive'
}

export interface UserFiltersProps {
  value: UserFiltersValue
  roleOptions: RoleName[]
  onChange: (value: Partial<UserFiltersValue>) => void
  onCreate: () => void
  onRefresh: () => void
  isRefreshing?: boolean
  canCreate?: boolean
  viewMode: 'table' | 'cards'
  onViewModeChange: (mode: 'table' | 'cards') => void
}

export const UserFilters = ({
  value,
  roleOptions,
  onChange,
  onCreate,
  onRefresh,
  isRefreshing = false,
  canCreate = true,
  viewMode,
  onViewModeChange
}: UserFiltersProps): JSX.Element => {
  const { t } = useTranslation('dashboard')
  const segmentedValue = useMemo<SegmentedValue>(() => value.status, [value.status])
  const [filtersOpen, setFiltersOpen] = useState(false)
  const screens = Grid.useBreakpoint()
  const { token } = theme.useToken()

  const filtersContent = (
    <Flex vertical gap={16}>
      <Input
        allowClear
        prefix={<SearchOutlined />}
        placeholder={t('filters.users.searchPlaceholder')}
        value={value.search}
        onChange={(event) => onChange({ search: event.target.value })}
        style={{ width: '100%' }}
        size="large"
      />
      <Flex vertical gap={12}>
        <Space direction="vertical" size={4}>
          <Typography.Text type="secondary">{t('filters.users.statusLabel')}</Typography.Text>
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
        </Space>
        <Select<RoleName | 'all'>
          allowClear={false}
          size="large"
          style={{ width: '100%' }}
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
      </Flex>
    </Flex>
  )

  const actionsContent = (
    <Flex align="center" wrap gap={12} justify="flex-end">
      <Button
        icon={<FilterOutlined />}
        onClick={() => setFiltersOpen(true)}
      >
        {t('filters.openButton')}
      </Button>
      <Space size="small" wrap>
        <Button type="primary" onClick={onCreate} disabled={!canCreate}>
          {t('dashboard:actionBar.create')}
        </Button>
        <Button onClick={onRefresh} loading={isRefreshing} disabled={isRefreshing}>
          {t('dashboard:actionBar.refresh')}
        </Button>
      </Space>
      <Segmented
        size="large"
        value={viewMode}
        onChange={(next) => onViewModeChange(next as 'table' | 'cards')}
        options={[
          {
            label: (
              <Space size={6} style={{ color: 'inherit' }}>
                <TableOutlined />
                <span>{t('filters.users.view.table')}</span>
              </Space>
            ),
            value: 'table'
          },
          {
            label: (
              <Space size={6} style={{ color: 'inherit' }}>
                <AppstoreOutlined />
                <span>{t('filters.users.view.cards')}</span>
              </Space>
            ),
            value: 'cards'
          }
        ]}
      />
    </Flex>
  )

  return (
    <>
      <BorderedPanel padding="lg" style={{ width: '100%' }}>
        <Flex vertical gap={12}>
          <Space size={6} align="center">
            <SettingOutlined />
            <span>{t('dashboard:actions.panelTitle', { defaultValue: 'Azioni' })}</span>
          </Space>
          {actionsContent}
        </Flex>
      </BorderedPanel>
      <Drawer
        placement="right"
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        width={screens.lg ? 420 : '100%'}
        title={
          <Space size={6} align="center">
            <FilterOutlined />
            <span>{t('dashboard:filters.panelTitle', { defaultValue: 'Filtri' })}</span>
          </Space>
        }
        contentWrapperStyle={{
          borderRadius: `${token.borderRadiusLG}px`,
          margin: screens.lg ? token.marginLG : 0,
          border: `${token.lineWidth}px solid ${token.colorBorderSecondary}`,
          boxShadow: token.boxShadowSecondary,
          overflow: 'hidden'
        }}
        styles={{
          header: { padding: token.paddingLG, marginBottom: 0 },
          body: { padding: token.paddingLG, display: 'flex', flexDirection: 'column', gap: 16 }
        }}
        footer={
          <Flex justify="space-between" align="center">
            <Button
              onClick={() => {
                onChange({ search: '', status: 'all', role: 'all' })
              }}
            >
              {t('filters.resetButton', { defaultValue: 'Reimposta filtri' })}
            </Button>
            <Button type="primary" onClick={() => setFiltersOpen(false)}>
              {t('filters.closeButton', { defaultValue: 'Chiudi' })}
            </Button>
          </Flex>
        }
      >
        {filtersContent}
      </Drawer>
    </>
  )
}

UserFilters.displayName = 'UserFilters'

export default UserFilters

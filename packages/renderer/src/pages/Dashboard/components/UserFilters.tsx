import { useMemo, useState, type JSX, type ReactNode } from 'react'
import {
  Button,
  Drawer,
  Flex,
  Grid,
  Input,
  Segmented,
  Select,
  Space,
  Typography,
  theme
} from 'antd'
import {
  AppstoreOutlined,
  BarsOutlined,
  FilterOutlined,
  SearchOutlined,
  TableOutlined,
  UserSwitchOutlined
} from '@ant-design/icons'
import type { SegmentedValue } from 'antd/es/segmented'
import { useTranslation } from 'react-i18next'
import { BorderedPanel } from '@renderer/components/Surface/BorderedPanel'
export interface UserFiltersValue {
  search: string
  role: string | 'all'
  status: 'all' | 'active' | 'inactive'
}
export interface UserFiltersProps {
  value: UserFiltersValue
  roleOptions: string[]
  onChange: (value: Partial<UserFiltersValue>) => void
  onCreate: () => void
  canCreate?: boolean
  viewMode: 'table' | 'list' | 'cards'
  onViewModeChange: (mode: 'table' | 'list' | 'cards') => void
  primaryActions?: ReactNode[]
}
export const UserFilters = ({
  value,
  roleOptions,
  onChange,
  onCreate,
  canCreate = true,
  viewMode,
  onViewModeChange,
  primaryActions = []
}: UserFiltersProps): JSX.Element => {
  const { t } = useTranslation('dashboard')
  const segmentedValue = useMemo<SegmentedValue>(() => value.status, [value.status])
  const [filtersOpen, setFiltersOpen] = useState(false)
  const screens = Grid.useBreakpoint()
  const isCompact = !screens.md
  const { token } = theme.useToken()
  const toolbarSegmentedStyle = useMemo(
    () => ({
      background: token.colorFillTertiary,
      border: `${token.lineWidth}px solid ${token.colorFillQuaternary}`,
      boxShadow: 'none',
      padding: token.paddingXXS,
      borderRadius: token.borderRadiusLG
    }),
    [
      token.borderRadiusLG,
      token.colorFillQuaternary,
      token.colorFillTertiary,
      token.lineWidth,
      token.paddingXXS
    ]
  )
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
        <Select<string | 'all'>
          allowClear={false}
          size="large"
          style={{ width: '100%' }}
          value={value.role}
          onChange={(next) => onChange({ role: next as UserFiltersValue['role'] })}
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
  const viewSegmentedOptions = useMemo(
    () => [
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
            <BarsOutlined />
            <span>{t('filters.users.view.list')}</span>
          </Space>
        ),
        value: 'list'
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
    ],
    [t]
  )
  const actionsContent = (
    <Flex align="center" wrap gap={12} style={{ width: '100%' }}>
      <Space size="small" wrap style={{ flex: '1 1 auto' }}>
        <Button type="primary" onClick={onCreate} disabled={!canCreate}>
          {t('dashboard:actionBar.create')}
        </Button>
        {primaryActions.length
          ? primaryActions.map((action, index) => (
              <div key={`primary-action-${index}`} style={isCompact ? { width: '100%' } : undefined}>
                {action}
              </div>
            ))
          : null}
      </Space>
      <Flex align="center" gap={12} wrap style={{ justifyContent: 'flex-end', flexShrink: 0 }}>
        <Segmented
          size="large"
          value={viewMode}
          onChange={(next) => onViewModeChange(next as 'table' | 'list' | 'cards')}
          options={viewSegmentedOptions}
          style={toolbarSegmentedStyle}
        />
        <Button icon={<FilterOutlined />} onClick={() => setFiltersOpen(true)}>
          {t('filters.users.openButton')}
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
        title={
          <Space size={6} align="center">
            <FilterOutlined />
            <span>{t('dashboard:filters.panelTitle', { defaultValue: 'Filtri' })}</span>
          </Space>
        }
        styles={{
          wrapper: {
            borderRadius: `${token.borderRadiusLG}px`,
            margin: screens.lg ? token.marginLG : 0,
            border: `${token.lineWidth}px solid ${token.colorBorderSecondary}`,
            boxShadow: token.boxShadowSecondary,
            overflow: 'hidden'
          },
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

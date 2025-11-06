import { useCallback, useMemo, useState, type CSSProperties, type JSX, type ReactNode } from 'react'
import {
  Button,
  DatePicker,
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
  AppstoreAddOutlined,
  AppstoreOutlined,
  BarsOutlined,
  FilterOutlined,
  SearchOutlined,
  TableOutlined,
  UserSwitchOutlined
} from '@ant-design/icons'
import type { SegmentedValue } from 'antd/es/segmented'
import { useTranslation } from 'react-i18next'
import dayjs, { type Dayjs } from 'dayjs'

import { BorderedPanel } from '@renderer/components/Surface/BorderedPanel'

const { RangePicker } = DatePicker

export interface UserFiltersValue {
  search: string
  username: string
  displayName: string
  role: string | 'all'
  status: 'all' | 'active' | 'inactive'
  lastLoginRange: [string | null, string | null] | null
  createdRange: [string | null, string | null] | null
  updatedRange: [string | null, string | null] | null
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
  onOpenOptionalFields?: () => void
  hasOptionalFields?: boolean
  optionalFieldsDisabled?: boolean
}

export const UserFilters = ({
  value,
  roleOptions,
  onChange,
  onCreate,
  canCreate = true,
  viewMode,
  onViewModeChange,
  primaryActions = [],
  onOpenOptionalFields,
  hasOptionalFields = false,
  optionalFieldsDisabled = false
}: UserFiltersProps): JSX.Element => {
  const { t } = useTranslation('dashboard')
  const segmentedValue = useMemo<SegmentedValue>(() => value.status, [value.status])
  const [filtersOpen, setFiltersOpen] = useState(false)
  const screens = Grid.useBreakpoint()
  const isCompact = !screens.md
  const { token } = theme.useToken()
  const toolbarButtonStyle = useMemo(() => {
    const base: CSSProperties = {
      minHeight: token.controlHeightLG,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
    return isCompact ? { ...base, width: '100%' } : base
  }, [isCompact, token.controlHeightLG])

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

  const toPickerValue = useCallback(
    (range: UserFiltersValue['lastLoginRange']) =>
      range
        ? ([range[0] ? dayjs(range[0]) : null, range[1] ? dayjs(range[1]) : null] as [
            Dayjs | null,
            Dayjs | null
          ])
        : null,
    []
  )

  const handleRangeChange = useCallback(
    (
      key: 'lastLoginRange' | 'createdRange' | 'updatedRange',
      dates: [Dayjs | null, Dayjs | null] | null
    ) => {
      if (!dates) {
        onChange({ [key]: null } as Partial<UserFiltersValue>)
        return
      }
      const [start, end] = dates
      onChange({
        [key]: [
          start ? start.startOf('day').toISOString() : null,
          end ? end.endOf('day').toISOString() : null
        ]
      } as Partial<UserFiltersValue>)
    },
    [onChange]
  )

  const lastLoginValue = useMemo(
    () => toPickerValue(value.lastLoginRange),
    [toPickerValue, value.lastLoginRange]
  )
  const createdValue = useMemo(
    () => toPickerValue(value.createdRange),
    [toPickerValue, value.createdRange]
  )
  const updatedValue = useMemo(
    () => toPickerValue(value.updatedRange),
    [toPickerValue, value.updatedRange]
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
      <Input
        allowClear
        prefix={<SearchOutlined />}
        placeholder={t('filters.users.usernamePlaceholder', {
          defaultValue: 'Filtra per username'
        })}
        value={value.username}
        onChange={(event) => onChange({ username: event.target.value })}
        style={{ width: '100%' }}
        size="large"
      />
      <Input
        allowClear
        prefix={<SearchOutlined />}
        placeholder={t('filters.users.displayNamePlaceholder', { defaultValue: 'Filtra per nome' })}
        value={value.displayName}
        onChange={(event) => onChange({ displayName: event.target.value })}
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
      <Flex vertical gap={12}>
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Typography.Text type="secondary">
            {t('filters.users.lastLoginRangeLabel', { defaultValue: 'Ultimo accesso' })}
          </Typography.Text>
          <RangePicker
            value={lastLoginValue}
            onChange={(dates) => handleRangeChange('lastLoginRange', dates)}
            style={{ width: '100%' }}
            allowClear
          />
        </Space>
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Typography.Text type="secondary">
            {t('filters.users.createdRangeLabel', { defaultValue: 'Creato il' })}
          </Typography.Text>
          <RangePicker
            value={createdValue}
            onChange={(dates) => handleRangeChange('createdRange', dates)}
            style={{ width: '100%' }}
            allowClear
          />
        </Space>
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Typography.Text type="secondary">
            {t('filters.users.updatedRangeLabel', { defaultValue: 'Aggiornato il' })}
          </Typography.Text>
          <RangePicker
            value={updatedValue}
            onChange={(dates) => handleRangeChange('updatedRange', dates)}
            style={{ width: '100%' }}
            allowClear
          />
        </Space>
      </Flex>
    </Flex>
  )

  const viewSegmentedOptions = useMemo(
    () =>
      (['table', 'list', 'cards'] as const).map((key) => ({
        label: (
          <Space size={6} style={{ color: 'inherit' }}>
            {key === 'table' ? (
              <TableOutlined />
            ) : key === 'list' ? (
              <BarsOutlined />
            ) : (
              <AppstoreOutlined />
            )}
            {!isCompact ? <span>{t(`filters.users.view.${key}`)}</span> : null}
          </Space>
        ),
        value: key
      })),
    [isCompact, t]
  )

  const actionsContent = (
    <Flex align="center" wrap gap={12} style={{ width: '100%' }}>
      <Space size="small" wrap style={{ flex: '1 1 auto' }}>
        <Button
          type="primary"
          onClick={onCreate}
          disabled={!canCreate}
          size="large"
          style={toolbarButtonStyle}
        >
          {t('dashboard:actionBar.create')}
        </Button>
        {primaryActions.length
          ? primaryActions.map((action, index) => (
              <div
                key={`primary-action-${index}`}
                style={
                  isCompact
                    ? { width: '100%', display: 'inline-flex', alignItems: 'stretch' }
                    : { display: 'inline-flex', alignItems: 'stretch' }
                }
              >
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
          block={isCompact}
        />
        {hasOptionalFields ? (
          <Button
            icon={<AppstoreAddOutlined />}
            size="large"
            disabled={optionalFieldsDisabled}
            onClick={onOpenOptionalFields}
            style={toolbarButtonStyle}
          >
            {t('dashboard:optionalColumns.button', { defaultValue: 'Campi opzionali' })}
          </Button>
        ) : null}
        <Button
          icon={<FilterOutlined />}
          onClick={() => setFiltersOpen(true)}
          size="large"
          style={toolbarButtonStyle}
        >
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
                onChange({
                  search: '',
                  username: '',
                  displayName: '',
                  status: 'all',
                  role: 'all',
                  lastLoginRange: null,
                  createdRange: null,
                  updatedRange: null
                })
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

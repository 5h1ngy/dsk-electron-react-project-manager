import { useEffect, useMemo, useState, type JSX, type ReactNode, type CSSProperties } from 'react'
import {
  AppstoreOutlined,
  AppstoreAddOutlined,
  BarsOutlined,
  FilterOutlined,
  PlusOutlined,
  SaveOutlined,
  TableOutlined,
  TeamOutlined,
  UserOutlined
} from '@ant-design/icons'
import {
  Button,
  DatePicker,
  Drawer,
  Flex,
  Grid,
  Input,
  Modal,
  Segmented,
  Select,
  Space,
  Typography,
  theme
} from 'antd'
import type { ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import dayjs, { type Dayjs } from 'dayjs'

import { BorderedPanel } from '@renderer/components/Surface/BorderedPanel'
import type {
  CreatedRange,
  RoleFilter,
  ViewMode
} from '@renderer/pages/Projects/hooks/useProjectsPage'

const { RangePicker } = DatePicker

export interface ProjectsActionBarProps {
  onCreate: () => void
  searchValue: string
  onSearchChange: (value: string) => void
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
  savedViewsControls?: ReactNode
  optionalFieldControls?: {
    content: ReactNode
    hasOptions: boolean
    disabled: boolean
  }
  primaryActions?: ReactNode[]
}

export const ProjectsActionBar = ({
  onCreate,
  searchValue,
  onSearchChange,
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
  secondaryActions,
  savedViewsControls,
  optionalFieldControls,
  primaryActions = []
}: ProjectsActionBarProps): JSX.Element => {
  const { t } = useTranslation('projects')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [optionalFieldsOpen, setOptionalFieldsOpen] = useState(false)
  const screens = Grid.useBreakpoint()
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
  const rangeValue = useMemo<[Dayjs | null, Dayjs | null] | null>(() => {
    if (!createdBetween) {
      return null
    }
    const [start, end] = createdBetween
    return [start ? dayjs(start) : null, end ? dayjs(end) : null]
  }, [createdBetween])

  const isCompact = !screens.md

  useEffect(() => {
    if (!optionalFieldControls?.hasOptions && optionalFieldsOpen) {
      setOptionalFieldsOpen(false)
    }
  }, [optionalFieldControls?.hasOptions, optionalFieldsOpen])

  useEffect(() => {
    if (optionalFieldControls?.disabled && optionalFieldsOpen) {
      setOptionalFieldsOpen(false)
    }
  }, [optionalFieldControls?.disabled, optionalFieldsOpen])

  const viewSegmentedOptions = useMemo(
    () => [
      {
        label: (
          <Space size={6} style={{ color: 'inherit' }}>
            <TableOutlined />
            {!isCompact ? <span>{t('viewSwitcher.table')}</span> : null}
          </Space>
        ),
        value: 'table'
      },
      {
        label: (
          <Space size={6} style={{ color: 'inherit' }}>
            <BarsOutlined />
            {!isCompact ? <span>{t('viewSwitcher.list')}</span> : null}
          </Space>
        ),
        value: 'list'
      },
      {
        label: (
          <Space size={6} style={{ color: 'inherit' }}>
            <AppstoreOutlined />
            {!isCompact ? <span>{t('viewSwitcher.cards')}</span> : null}
          </Space>
        ),
        value: 'cards'
      }
    ],
    [isCompact, t]
  )

  const segmentedStyle = useMemo(
    () => ({
      ...toolbarSegmentedStyle,
      width: isCompact ? '100%' : undefined,
      display: 'flex',
      justifyContent: 'space-between'
    }),
    [toolbarSegmentedStyle, isCompact]
  )

  const buttonFullWidthStyle = useMemo<CSSProperties | undefined>(
    () => (isCompact ? { width: '100%' } : undefined),
    [isCompact]
  )

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
      {savedViewsControls ? (
        <BorderedPanel
          padding="md"
          styles={{
            body: {
              display: 'flex',
              flexDirection: 'column',
              gap: token.paddingSM
            }
          }}
          title={
            <Space size={6} align="center">
              <SaveOutlined />
              <span>
                {t('views.panelTitle', {
                  defaultValue: t('views.placeholder')
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
        placeholder={t('filters.searchPlaceholder')}
        allowClear
        value={searchValue}
        onChange={handleSearchChange}
        size="large"
      />
      <Flex vertical gap={12}>
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
          style={{ alignSelf: 'flex-start' }}
        />
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
    <Flex vertical={isCompact} align={isCompact ? 'stretch' : 'center'} gap={12} style={{ width: '100%' }}>
      <Flex
        align={isCompact ? 'stretch' : 'center'}
        vertical={isCompact}
        gap={12}
        wrap={!isCompact}
        style={{ flex: '1 1 auto' }}
      >
        {secondaryActions ? (
          <Space size="small" wrap>
            {secondaryActions}
          </Space>
        ) : null}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onCreate}
          loading={isCreating}
          disabled={!canCreate}
          style={buttonFullWidthStyle}
        >
          {t('actions.create')}
        </Button>
        {primaryActions.length
          ? primaryActions.map((action, index) => (
              <div key={`primary-action-${index}`} style={buttonFullWidthStyle}>
                {action}
              </div>
            ))
          : null}
      </Flex>
      <Flex
        align={isCompact ? 'stretch' : 'center'}
        vertical={isCompact}
        gap={12}
        style={{ justifyContent: 'flex-end', flexShrink: 0 }}
      >
        <Segmented
          size="large"
          value={viewMode}
          onChange={(next) => onViewModeChange(next as ViewMode)}
          options={viewSegmentedOptions}
          block={isCompact}
          style={segmentedStyle}
        />
        {optionalFieldControls && optionalFieldControls.hasOptions ? (
          <Button
            icon={<AppstoreAddOutlined />}
            size="large"
            disabled={optionalFieldControls.disabled}
            onClick={() => {
              if (!optionalFieldControls.disabled) {
                setOptionalFieldsOpen(true)
              }
            }}
            style={buttonFullWidthStyle}
          >
            {t('optionalColumns.button', { defaultValue: 'Optional fields' })}
          </Button>
        ) : null}
        <Button
          icon={<FilterOutlined />}
          onClick={() => setFiltersOpen(true)}
          size="large"
          style={buttonFullWidthStyle}
        >
          {t('filters.openButton')}
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
        destroyOnHidden={false}
        maskClosable
        styles={{
          wrapper: {
            borderRadius: `${token.borderRadiusLG}px`,
            margin: screens.lg ? token.marginLG : 0,
            border: `${token.lineWidth}px solid ${token.colorBorderSecondary}`,
            boxShadow: token.boxShadowSecondary,
            overflow: 'hidden'
          },
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
                onSearchChange('')
                onTagsChange([])
                onRoleFilterChange('all')
                onOwnedOnlyChange(false)
                onCreatedBetweenChange(null)
              }}
            >
              {t('filters.reset', { defaultValue: 'Reimposta filtri' })}
            </Button>
            <Button type="primary" onClick={() => setFiltersOpen(false)}>
              {t('filters.close', { defaultValue: 'Chiudi' })}
            </Button>
          </Flex>
        }
      >
        {filterContent}
      </Drawer>
      {optionalFieldControls && optionalFieldControls.hasOptions ? (
        <Modal
          open={optionalFieldsOpen}
          title={t('optionalColumns.modalTitle', { defaultValue: 'Optional fields' })}
          onCancel={() => setOptionalFieldsOpen(false)}
          footer={null}
          destroyOnClose={false}
          centered
          styles={{
            body: {
              paddingTop: token.paddingLG,
              paddingBottom: token.paddingLG,
              display: 'flex',
              flexDirection: 'column',
              gap: token.marginLG
            }
          }}
        >
          <Flex vertical gap={token.marginMD}>
            <Typography.Paragraph style={{ marginBottom: 0 }}>
              {t('optionalColumns.description', {
                defaultValue: 'Select the additional fields to display in the table view.'
              })}
            </Typography.Paragraph>
            {optionalFieldControls.content}
          </Flex>
        </Modal>
      ) : null}
    </>
  )
}

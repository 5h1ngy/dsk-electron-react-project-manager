import { useCallback, useMemo, type JSX, type MouseEvent, type ReactNode } from 'react'
import { Flex, Select, Tag, Typography } from 'antd'
import type { SelectProps } from 'antd'
import { useTranslation } from 'react-i18next'
import type { CustomTagProps } from 'rc-select/lib/BaseSelect'
import {
  OPTIONAL_USER_COLUMNS,
  OPTION_LABEL_KEYS,
  type OptionalUserColumn
} from './UserColumnVisibilityControls.constants'
import { useSemanticBadges, buildBadgeStyle } from '@renderer/theme/hooks/useSemanticBadges'

export { OPTIONAL_USER_COLUMNS } from './UserColumnVisibilityControls.constants'
export type { OptionalUserColumn } from './UserColumnVisibilityControls.constants'

type ExtendedCustomTagProps = CustomTagProps & {
  className?: string
  closeIcon?: ReactNode
  disabled?: boolean
}

export interface UserColumnVisibilityControlsProps {
  columns: ReadonlyArray<OptionalUserColumn>
  selectedColumns: ReadonlyArray<OptionalUserColumn>
  onChange: (next: OptionalUserColumn[]) => void
  disabledOptions?: ReadonlyArray<OptionalUserColumn>
}

export const UserColumnVisibilityControls = ({
  columns,
  selectedColumns,
  onChange,
  disabledOptions = []
}: UserColumnVisibilityControlsProps): JSX.Element => {
  const { t } = useTranslation()
  const badgeTokens = useSemanticBadges()

  const getColumnBadgeStyle = useMemo(() => {
    const cache = new Map<OptionalUserColumn, ReturnType<typeof buildBadgeStyle>>()
    return (column: OptionalUserColumn) => {
      if (!cache.has(column)) {
        cache.set(column, buildBadgeStyle(badgeTokens.tag(column)))
      }
      return cache.get(column)!
    }
  }, [badgeTokens])

  const options = useMemo<SelectProps<string>['options']>(() => {
    const disabled = new Set(disabledOptions)
    return columns.map((column) => ({
      label: t(OPTION_LABEL_KEYS[column]),
      value: column,
      disabled: disabled.has(column)
    }))
  }, [columns, disabledOptions, getColumnBadgeStyle, t])

  const renderTag = useCallback(
    (tagProps: CustomTagProps) => {
      const { value, closable, onClose, className, disabled, closeIcon } =
        tagProps as ExtendedCustomTagProps
      const fallbackColumn = columns[0] ?? OPTIONAL_USER_COLUMNS[0]
      const column = (value as OptionalUserColumn) ?? (fallbackColumn as OptionalUserColumn)
      const preventMouseDown = (event: MouseEvent<HTMLSpanElement>) => {
        event.preventDefault()
        event.stopPropagation()
      }
      const labelKey = OPTION_LABEL_KEYS[column]
      const label =
        labelKey !== undefined
          ? t(labelKey)
          : typeof tagProps.label === 'string'
            ? tagProps.label
            : String(value ?? '')

      return (
        <Tag
          className={className}
          bordered={false}
          closable={closable && !disabled}
          onClose={onClose}
          onMouseDown={preventMouseDown}
          closeIcon={closeIcon}
          style={{ ...getColumnBadgeStyle(column), marginInlineEnd: 4 }}
        >
          {label}
        </Tag>
      )
    },
    [columns, getColumnBadgeStyle, t]
  )

  return (
    <Flex vertical gap={12} style={{ width: '100%' }}>
      <Typography.Text type="secondary">
        {t('dashboard:optionalColumns.description', {
          defaultValue: 'Scegli le colonne aggiuntive da visualizzare nella tabella degli utenti.'
        })}
      </Typography.Text>
      <Select
        mode="multiple"
        allowClear={false}
        options={options}
        value={selectedColumns as unknown as string[]}
        tagRender={renderTag}
        onChange={(values) => {
          const normalized = Array.isArray(values) ? (values as string[]) : []
          onChange(Array.from(new Set(normalized)) as OptionalUserColumn[])
        }}
        style={{ width: '100%' }}
        size="large"
        placeholder={t('dashboard:optionalColumns.placeholder', {
          defaultValue: 'Seleziona le colonne opzionali'
        })}
      />
    </Flex>
  )
}

UserColumnVisibilityControls.displayName = 'UserColumnVisibilityControls'

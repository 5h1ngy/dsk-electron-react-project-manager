import { useMemo, type JSX } from 'react'
import { Flex, Select, Typography } from 'antd'
import type { SelectProps } from 'antd'
import { useTranslation } from 'react-i18next'

export const OPTIONAL_USER_COLUMNS = ['id', 'lastLoginAt', 'createdAt', 'updatedAt'] as const

export type OptionalUserColumn = (typeof OPTIONAL_USER_COLUMNS)[number]

const OPTION_LABEL_KEYS: Record<OptionalUserColumn, string> = {
  id: 'dashboard:optionalColumns.columns.id',
  lastLoginAt: 'dashboard:optionalColumns.columns.lastLoginAt',
  createdAt: 'dashboard:optionalColumns.columns.createdAt',
  updatedAt: 'dashboard:optionalColumns.columns.updatedAt'
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

  const options = useMemo<SelectProps<string>['options']>(() => {
    const disabled = new Set(disabledOptions)
    return columns.map((column) => ({
      label: t(OPTION_LABEL_KEYS[column]),
      value: column,
      disabled: disabled.has(column)
    }))
  }, [columns, disabledOptions, t])

  return (
    <Flex vertical gap={12} style={{ width: '100%' }}>
      <Typography.Text type="secondary">
        {t('dashboard:optionalColumns.description', {
          defaultValue:
            'Scegli le colonne aggiuntive da visualizzare nella tabella degli utenti.'
        })}
      </Typography.Text>
      <Select
        mode="multiple"
        allowClear={false}
        options={options}
        value={selectedColumns as unknown as string[]}
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

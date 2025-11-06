import { useMemo, type JSX } from 'react'
import { Checkbox, Flex, Typography } from 'antd'
import type { CheckboxOptionType } from 'antd/es/checkbox'
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

  const checkboxOptions = useMemo<CheckboxOptionType[]>(() => {
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
      <Checkbox.Group
        options={checkboxOptions}
        value={selectedColumns as OptionalUserColumn[]}
        onChange={(values) => onChange((values as OptionalUserColumn[]) ?? [])}
        style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
      />
    </Flex>
  )
}

UserColumnVisibilityControls.displayName = 'UserColumnVisibilityControls'


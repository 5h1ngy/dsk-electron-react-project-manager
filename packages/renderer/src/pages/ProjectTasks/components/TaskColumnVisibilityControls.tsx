import type { JSX } from 'react'
import { Checkbox, Space, Typography } from 'antd'
import type { CheckboxValueType } from 'antd/es/checkbox'
import { useTranslation } from 'react-i18next'

export const OPTIONAL_TASK_COLUMNS = ['commentCount'] as const
export type OptionalTaskColumn = (typeof OPTIONAL_TASK_COLUMNS)[number]

const LABEL_KEY_BY_COLUMN: Record<OptionalTaskColumn, string> = {
  commentCount: 'details.tasksColumns.comments'
}

export interface TaskColumnVisibilityControlsProps {
  columns: ReadonlyArray<OptionalTaskColumn>
  selectedColumns: ReadonlyArray<OptionalTaskColumn>
  onChange: (next: OptionalTaskColumn[]) => void
  disabled?: boolean
}

const TaskColumnVisibilityControls = ({
  columns,
  selectedColumns,
  onChange,
  disabled = false
}: TaskColumnVisibilityControlsProps): JSX.Element | null => {
  const { t } = useTranslation('projects')
  const availableColumns = columns.filter((column) => LABEL_KEY_BY_COLUMN[column])

  if (availableColumns.length === 0) {
    return null
  }

  const handleChange = (values: CheckboxValueType[]) => {
    const selectedSet = new Set(values)
    const next = availableColumns.filter((column) => selectedSet.has(column))
    onChange(next)
  }

  return (
    <Space direction="vertical" size={4}>
      <Typography.Text type="secondary">{t('tasks.optionalColumns.label')}</Typography.Text>
      <Checkbox.Group
        disabled={disabled}
        options={availableColumns.map((column) => ({
          label: t(LABEL_KEY_BY_COLUMN[column]),
          value: column
        }))}
        value={selectedColumns}
        onChange={handleChange}
      />
    </Space>
  )
}

TaskColumnVisibilityControls.displayName = 'TaskColumnVisibilityControls'

export { TaskColumnVisibilityControls }
export default TaskColumnVisibilityControls

/* eslint-disable react-refresh/only-export-components */
import type { JSX } from 'react'
import { Checkbox, Flex, Space, Typography } from 'antd'
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

  const handleChange = (values: Array<string | number>) => {
    const selectedSet = new Set(values as OptionalTaskColumn[])
    const next = availableColumns.filter((column) => selectedSet.has(column))
    onChange(next)
  }

  return (
    <Flex vertical gap={8} style={{ width: '100%' }}>
      <Typography.Text type="secondary">{t('tasks.optionalColumns.label')}</Typography.Text>
      <Flex vertical gap={8}>
        <Checkbox.Group
          disabled={disabled}
          value={selectedColumns as OptionalTaskColumn[]}
          onChange={handleChange}
        >
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            {availableColumns.map((column) => (
              <Checkbox key={column} value={column}>
                {t(LABEL_KEY_BY_COLUMN[column])}
              </Checkbox>
            ))}
          </Space>
        </Checkbox.Group>
      </Flex>
    </Flex>
  )
}

TaskColumnVisibilityControls.displayName = 'TaskColumnVisibilityControls'

export { TaskColumnVisibilityControls }
export default TaskColumnVisibilityControls

import { Table, Tag, Typography } from 'antd'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { useTranslation } from 'react-i18next'

import type { TaskDetails } from '@renderer/store/slices/tasks'

export interface ProjectTasksTableProps {
  tasks: TaskDetails[]
  loading: boolean
  onSelect: (task: TaskDetails) => void
  pagination?: TablePaginationConfig | false
}

const priorityColors: Record<TaskDetails['priority'], string> = {
  low: 'green',
  medium: 'blue',
  high: 'orange',
  critical: 'red'
}

const statusColors: Record<TaskDetails['status'], string> = {
  todo: 'default',
  in_progress: 'blue',
  blocked: 'volcano',
  done: 'green'
}

export const ProjectTasksTable = ({
  tasks,
  loading,
  onSelect,
  pagination
}: ProjectTasksTableProps) => {
  const { t, i18n } = useTranslation('projects')

  const columns: ColumnsType<TaskDetails> = [
    {
      title: t('details.tasksColumns.key'),
      dataIndex: 'key',
      key: 'key',
      width: 120,
      render: (value: string) => <Typography.Text strong>{value}</Typography.Text>
    },
    {
      title: t('details.tasksColumns.title'),
      dataIndex: 'title',
      key: 'title',
      render: (value: string, record) => (
        <div style={{ maxWidth: 480 }}>
          <Typography.Text ellipsis={{ tooltip: value }}>{value}</Typography.Text>
          {record.description ? (
            <Typography.Paragraph
              type="secondary"
              ellipsis={{ rows: 1, tooltip: record.description }}
              style={{ marginBottom: 0 }}
            >
              {record.description}
            </Typography.Paragraph>
          ) : null}
        </div>
      )
    },
    {
      title: t('details.tasksColumns.status'),
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (value: TaskDetails['status']) => (
        <Tag color={statusColors[value]}>{t(`details.status.${value}`)}</Tag>
      )
    },
    {
      title: t('details.tasksColumns.priority'),
      dataIndex: 'priority',
      key: 'priority',
      width: 140,
      render: (value: TaskDetails['priority']) => (
        <Tag color={priorityColors[value]}>{t(`details.priority.${value}`)}</Tag>
      )
    },
    {
      title: t('details.tasksColumns.assignee'),
      dataIndex: ['assignee', 'displayName'],
      key: 'assignee',
      width: 180,
      render: (_value: string, record) =>
        record.assignee?.displayName ?? t('details.noAssignee')
    },
    {
      title: t('details.tasksColumns.dueDate'),
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 160,
      render: (value: string | null) =>
        value
          ? new Intl.DateTimeFormat(i18n.language, {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            }).format(new Date(value))
          : t('details.noDueDate')
    }
  ]

  return (
    <Table<TaskDetails>
      rowKey="id"
      columns={columns}
      dataSource={tasks}
      loading={loading}
      pagination={pagination ?? false}
      size="middle"
      scroll={{ x: 960 }}
      onRow={(record) => ({
        onClick: () => onSelect(record)
      })}
      locale={{
        emptyText: loading ? t('details.tasksLoading') : t('details.tasksEmpty')
      }}
    />
  )
}

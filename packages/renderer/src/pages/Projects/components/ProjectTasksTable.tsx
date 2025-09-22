import { Button, Popconfirm, Space, Table, Tag, Typography, theme } from 'antd'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { useTranslation } from 'react-i18next'
import { DeleteOutlined, EditOutlined, MessageOutlined } from '@ant-design/icons'

import { useSemanticBadges, buildBadgeStyle } from '@renderer/theme/hooks/useSemanticBadges'

import { EmptyState, LoadingSkeleton } from '@renderer/components/DataStates'
import { useDelayedLoading } from '@renderer/hooks/useDelayedLoading'
import type { TaskDetails } from '@renderer/store/slices/tasks'

export interface ProjectTasksTableProps {
  tasks: TaskDetails[]
  loading: boolean
  onSelect: (task: TaskDetails) => void
  onEdit: (task: TaskDetails) => void
  onDelete: (task: TaskDetails) => Promise<void> | void
  canManage: boolean
  deletingTaskId?: string | null
  pagination?: TablePaginationConfig | false
  showCommentColumn?: boolean
}

export const ProjectTasksTable = ({
  tasks,
  loading,
  onSelect,
  onEdit,
  onDelete,
  canManage,
  deletingTaskId,
  pagination,
  showCommentColumn = false
}: ProjectTasksTableProps) => {
  const { t, i18n } = useTranslation('projects')
  const showSkeleton = useDelayedLoading(loading)
  const badgeTokens = useSemanticBadges()
  const { token } = theme.useToken()

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
        <Space
          direction="vertical"
          size={token.marginXXS}
          style={{ maxWidth: 480, width: '100%' }}
        >
          <Typography.Text ellipsis>{value}</Typography.Text>
          {record.description ? (
            <Typography.Paragraph
              type="secondary"
              ellipsis={{ rows: 1 }}
              style={{ marginBottom: 0 }}
            >
              {record.description}
            </Typography.Paragraph>
          ) : null}
        </Space>
      )
    },
    {
      title: t('details.tasksColumns.status'),
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (value: TaskDetails['status']) => (
        <Tag bordered={false} style={buildBadgeStyle(badgeTokens.status[value])}>
          {t(`details.status.${value}`)}
        </Tag>
      )
    },
    {
      title: t('details.tasksColumns.priority'),
      dataIndex: 'priority',
      key: 'priority',
      width: 140,
      render: (value: TaskDetails['priority']) => (
        <Tag bordered={false} style={buildBadgeStyle(badgeTokens.priority[value])}>
          {t(`details.priority.${value}`)}
        </Tag>
      )
    },
    {
      title: t('details.tasksColumns.assignee'),
      dataIndex: ['assignee', 'displayName'],
      key: 'assignee',
      width: 180,
      render: (_value: string, record) => record.assignee?.displayName ?? t('details.noAssignee')
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
    },
    {
      title: canManage ? t('tasks.columns.actions') : undefined,
      key: 'actions',
      width: canManage ? 120 : 0,
        render: (_value: unknown, record: TaskDetails) =>
        canManage ? (
          <Space size={4}>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={(event) => {
                event.stopPropagation()
                onEdit(record)
              }}
            >
              {t('tasks.actions.edit')}
            </Button>
            <Popconfirm
              title={t('tasks.actions.deleteTitle')}
              description={t('tasks.actions.deleteDescription', { title: record.title })}
              okText={t('tasks.actions.deleteConfirm')}
              cancelText={t('tasks.actions.cancel')}
              onConfirm={async () => await onDelete(record)}
              okButtonProps={{ loading: deletingTaskId === record.id }}
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                loading={deletingTaskId === record.id}
                onClick={(event) => event.stopPropagation()}
              >
                {t('tasks.actions.delete')}
              </Button>
            </Popconfirm>
          </Space>
        ) : null
    }
  ]

  if (showCommentColumn) {
    columns.splice(4, 0, {
      title: t('details.tasksColumns.comments'),
      dataIndex: 'commentCount',
      key: 'commentCount',
      width: 120,
      render: (_value: number, record: TaskDetails) => (
        <Tag
          bordered={false}
          icon={<MessageOutlined />}
          style={buildBadgeStyle(badgeTokens.comment)}
        >
          {record.commentCount ?? 0}
        </Tag>
      )
    })
  }

  if (showSkeleton) {
    return <LoadingSkeleton variant="table" />
  }

  return (
    <Table<TaskDetails>
      rowKey="id"
      columns={columns}
      dataSource={tasks}
      pagination={pagination}
      size="middle"
      scroll={{ x: 'max-content' }}
      onRow={(record) => ({
        onClick: () => onSelect(record)
      })}
      locale={{
        emptyText: (
          <EmptyState
            title={t('details.tasksEmpty')}
            description={t('details.tasksSearchPlaceholder')}
          />
        )
      }}
    />
  )
}

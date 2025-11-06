import { Button, Space, Table, Tag, Typography, theme } from 'antd'
import type { TableProps } from 'antd'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DeleteOutlined, EditOutlined, MessageOutlined } from '@ant-design/icons'

import { useSemanticBadges, buildBadgeStyle } from '@renderer/theme/hooks/useSemanticBadges'

import { EmptyState, LoadingSkeleton } from '@renderer/components/DataStates'
import { useDelayedLoading } from '@renderer/hooks/useDelayedLoading'
import type { TaskDetails } from '@renderer/store/slices/tasks'
import { VIEW_COLUMN_VALUES } from '@main/services/view/schemas'

type TaskTableColumn = (typeof VIEW_COLUMN_VALUES)[number]

export interface ProjectTasksTableProps {
  tasks: TaskDetails[]
  loading: boolean
  onSelect: (task: TaskDetails) => void
  onEdit: (task: TaskDetails) => void
  onDeleteRequest: (task: TaskDetails) => void
  canManage: boolean
  canDeleteTask?: (task: TaskDetails) => boolean
  deletingTaskId?: string | null
  pagination?: TablePaginationConfig | false
  columns?: ReadonlyArray<TaskTableColumn>
  statusLabels?: Record<string, string>
  rowSelection?: TableProps<TaskDetails>['rowSelection']
}

export const ProjectTasksTable = ({
  tasks,
  loading,
  onSelect,
  onEdit,
  onDeleteRequest,
  canManage,
  canDeleteTask,
  deletingTaskId,
  pagination,
  columns = VIEW_COLUMN_VALUES,
  statusLabels = {},
  rowSelection
}: ProjectTasksTableProps) => {
  const { t, i18n } = useTranslation('projects')
  const showSkeleton = useDelayedLoading(loading)
  const badgeTokens = useSemanticBadges()
  const { token } = theme.useToken()
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null)

  const columnConfig: Record<TaskTableColumn, ColumnsType<TaskDetails>[number]> = {
    key: {
      title: t('details.tasksColumns.key'),
      dataIndex: 'key',
      key: 'key',
      width: 120,
      render: (value: string) => <Typography.Text strong>{value}</Typography.Text>
    },
    title: {
      title: t('details.tasksColumns.title'),
      dataIndex: 'title',
      key: 'title',
      render: (value: string, record) => (
        <Space direction="vertical" size={token.marginXXS} style={{ maxWidth: 480, width: '100%' }}>
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
    status: {
      title: t('details.tasksColumns.status'),
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (value: TaskDetails['status']) => (
        <Tag
          bordered={false}
          style={buildBadgeStyle(badgeTokens.status[value] ?? badgeTokens.statusFallback)}
        >
          {statusLabels[value] ?? t(`details.status.${value}`)}
        </Tag>
      )
    },
    priority: {
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
    assignee: {
      title: t('details.tasksColumns.assignee'),
      dataIndex: ['assignee', 'displayName'],
      key: 'assignee',
      width: 180,
      render: (_value: string, record) => record.assignee?.displayName ?? t('details.noAssignee')
    },
    dueDate: {
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
    commentCount: {
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
    }
  }

  const resolvedColumns: ColumnsType<TaskDetails> = columns
    .map((column) => columnConfig[column])
    .filter((column): column is ColumnsType<TaskDetails>[number] => Boolean(column))

  const allowActionsColumn = canManage || typeof canDeleteTask === 'function'

  if (allowActionsColumn) {
    resolvedColumns.push({
      title: t('tasks.columns.actions'),
      key: 'actions',
      width: canManage ? 140 : 110,
      render: (_value: unknown, record: TaskDetails) => {
        const allowEdit = canManage
        const allowDelete = canDeleteTask ? canDeleteTask(record) : canManage

        if (!allowEdit && !allowDelete) {
          return null
        }

        return (
          <Space size={4}>
            {allowEdit ? (
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
            ) : null}
            {allowDelete ? (
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                loading={deletingTaskId === record.id}
                onClick={(event) => {
                  event.stopPropagation()
                  onDeleteRequest(record)
                }}
              >
                {t('tasks.actions.delete')}
              </Button>
            ) : null}
          </Space>
        )
      }
    })
  }

  if (showSkeleton) {
    return <LoadingSkeleton layout="stack" items={6} />
  }

  return (
    <Table<TaskDetails>
      rowKey="id"
      columns={resolvedColumns}
      dataSource={tasks}
      rowSelection={rowSelection}
      pagination={pagination}
      size="middle"
      scroll={{ x: 'max-content' }}
      onRow={(record) => ({
        onClick: () => onSelect(record),
        onMouseEnter: () => setHoveredRowId(record.id),
        onMouseLeave: () => setHoveredRowId((current) => (current === record.id ? null : current)),
        style: {
          cursor: 'pointer',
          transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
          background:
            hoveredRowId === record.id ? token.colorFillTertiary : token.colorBgContainer,
          boxShadow: hoveredRowId === record.id ? token.boxShadowTertiary : undefined
        }
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

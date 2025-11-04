import { Button, List, Space, Tag, Typography, theme } from 'antd'
import { DeleteOutlined, EditOutlined, MessageOutlined } from '@ant-design/icons'
import { useMemo, type JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { EmptyState, LoadingSkeleton } from '@renderer/components/DataStates'
import { useDelayedLoading } from '@renderer/hooks/useDelayedLoading'
import type { TaskDetails } from '@renderer/store/slices/tasks'
import { useSemanticBadges, buildBadgeStyle } from '@renderer/theme/hooks/useSemanticBadges'

export interface ProjectTasksListProps {
  tasks: TaskDetails[]
  loading: boolean
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onSelect: (task: TaskDetails) => void
  onEdit: (task: TaskDetails) => void
  onDeleteRequest: (task: TaskDetails) => void
  canManage: boolean
  canDeleteTask?: (task: TaskDetails) => boolean
  deletingTaskId?: string | null
  statusLabels: Record<string, string>
}

export const ProjectTasksList = ({
  tasks,
  loading,
  page,
  pageSize,
  onPageChange,
  onSelect,
  onEdit,
  onDeleteRequest,
  canManage,
  canDeleteTask,
  deletingTaskId,
  statusLabels
}: ProjectTasksListProps): JSX.Element => {
  const { t, i18n } = useTranslation('projects')
  const { token } = theme.useToken()
  const badgeTokens = useSemanticBadges()
  const showSkeleton = useDelayedLoading(loading)

  const pagedTasks = useMemo(() => {
    const start = (page - 1) * pageSize
    return tasks.slice(start, start + pageSize)
  }, [page, pageSize, tasks])

  if (showSkeleton) {
    return <LoadingSkeleton variant="list" />
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        title={t('details.tasksEmpty')}
        description={t('details.tasksSearchPlaceholder')}
      />
    )
  }

  const formatDate = (value: string | null) =>
    value
      ? new Intl.DateTimeFormat(i18n.language, {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }).format(new Date(value))
      : t('details.noDueDate')

  return (
    <List
      dataSource={pagedTasks}
      style={{ width: '100%' }}
      renderItem={(task) => {
        const statusBadge = statusLabels[task.status] ?? t(`details.status.${task.status}`)
        const priorityBadge = badgeTokens.priority[task.priority]
        const statusToken = badgeTokens.status[task.status] ?? badgeTokens.statusFallback
        const assignee = task.assignee?.displayName ?? t('details.noAssignee')

        const allowEdit = canManage
        const allowDelete = canDeleteTask ? canDeleteTask(task) : canManage

        const itemActions: JSX.Element[] = []

        if (allowEdit) {
          itemActions.push(
            <Button
              key="edit"
              type="text"
              icon={<EditOutlined />}
              onClick={(event) => {
                event.stopPropagation()
                onEdit(task)
              }}
            >
              {t('tasks.actions.edit')}
            </Button>
          )
        }

        if (allowDelete) {
          itemActions.push(
            <Button
              key="delete"
              type="text"
              danger
              icon={<DeleteOutlined />}
              loading={deletingTaskId === task.id}
              onClick={(event) => {
                event.stopPropagation()
                onDeleteRequest(task)
              }}
            >
              {t('tasks.actions.delete')}
            </Button>
          )
        }

        return (
          <List.Item
            key={task.id}
            onClick={() => onSelect(task)}
            style={{ cursor: 'pointer', paddingInline: token.paddingLG }}
            actions={itemActions.length > 0 ? itemActions : undefined}
          >
            <List.Item.Meta
              title={
                <Space align="center" size={token.marginSM} wrap>
                  <Typography.Text strong>{task.title}</Typography.Text>
                  <Typography.Text type="secondary">#{task.key}</Typography.Text>
                  <Tag bordered={false} style={buildBadgeStyle(statusToken)}>
                    {statusBadge}
                  </Tag>
                  <Tag bordered={false} style={buildBadgeStyle(priorityBadge)}>
                    {t(`details.priority.${task.priority}`)}
                  </Tag>
                  <Tag
                    bordered={false}
                    icon={<MessageOutlined />}
                    style={buildBadgeStyle(badgeTokens.comment)}
                  >
                    {task.commentCount ?? 0}
                  </Tag>
                </Space>
              }
              description={
                <Space direction="vertical" size={token.marginXS} style={{ width: '100%' }}>
                  {task.description ? (
                    <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                      {task.description}
                    </Typography.Paragraph>
                  ) : null}
                  <Space size={token.marginSM} wrap>
                    <Typography.Text type="secondary">
                      {t('details.assignee')}: {assignee}
                    </Typography.Text>
                    <Typography.Text type="secondary">
                      {t('details.tasksColumns.dueDate')}: {formatDate(task.dueDate)}
                    </Typography.Text>
                  </Space>
                </Space>
              }
            />
          </List.Item>
        )
      }}
      pagination={{
        current: page,
        total: tasks.length,
        pageSize,
        onChange: onPageChange,
        showSizeChanger: false,
        style: { marginTop: token.marginLG, textAlign: 'center' }
      }}
    />
  )
}

ProjectTasksList.displayName = 'ProjectTasksList'

export default ProjectTasksList

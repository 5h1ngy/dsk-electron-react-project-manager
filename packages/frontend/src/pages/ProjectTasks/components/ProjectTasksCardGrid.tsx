import {
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  MessageOutlined,
  UserOutlined
} from '@ant-design/icons'
import { Button, Card, Col, Pagination, Row, Space, Tag, Typography, theme } from 'antd'
import { useMemo, type JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { EmptyState, LoadingSkeleton } from '@renderer/components/DataStates'
import { useDelayedLoading } from '@renderer/hooks/useDelayedLoading'
import type { TaskDetails } from '@renderer/store/slices/tasks'
import { useSemanticBadges, buildBadgeStyle } from '@renderer/theme/hooks/useSemanticBadges'

const CARD_BODY_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  gap: 12,
  height: '100%'
} as const

export interface ProjectTasksCardGridProps {
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
  statusLabels?: Record<string, string>
}

export const ProjectTasksCardGrid = ({
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
  statusLabels = {}
}: ProjectTasksCardGridProps): JSX.Element => {
  const { t, i18n } = useTranslation('projects')
  const showSkeleton = useDelayedLoading(loading)
  const badgeTokens = useSemanticBadges()
  const { token } = theme.useToken()

  const { items, total } = useMemo(() => {
    const totalCount = tasks.length
    const start = (page - 1) * pageSize
    const end = start + pageSize
    return {
      items: tasks.slice(start, end),
      total: totalCount
    }
  }, [page, pageSize, tasks])

  if (showSkeleton) {
    return <LoadingSkeleton layout="grid" />
  }

  if (tasks.length === 0) {
    return <EmptyState title={t('details.tasksEmpty')} />
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        {items.map((task) => (
          <Col key={task.id} xs={24} sm={12} lg={8} xl={6}>
            <Card
              hoverable
              onClick={() => onSelect(task)}
              style={{ height: '100%' }}
              styles={{ body: CARD_BODY_STYLE }}
              title={
                <Space direction="vertical" size={4}>
                  <Typography.Text type="secondary">{task.key}</Typography.Text>
                  <Typography.Title level={5} style={{ margin: 0 }} ellipsis>
                    {task.title}
                  </Typography.Title>
                </Space>
              }
              extra={(() => {
                const allowEdit = canManage
                const allowDelete = canDeleteTask ? canDeleteTask(task) : canManage
                if (!allowEdit && !allowDelete) {
                  return undefined
                }
                return (
                  <Space size={4}>
                    {allowEdit ? (
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={(event) => {
                          event.stopPropagation()
                          onEdit(task)
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
                        loading={deletingTaskId === task.id}
                        onClick={(event) => {
                          event.stopPropagation()
                          onDeleteRequest(task)
                        }}
                      >
                        {t('tasks.actions.delete')}
                      </Button>
                    ) : null}
                  </Space>
                )
              })()}
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Space size={6} wrap>
                  <Tag
                    bordered={false}
                    style={buildBadgeStyle(
                      badgeTokens.status[task.status] ?? badgeTokens.statusFallback
                    )}
                  >
                    {statusLabels[task.status] ?? t(`details.status.${task.status}`)}
                  </Tag>
                  <Tag
                    bordered={false}
                    style={buildBadgeStyle(badgeTokens.priority[task.priority])}
                  >
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
                <Typography.Paragraph
                  type="secondary"
                  ellipsis={{ rows: 3 }}
                  style={{ marginBottom: 0 }}
                >
                  {task.description ?? t('details.summary.noDescription')}
                </Typography.Paragraph>
                <Space size={6} align="center">
                  <UserOutlined style={{ color: token.colorPrimary }} aria-hidden />
                  <Typography.Text type="secondary">
                    {task.assignee?.displayName ?? t('details.noAssignee')}
                  </Typography.Text>
                </Space>
                <Space size={6} align="center">
                  <CalendarOutlined style={{ color: token.colorInfo }} aria-hidden />
                  <Typography.Text type="secondary">
                    {task.dueDate
                      ? new Intl.DateTimeFormat(i18n.language, {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        }).format(new Date(task.dueDate))
                      : t('details.noDueDate')}
                  </Typography.Text>
                </Space>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
      {total > pageSize ? (
        <Pagination
          total={total}
          current={page}
          pageSize={pageSize}
          onChange={onPageChange}
          showSizeChanger={false}
          style={{ alignSelf: 'flex-end' }}
        />
      ) : null}
    </Space>
  )
}

ProjectTasksCardGrid.displayName = 'ProjectTasksCardGrid'

export default ProjectTasksCardGrid

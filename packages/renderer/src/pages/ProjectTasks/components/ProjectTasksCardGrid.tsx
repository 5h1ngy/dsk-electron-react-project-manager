import { Card, Col, Pagination, Row, Space, Tag, Typography } from 'antd'
import { useMemo, type JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { EmptyState, LoadingSkeleton } from '@renderer/components/DataStates'
import { useDelayedLoading } from '@renderer/hooks/useDelayedLoading'
import type { TaskDetails } from '@renderer/store/slices/tasks'

const CARD_BODY_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  gap: 12,
  height: '100%'
} as const

const STATUS_COLORS: Record<TaskDetails['status'], string> = {
  todo: 'default',
  in_progress: 'blue',
  blocked: 'volcano',
  done: 'green'
}

const PRIORITY_COLORS: Record<TaskDetails['priority'], string> = {
  low: 'green',
  medium: 'blue',
  high: 'orange',
  critical: 'red'
}

export interface ProjectTasksCardGridProps {
  tasks: TaskDetails[]
  loading: boolean
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onSelect: (task: TaskDetails) => void
}

export const ProjectTasksCardGrid = ({
  tasks,
  loading,
  page,
  pageSize,
  onPageChange,
  onSelect
}: ProjectTasksCardGridProps): JSX.Element => {
  const { t, i18n } = useTranslation('projects')
  const showSkeleton = useDelayedLoading(loading)

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
    return <LoadingSkeleton variant="cards" />
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
              bodyStyle={CARD_BODY_STYLE}
              title={
                <Space direction="vertical" size={4}>
                  <Typography.Text type="secondary">{task.key}</Typography.Text>
                  <Typography.Title level={5} style={{ margin: 0 }} ellipsis>
                    {task.title}
                  </Typography.Title>
                </Space>
              }
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Space size={6} wrap>
                  <Tag color={STATUS_COLORS[task.status]}>
                    {t(`details.status.${task.status}`)}
                  </Tag>
                  <Tag color={PRIORITY_COLORS[task.priority]}>
                    {t(`details.priority.${task.priority}`)}
                  </Tag>
                </Space>
                <Typography.Paragraph
                  type="secondary"
                  ellipsis={{ rows: 3 }}
                  style={{ marginBottom: 0 }}
                >
                  {task.description ?? t('details.summary.noDescription')}
                </Typography.Paragraph>
                <Typography.Text type="secondary">
                  {task.assignee?.displayName ?? t('details.noAssignee')}
                </Typography.Text>
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
          style={{ alignSelf: 'center' }}
        />
      ) : null}
    </Space>
  )
}

ProjectTasksCardGrid.displayName = 'ProjectTasksCardGrid'

export default ProjectTasksCardGrid


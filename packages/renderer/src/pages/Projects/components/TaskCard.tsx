import { Button, Card, Popconfirm, Space, Tag, Tooltip, Typography } from 'antd'
import type { DragEvent, JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { DeleteOutlined, EditOutlined, MessageOutlined } from '@ant-design/icons'

import type { TaskDetails } from '@renderer/store/slices/tasks'
import { useSemanticBadges, buildBadgeStyle } from '@renderer/theme/hooks/useSemanticBadges'

export interface TaskCardProps {
  task: TaskDetails
  onSelect: () => void
  onDragStart: (taskId: string, event: DragEvent<HTMLDivElement>) => void
  onEdit: () => void
  onDelete: () => Promise<void> | void
  deleting?: boolean
  draggable?: boolean
}

export const TaskCard = ({
  task,
  onSelect,
  onDragStart,
  onEdit,
  onDelete,
  deleting = false,
  draggable = true
}: TaskCardProps): JSX.Element => {
  const { t, i18n } = useTranslation('projects')
  const badgeTokens = useSemanticBadges()

  const handleDragStart = (event: DragEvent<HTMLDivElement>) => {
    if (!draggable) {
      event.preventDefault()
      return
    }
    onDragStart(task.id, event)
  }

  return (
    <Card
      size="small"
      style={{ cursor: draggable ? 'grab' : 'default', opacity: draggable ? 1 : 0.7 }}
      hoverable
      draggable={draggable}
      onDragStart={handleDragStart}
      onClick={onSelect}
      extra={
        draggable ? (
          <Space size={4}>
            <Tooltip title={t('tasks.actions.edit')}>
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={(event) => {
                  event.stopPropagation()
                  onEdit()
                }}
              />
            </Tooltip>
            <Popconfirm
              title={t('tasks.actions.deleteTitle')}
              description={t('tasks.actions.deleteDescription', { title: task.title })}
              okText={t('tasks.actions.deleteConfirm')}
              cancelText={t('tasks.actions.cancel')}
              onConfirm={async () => onDelete()}
              okButtonProps={{ loading: deleting }}
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                loading={deleting}
                onClick={(event) => event.stopPropagation()}
              />
            </Popconfirm>
          </Space>
        ) : undefined
      }
    >
      <Space direction="vertical" size={4} style={{ width: '100%' }}>
        <Space align="baseline" style={{ justifyContent: 'space-between', width: '100%' }}>
          <Typography.Text strong>{task.title}</Typography.Text>
          <Space size={4}>
            <Tag bordered={false} style={buildBadgeStyle(badgeTokens.priority[task.priority])}>
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
        </Space>
        {task.assignee?.displayName ? (
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {t('details.drawer.assignee', { assignee: task.assignee.displayName })}
          </Typography.Text>
        ) : null}
        {task.dueDate ? (
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {t('details.drawer.dueDate', {
              date: new Intl.DateTimeFormat(i18n.language).format(new Date(task.dueDate))
            })}
          </Typography.Text>
        ) : null}
      </Space>
    </Card>
  )
}

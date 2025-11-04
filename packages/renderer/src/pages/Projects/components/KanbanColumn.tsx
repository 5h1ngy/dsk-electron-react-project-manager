import { Card, Space, Tag, Typography, theme } from 'antd'
import { useTranslation } from 'react-i18next'
import { useState, type DragEvent, type JSX } from 'react'

import type { TaskDetails, TaskStatus } from '@renderer/store/slices/tasks'
import { TaskCard } from '@renderer/pages/Projects/components/TaskCard'

export interface KanbanColumnProps {
  status: TaskStatus
  label: string
  tasks: TaskDetails[]
  onTaskDrop: (taskId: string, status: TaskStatus) => void
  onTaskSelect: (task: TaskDetails) => void
  onTaskEdit: (task: TaskDetails) => void
  onTaskDelete: (task: TaskDetails) => void
  deletingTaskId?: string | null
  canManage: boolean
  canDeleteTask: (task: TaskDetails) => boolean
  renderComposer?: () => JSX.Element | null
}

export const KanbanColumn = ({
  status,
  label,
  tasks,
  onTaskDrop,
  onTaskSelect,
  onTaskEdit,
  onTaskDelete,
  deletingTaskId,
  canManage,
  canDeleteTask,
  renderComposer
}: KanbanColumnProps): JSX.Element => {
  const { t } = useTranslation('projects')
  const { token } = theme.useToken()
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!canManage) {
      return
    }
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    if (!canManage) {
      return
    }
    event.preventDefault()
    const taskId = event.dataTransfer.getData('text/task-id')
    if (taskId) {
      onTaskDrop(taskId, status)
    }
    setIsDragOver(false)
  }

  const handleDragStart = (taskId: string, event: DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('text/task-id', taskId)
    event.dataTransfer.effectAllowed = 'move'
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const taskCountLabel = t('board.taskCount', { count: tasks.length })

  return (
    <Card
      title={
        <Space size={8} align="center">
          <Typography.Text strong>{label}</Typography.Text>
          <Tag color={token.colorPrimary}>{taskCountLabel}</Tag>
        </Space>
      }
      size="small"
      style={{
        minHeight: 360,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderColor: isDragOver ? token.colorPrimary : token.colorBorderSecondary,
        background: isDragOver ? token.colorPrimaryBg : token.colorBgContainer,
        transition: 'border-color 0.2s ease, background 0.2s ease'
      }}
      styles={{
        body: {
          padding: 12,
          background: isDragOver
            ? token.colorPrimaryBgHover ?? token.colorPrimaryBg
            : token.colorBgContainer,
          borderRadius: token.borderRadiusLG,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          flex: 1,
          overflow: 'hidden'
        }
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
    >
      <Space
        direction="vertical"
        size={12}
        style={{
          width: '100%',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch'
        }}
      >
        {renderComposer ? renderComposer() : null}
        {tasks.length === 0 ? (
          <Typography.Text type="secondary" style={{ textAlign: 'center', padding: '12px 0' }}>
            {t('board.emptyColumn')}
          </Typography.Text>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onSelect={() => onTaskSelect(task)}
              onEdit={() => onTaskEdit(task)}
              onDeleteRequest={() => onTaskDelete(task)}
              deleting={deletingTaskId === task.id}
              onDragStart={handleDragStart}
              draggable={canManage}
              canEdit={canManage}
              canDelete={canDeleteTask(task)}
            />
          ))
        )}
      </Space>
    </Card>
  )
}

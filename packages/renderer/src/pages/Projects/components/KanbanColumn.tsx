import { Card, Space, Typography } from 'antd'
import type { DragEvent, JSX } from 'react'

import type { TaskDetails, TaskStatus } from '@renderer/store/slices/tasks'
import { TaskCard } from '@renderer/pages/Projects/components/TaskCard'

export interface KanbanColumnProps {
  status: TaskStatus
  label: string
  tasks: TaskDetails[]
  onTaskDrop: (taskId: string, status: TaskStatus) => void
  onTaskSelect: (task: TaskDetails) => void
  onTaskEdit: (task: TaskDetails) => void
  onTaskDelete: (task: TaskDetails) => Promise<void> | void
  deletingTaskId?: string | null
  canManage: boolean
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
  renderComposer
}: KanbanColumnProps): JSX.Element => {
  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!canManage) {
      return
    }
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
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
  }

  const handleDragStart = (taskId: string, event: DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('text/task-id', taskId)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <Card
      title={<Typography.Text strong>{label}</Typography.Text>}
      size="small"
      style={{ minHeight: 360 }}
      styles={{ body: { padding: 12 } }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        {renderComposer ? renderComposer() : null}
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onSelect={() => onTaskSelect(task)}
            onEdit={() => onTaskEdit(task)}
            onDelete={() => onTaskDelete(task)}
            deleting={deletingTaskId === task.id}
            onDragStart={handleDragStart}
            draggable={canManage}
          />
        ))}
      </Space>
    </Card>
  )
}

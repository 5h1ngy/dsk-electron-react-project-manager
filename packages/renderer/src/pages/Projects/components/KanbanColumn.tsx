import { Card, Space, Typography } from 'antd'
import type { DragEvent } from 'react'

import type { TaskDetails, TaskStatus } from '@renderer/store/slices/tasks'
import { TaskCard } from './TaskCard'

export interface KanbanColumnProps {
  status: TaskStatus
  label: string
  tasks: TaskDetails[]
  onTaskDrop: (taskId: string, status: TaskStatus) => void
  onTaskSelect: (task: TaskDetails) => void
  canManage: boolean
  renderComposer?: () => JSX.Element | null
}

export const KanbanColumn = ({
  status,
  label,
  tasks,
  onTaskDrop,
  onTaskSelect,
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
      bodyStyle={{ padding: 12 }}
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
            onDragStart={handleDragStart}
            draggable={canManage}
          />
        ))}
      </Space>
    </Card>
  )
}

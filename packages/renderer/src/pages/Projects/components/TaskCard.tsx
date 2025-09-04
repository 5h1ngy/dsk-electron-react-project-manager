import { Card, Space, Tag, Typography } from 'antd'
import type { DragEvent } from 'react'

import type { TaskDetails } from '@renderer/store/slices/tasks'

export interface TaskCardProps {
  task: TaskDetails
  onSelect: (taskId: string) => void
  onDragStart: (taskId: string, event: DragEvent<HTMLDivElement>) => void
  draggable?: boolean
}

const priorityColors: Record<string, string> = {
  low: 'green',
  medium: 'blue',
  high: 'orange',
  critical: 'red'
}

export const TaskCard = ({
  task,
  onSelect,
  onDragStart,
  draggable = true
}: TaskCardProps): JSX.Element => {
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
      onClick={() => onSelect(task.id)}
    >
      <Space direction="vertical" size={4} style={{ width: '100%' }}>
        <Space align="baseline" style={{ justifyContent: 'space-between', width: '100%' }}>
          <Typography.Text strong>{task.title}</Typography.Text>
          <Tag color={priorityColors[task.priority] ?? 'blue'}>{task.priority}</Tag>
        </Space>
        {task.assignee?.displayName ? (
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Assegnato a {task.assignee.displayName}
          </Typography.Text>
        ) : null}
        {task.dueDate ? (
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Scadenza: {new Intl.DateTimeFormat('it-IT').format(new Date(task.dueDate))}
          </Typography.Text>
        ) : null}
      </Space>
    </Card>
  )
}



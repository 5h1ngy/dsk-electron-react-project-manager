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
  const highlightBorder = `${token.lineWidth}px dashed ${token.colorPrimary}`
  const idleBorder = `${token.lineWidth}px solid ${token.colorBorder}`
  const baseBackground = token.colorBgElevated

  return (
    <Card
      variant="borderless"
      style={{
        minHeight: 420,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: token.borderRadiusLG,
        border: isDragOver ? highlightBorder : idleBorder,
        background: isDragOver ? token.colorPrimaryBg : baseBackground,
        transition: 'border 0.2s ease, background 0.2s ease',
        boxShadow: token.boxShadowTertiary
      }}
      styles={{
        body: {
          padding: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
    >
      <Space
        size={8}
        align="center"
        style={{
          padding: token.paddingMD,
          paddingBottom: token.paddingSM,
          justifyContent: 'space-between'
        }}
      >
        <Typography.Text strong style={{ fontSize: 16 }}>
          {label}
        </Typography.Text>
        <Tag
          bordered={false}
          style={{
            background: token.colorFillSecondary,
            color: token.colorText,
            fontWeight: 600
          }}
        >
          {taskCountLabel}
        </Tag>
      </Space>
      <Space
        direction="vertical"
        size={12}
        style={{
          width: '100%',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          padding: token.paddingMD,
          paddingTop: 0,
          gap: token.marginSM,
          overflowY: 'auto'
        }}
      >
        {renderComposer ? renderComposer() : null}
        {tasks.length === 0 ? (
          <Typography.Text
            type="secondary"
            style={{
              textAlign: 'center',
              padding: token.paddingSM,
              borderRadius: token.borderRadius,
              background: token.colorFillSecondary,
              color: token.colorTextSecondary
            }}
          >
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

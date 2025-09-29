import { Alert, Col, Row, Space, theme } from 'antd'
import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { EmptyState, LoadingSkeleton } from '@renderer/components/DataStates'
import { useDelayedLoading } from '@renderer/hooks/useDelayedLoading'
import { KanbanColumn } from '@renderer/pages/Projects/components/KanbanColumn'
import { useProjectBoard } from '@renderer/pages/Projects/hooks/useProjectBoard'
import type { TaskDetails } from '@renderer/store/slices/tasks'
import type { TaskStatusItem } from '@renderer/store/slices/taskStatuses'

export interface ProjectBoardProps {
  projectId: string | null
  tasks: TaskDetails[]
  statuses: TaskStatusItem[]
  isLoading: boolean
  canManageTasks: boolean
  onTaskSelect: (task: TaskDetails) => void
  onTaskEdit: (task: TaskDetails) => void
  onTaskDelete: (task: TaskDetails) => Promise<void> | void
  deletingTaskId?: string | null
}

export const ProjectBoard = ({
  projectId,
  tasks,
  statuses,
  isLoading,
  canManageTasks,
  onTaskSelect,
  onTaskEdit,
  onTaskDelete,
  deletingTaskId
}: ProjectBoardProps): JSX.Element => {
  const { t } = useTranslation('projects')
  const { token } = theme.useToken()
  const { messageContext, columns, handleMoveTask } = useProjectBoard(
    projectId,
    tasks,
    statuses,
    canManageTasks
  )
  const showSkeleton = useDelayedLoading(isLoading)
  const hasTasks = columns.some((column) => column.tasks.length > 0)

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      {messageContext}
      {!canManageTasks ? (
        <Alert
          type="info"
          showIcon
          message={t('board.permissions.title')}
          description={t('board.permissions.description')}
        />
      ) : null}
      {showSkeleton ? (
        <LoadingSkeleton variant="cards" items={Math.max(columns.length, 4)} />
      ) : hasTasks ? (
        <div style={{ width: '100%', overflowX: 'auto', paddingBottom: token.paddingSM }}>
          <Row gutter={16} wrap={false} style={{ flexWrap: 'nowrap' }}>
            {columns.map((column) => (
              <Col key={column.status} flex="0 0 320px" style={{ maxWidth: 320 }}>
                <KanbanColumn
                  status={column.status}
                  label={column.label}
                  tasks={column.tasks}
                  onTaskDrop={handleMoveTask}
                  onTaskSelect={onTaskSelect}
                  onTaskEdit={onTaskEdit}
                  onTaskDelete={onTaskDelete}
                  deletingTaskId={deletingTaskId}
                  canManage={canManageTasks}
                />
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <Space
          align="center"
          style={{ width: '100%', justifyContent: 'center', padding: '48px 0' }}
        >
          <EmptyState title={t('details.tasksEmpty')} />
        </Space>
      )}
    </Space>
  )
}

ProjectBoard.displayName = 'ProjectBoard'

export default ProjectBoard





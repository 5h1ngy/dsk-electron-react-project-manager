import { Alert, Col, Row } from 'antd'
import { useTranslation } from 'react-i18next'

import { EmptyState, LoadingSkeleton } from '@renderer/components/DataStates'
import { useDelayedLoading } from '@renderer/hooks/useDelayedLoading'
import type { ProjectDetails } from '@renderer/store/slices/projects'
import type { TaskDetails } from '@renderer/store/slices/tasks'
import { KanbanColumn } from '@renderer/pages/Projects/components/KanbanColumn'
import { TaskComposer } from '@renderer/pages/Projects/components/TaskComposer'
import { useProjectBoard } from '@renderer/pages/Projects/hooks/useProjectBoard'

export interface ProjectBoardProps {
  project: ProjectDetails | null
  canManageTasks: boolean
  onTaskSelect: (task: TaskDetails) => void
}

export const ProjectBoard = ({ project, canManageTasks, onTaskSelect }: ProjectBoardProps): JSX.Element => {
  const { t } = useTranslation('projects')
  const { messageContext, columns, boardStatus, createTaskForm, handleCreateTask, handleMoveTask } =
    useProjectBoard(project, canManageTasks)

  if (!project) {
    return (
      <div style={{ marginTop: 32 }}>
        <EmptyState title={t('board.empty')} />
      </div>
    )
  }

  const isLoading = boardStatus === 'loading'
  const showSkeleton = useDelayedLoading(isLoading)

  return (
    <>
      {messageContext}
      {!canManageTasks ? (
        <Alert
          type="info"
          showIcon
          message={t('board.permissions.title')}
          description={t('board.permissions.description')}
          style={{ marginBottom: 16 }}
        />
      ) : null}
      {showSkeleton ? (
        <LoadingSkeleton variant="cards" items={4} />
      ) : (
        <Row gutter={16}>
          {columns.map((column) => (
            <Col span={6} key={column.status}>
              <KanbanColumn
                status={column.status}
                label={column.label}
                tasks={column.tasks}
                onTaskDrop={handleMoveTask}
                onTaskSelect={onTaskSelect}
                canManage={canManageTasks}
                renderComposer={
                  canManageTasks && column.status === 'todo'
                    ? () => (
                        <TaskComposer
                          form={createTaskForm}
                          onSubmit={handleCreateTask}
                          disabled={!canManageTasks || isLoading}
                        />
                      )
                    : undefined
                }
              />
            </Col>
          ))}
        </Row>
      )}
    </>
  )
}

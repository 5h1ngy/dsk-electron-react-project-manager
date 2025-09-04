import { Alert, Col, Empty, Row, Spin } from 'antd'
import { useTranslation } from 'react-i18next'

import type { ProjectDetails } from '@renderer/store/slices/projects'
import type { TaskDetails } from '@renderer/store/slices/tasks'
import { KanbanColumn } from './KanbanColumn'
import { TaskComposer } from './TaskComposer'
import { useProjectBoard } from '../hooks/useProjectBoard'

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
    return <Empty description={t('board.empty')} style={{ marginTop: 32 }} />
  }

  const isLoading = boardStatus === 'loading'

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
      <Spin spinning={isLoading}>
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
      </Spin>
    </>
  )
}

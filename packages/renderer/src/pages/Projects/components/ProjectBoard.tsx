import { Alert, Col, Empty, Row, Spin } from 'antd'

import type { ProjectDetails } from '@renderer/store/slices/projects'
import { KanbanColumn } from './KanbanColumn'
import { TaskComposer } from './TaskComposer'
import { TaskDetailDrawer } from './TaskDetailDrawer'
import { useProjectBoard } from '../hooks/useProjectBoard'

export interface ProjectBoardProps {
  project: ProjectDetails | null
  canManageTasks: boolean
}

export const ProjectBoard = ({ project, canManageTasks }: ProjectBoardProps): JSX.Element => {
  const {
    messageContext,
    columns,
    boardStatus,
    createTaskForm,
    handleCreateTask,
    handleMoveTask,
    selectTask,
    selectedTask
  } = useProjectBoard(project, canManageTasks)

  if (!project) {
    return (
      <Empty description="Seleziona un progetto per visualizzare la board" style={{ marginTop: 32 }} />
    )
  }

  const isLoading = boardStatus === 'loading'

  return (
    <>
      {messageContext}
      {!canManageTasks ? (
        <Alert
          type="info"
          showIcon
          message="Permessi limitati"
          description="Non hai i permessi necessari per creare o modificare i task di questo progetto."
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
                onTaskSelect={selectTask}
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
      <TaskDetailDrawer task={selectedTask} open={Boolean(selectedTask)} onClose={() => selectTask(null)} />
    </>
  )
}


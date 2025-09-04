import { tasksReducer } from './slice'
import { addComment, fetchTasks, moveTask } from './thunks'
import type { TaskDetails } from './types'

describe('tasks slice', () => {
  const now = new Date()

  const baseTask: TaskDetails = {
    id: 'task-1',
    projectId: 'proj-1',
    projectKey: 'PR1',
    key: 'PR1-1',
    parentId: null,
    title: 'Preparare ambiente',
    description: null,
    status: 'todo',
    priority: 'medium',
    dueDate: null,
    assignee: null,
    owner: {
      id: 'admin',
      username: 'admin',
      displayName: 'Administrator'
    },
    ownerUserId: 'admin',
    createdAt: now,
    updatedAt: now
  }

  it('handles fetchTasks.fulfilled', () => {
    const state = tasksReducer(
      undefined,
      fetchTasks.fulfilled(
        { projectId: 'proj-1', tasks: [baseTask] },
        'request-id',
        'proj-1'
      )
    )

    const projectState = state.byProjectId['proj-1']
    expect(projectState).toBeDefined()
    expect(projectState?.entities[baseTask.id]).toMatchObject({
      title: baseTask.title,
      status: 'todo'
    })
  })

  it('handles moveTask.fulfilled', () => {
    const stateWithTask = tasksReducer(
      undefined,
      fetchTasks.fulfilled(
        { projectId: 'proj-1', tasks: [baseTask] },
        'request-id',
        'proj-1'
      )
    )

    const updatedTask: TaskDetails = {
      ...baseTask,
      status: 'done',
      updatedAt: new Date()
    }

    const stateAfterMove = tasksReducer(
      stateWithTask,
      moveTask.fulfilled(updatedTask, 'request-id', {
        taskId: updatedTask.id,
        input: { status: 'done' }
      })
    )

    expect(stateAfterMove.byProjectId['proj-1'].entities[updatedTask.id]?.status).toBe('done')
  })

  it('handles addComment.fulfilled', () => {
    const stateWithTask = tasksReducer(
      undefined,
      fetchTasks.fulfilled(
        { projectId: 'proj-1', tasks: [baseTask] },
        'request-id',
        'proj-1'
      )
    )

    const stateAfterComment = tasksReducer(
      stateWithTask,
      addComment.fulfilled(
        {
          taskId: baseTask.id,
          comment: {
            id: 'comm-1',
            taskId: baseTask.id,
            author: {
              id: 'admin',
              username: 'admin',
              displayName: 'Administrator'
            },
            body: 'Nota di test',
            createdAt: now,
            updatedAt: now
          }
        },
        'request-id',
        { taskId: baseTask.id, body: 'Nota di test' }
      )
    )

    expect(stateAfterComment.commentsByTaskId[baseTask.id]?.items).toHaveLength(1)
  })
})

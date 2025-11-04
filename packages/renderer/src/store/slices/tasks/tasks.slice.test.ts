import { tasksReducer, resetTaskSearch } from '@renderer/store/slices/tasks/slice'
import { addComment, fetchTasks, moveTask, searchTasks } from '@renderer/store/slices/tasks/thunks'
import type { TaskDetails } from '@renderer/store/slices/tasks/types'

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
    createdAt: now,
    updatedAt: now,
    linkedNotes: [],
    commentCount: 0,
    sprintId: null,
    sprint: null,
    estimatedMinutes: null,
    timeSpentMinutes: 0
  }

  it('handles fetchTasks.fulfilled', () => {
    const state = tasksReducer(
      undefined,
      fetchTasks.fulfilled({ projectId: 'proj-1', tasks: [baseTask] }, 'request-id', 'proj-1')
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
      fetchTasks.fulfilled({ projectId: 'proj-1', tasks: [baseTask] }, 'request-id', 'proj-1')
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
      fetchTasks.fulfilled({ projectId: 'proj-1', tasks: [baseTask] }, 'request-id', 'proj-1')
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
    expect(stateAfterComment.byProjectId['proj-1'].entities[baseTask.id]?.commentCount).toBe(1)
  })

  it('handles searchTasks.fulfilled', () => {
    const fulfilled = searchTasks.fulfilled({ query: 'auth', results: [baseTask] }, 'request-id', {
      query: 'auth'
    })
    const stateAfterSearch = tasksReducer(undefined, fulfilled)

    expect(stateAfterSearch.search.status).toBe('succeeded')
    expect(stateAfterSearch.search.results).toHaveLength(1)
    expect(stateAfterSearch.search.query).toBe('auth')
  })

  it('resets search state', () => {
    const fulfilled = searchTasks.fulfilled({ query: 'auth', results: [baseTask] }, 'request-id', {
      query: 'auth'
    })
    const stateAfterSearch = tasksReducer(undefined, fulfilled)
    const resetState = tasksReducer(stateAfterSearch, resetTaskSearch())

    expect(resetState.search.query).toBe('')
    expect(resetState.search.results).toHaveLength(0)
    expect(resetState.search.status).toBe('idle')
  })
})

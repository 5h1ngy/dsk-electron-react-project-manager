const handlers = new Map<string, (...args: any[]) => Promise<unknown>>()

jest.mock('electron', () => ({
  ipcMain: {
    handle: (channel: string, handler: (...args: any[]) => Promise<unknown>) => {
      handlers.set(channel, handler)
    },
    listenerCount: () => 0,
    removeHandler: () => {}
  }
}))

const resolveActorMock = jest.fn()
const listTasksMock = jest.fn()
const getTaskMock = jest.fn()
const createTaskMock = jest.fn()
const updateTaskMock = jest.fn()
const moveTaskMock = jest.fn()
const deleteTaskMock = jest.fn()
const listCommentsMock = jest.fn()
const addCommentMock = jest.fn()
const searchMock = jest.fn()

jest.mock('../appContext', () => ({
  appContext: {
    authService: {
      resolveActor: resolveActorMock
    },
    taskService: {
      listByProject: listTasksMock,
      getTask: getTaskMock,
      createTask: createTaskMock,
      updateTask: updateTaskMock,
      moveTask: moveTaskMock,
      deleteTask: deleteTaskMock,
      listComments: listCommentsMock,
      addComment: addCommentMock,
      search: searchMock
    }
  }
}))

import { registerTaskIpc } from './task'

const actor = { userId: 'user-1', roles: ['Admin'] as const }

describe('task ipc handlers', () => {
  beforeEach(() => {
    handlers.clear()
    resolveActorMock.mockReset()
    resolveActorMock.mockResolvedValue(actor)
    listTasksMock.mockReset()
    getTaskMock.mockReset()
    createTaskMock.mockReset()
    updateTaskMock.mockReset()
    moveTaskMock.mockReset()
    deleteTaskMock.mockReset()
    listCommentsMock.mockReset()
    addCommentMock.mockReset()
    searchMock.mockReset()
  })

  it('registers task channels and returns success payloads', async () => {
    listTasksMock.mockResolvedValue([])
    getTaskMock.mockResolvedValue({ id: 'task-1' })
    createTaskMock.mockResolvedValue({ id: 'task-1' })
    updateTaskMock.mockResolvedValue({ id: 'task-1' })
    moveTaskMock.mockResolvedValue({ id: 'task-1' })
    deleteTaskMock.mockResolvedValue(undefined)
    listCommentsMock.mockResolvedValue([])
    addCommentMock.mockResolvedValue({ id: 'comment-1' })
    searchMock.mockResolvedValue([])

    registerTaskIpc()

    const listResponse = await handlers.get('task:list')!(undefined, 'token', 'proj')
    expect(listResponse).toEqual({ ok: true, data: [] })

    const moveResponse = await handlers
      .get('task:move')!(undefined, 'token', 'task-1', { status: 'done' })
    expect(moveResponse).toEqual({ ok: true, data: { id: 'task-1' } })

    await handlers.get('task:delete')!(undefined, 'token', 'task-1')
    expect(deleteTaskMock).toHaveBeenCalledWith(actor, 'task-1')
  })

  it('wraps errors', async () => {
    listTasksMock.mockRejectedValue(new Error('oops'))
    registerTaskIpc()

    const response = await handlers.get('task:list')!(undefined, 'token', 'proj')
    expect(response).toEqual({ ok: false, code: 'ERR_INTERNAL', message: 'oops' })
  })
})

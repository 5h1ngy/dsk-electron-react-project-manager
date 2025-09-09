import type { AuthService } from '../services/auth/authService'
import type { TaskService } from '../services/taskService'
import { TaskIpcRegistrar } from './task'
import { IpcChannelRegistrar } from './utils'

const createRegistry = () => {
  const handlers = new Map<string, (...args: any[]) => Promise<unknown>>()
  const ipcMock = {
    handle: jest.fn((channel: string, handler: (...args: any[]) => Promise<unknown>) => {
      handlers.set(channel, handler)
    }),
    listenerCount: jest.fn(() => 0),
    removeHandler: jest.fn()
  }
  const loggerMock = { warn: jest.fn(), error: jest.fn() }
  const registrar = new IpcChannelRegistrar({ ipc: ipcMock as any, logger: loggerMock })
  return { handlers, registrar }
}

describe('TaskIpcRegistrar', () => {
  const actor = { userId: 'user-1' } as const
  let authService: jest.Mocked<AuthService>
  let taskService: jest.Mocked<TaskService>
  let handlers: Map<string, (...args: any[]) => Promise<unknown>>
  let registrar: IpcChannelRegistrar

  beforeEach(() => {
    authService = {
      resolveActor: jest.fn().mockResolvedValue(actor)
    } as unknown as jest.Mocked<AuthService>

    taskService = {
      listByProject: jest.fn(),
      getTask: jest.fn(),
      createTask: jest.fn(),
      updateTask: jest.fn(),
      moveTask: jest.fn(),
      deleteTask: jest.fn(),
      listComments: jest.fn(),
      addComment: jest.fn(),
      search: jest.fn()
    } as unknown as jest.Mocked<TaskService>

    const registry = createRegistry()
    handlers = registry.handlers
    registrar = registry.registrar
  })

  it('delegates to the task service for each channel', async () => {
    taskService.listByProject.mockResolvedValue([])
    taskService.getTask.mockResolvedValue({ id: 't1' })
    taskService.createTask.mockResolvedValue({ id: 't1' })
    taskService.updateTask.mockResolvedValue({ id: 't1' })
    taskService.moveTask.mockResolvedValue({ id: 't1' })
    taskService.deleteTask.mockResolvedValue(undefined)
    taskService.listComments.mockResolvedValue([])
    taskService.addComment.mockResolvedValue({ id: 'c1' })
    taskService.search.mockResolvedValue([])

    new TaskIpcRegistrar({ authService, taskService, registrar }).register()

    await handlers.get('task:list')!({}, 'token', 'project-1')
    await handlers.get('task:get')!({}, 'token', 'task-1')
    await handlers.get('task:delete')!({}, 'token', 'task-1')

    expect(taskService.deleteTask).toHaveBeenCalledWith(actor, 'task-1')
    const commentResponse = await handlers.get('task:comment:add')!({}, 'token', { body: 'Hi' })
    expect(commentResponse).toEqual({ ok: true, data: { id: 'c1' } })
  })

  it('wraps unexpected errors into ipc responses', async () => {
    taskService.listByProject.mockRejectedValue(new Error('boom'))

    new TaskIpcRegistrar({ authService, taskService, registrar }).register()

    const result = await handlers.get('task:list')!({}, 'token', 'project-1')
    expect(result).toEqual({ ok: false, code: 'ERR_INTERNAL', message: 'boom' })
  })
})

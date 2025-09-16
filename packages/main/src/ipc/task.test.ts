import type { AuthService } from '@main/services/auth'
import type { TaskService } from '@main/services/task'
import type { CommentDTO, TaskDetailsDTO } from '@main/services/task/types'
import { TaskIpcRegistrar } from '@main/ipc/task'
import { IpcChannelRegistrar } from '@main/ipc/utils'

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

const createTaskDetails = (overrides: Partial<TaskDetailsDTO> = {}): TaskDetailsDTO => {
  const base: TaskDetailsDTO = {
    id: overrides.id ?? 'task-1',
    projectId: overrides.projectId ?? 'project-1',
    projectKey: overrides.projectKey ?? 'PRJ',
    key: overrides.key ?? 'PRJ-001',
    parentId: overrides.parentId ?? null,
    title: overrides.title ?? 'Refine authentication flow',
    description: overrides.description ?? 'Rework auth flow to improve UX.',
    status: overrides.status ?? 'in_progress',
    priority: overrides.priority ?? 'high',
    dueDate: overrides.dueDate ?? '2024-06-01',
    assignee: overrides.assignee ?? {
      id: 'user-2',
      username: 'john.doe',
      displayName: 'John Doe'
    },
    owner: overrides.owner ?? {
      id: 'user-1',
      username: 'jane.doe',
      displayName: 'Jane Doe'
    },
    createdAt: overrides.createdAt ?? new Date('2024-02-01T10:00:00.000Z'),
    updatedAt: overrides.updatedAt ?? new Date('2024-02-05T11:00:00.000Z')
  }
  return base
}

const createCommentDto = (overrides: Partial<CommentDTO> = {}): CommentDTO => ({
  id: overrides.id ?? 'comment-1',
  taskId: overrides.taskId ?? 'task-1',
  author:
    overrides.author ?? {
      id: 'user-3',
      username: 'alex.roe',
      displayName: 'Alex Roe'
    },
  body: overrides.body ?? 'Progress update shared with the stakeholders.',
  createdAt: overrides.createdAt ?? new Date('2024-02-03T12:30:00.000Z'),
  updatedAt: overrides.updatedAt ?? new Date('2024-02-03T12:30:00.000Z')
})

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
    const taskDetails = createTaskDetails({ id: 't1' })
    const comment = createCommentDto({ id: 'c1', taskId: taskDetails.id })
    taskService.listByProject.mockResolvedValue([taskDetails])
    taskService.getTask.mockResolvedValue(taskDetails)
    taskService.createTask.mockResolvedValue(taskDetails)
    taskService.updateTask.mockResolvedValue(taskDetails)
    taskService.moveTask.mockResolvedValue(taskDetails)
    taskService.deleteTask.mockResolvedValue(undefined)
    taskService.listComments.mockResolvedValue([])
    taskService.addComment.mockResolvedValue(comment)
    taskService.search.mockResolvedValue([])

    new TaskIpcRegistrar({ authService, taskService, registrar }).register()

    await handlers.get('task:list')!({}, 'token', 'project-1')
    await handlers.get('task:get')!({}, 'token', 'task-1')
    await handlers.get('task:delete')!({}, 'token', 'task-1')

    expect(taskService.deleteTask).toHaveBeenCalledWith(actor, 'task-1')
    const commentResponse = await handlers.get('task:comment:add')!({}, 'token', { body: 'Hi' })
    expect(commentResponse).toEqual({ ok: true, data: comment })
  })

  it('wraps unexpected errors into ipc responses', async () => {
    taskService.listByProject.mockRejectedValue(new Error('boom'))

    new TaskIpcRegistrar({ authService, taskService, registrar }).register()

    const result = await handlers.get('task:list')!({}, 'token', 'project-1')
    expect(result).toEqual({ ok: false, code: 'ERR_INTERNAL', message: 'boom' })
  })
})

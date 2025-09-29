/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AuthService } from '@main/services/auth'
import type { TaskStatusService } from '@main/services/taskStatus'
import type { TaskStatusDTO } from '@main/services/taskStatus/types'
import { TaskStatusIpcRegistrar } from '@main/ipc/taskStatus'
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

const baseStatus = (): TaskStatusDTO => ({
  id: 'status-1',
  projectId: 'project-1',
  key: 'todo',
  label: 'To Do',
  position: 1
})

describe('TaskStatusIpcRegistrar', () => {
  const actor = { userId: 'user-1' } as const
  let authService: jest.Mocked<AuthService>
  let taskStatusService: jest.Mocked<TaskStatusService>
  let handlers: Map<string, (...args: any[]) => Promise<unknown>>
  let registrar: IpcChannelRegistrar

  beforeEach(() => {
    authService = {
      resolveActor: jest.fn().mockResolvedValue(actor)
    } as unknown as jest.Mocked<AuthService>

    taskStatusService = {
      listStatuses: jest.fn(),
      createStatus: jest.fn(),
      updateStatus: jest.fn(),
      reorderStatuses: jest.fn(),
      deleteStatus: jest.fn()
    } as unknown as jest.Mocked<TaskStatusService>

    const registry = createRegistry()
    handlers = registry.handlers
    registrar = registry.registrar
  })

  it('registra e delega le chiamate al TaskStatusService', async () => {
    const status = baseStatus()
    taskStatusService.listStatuses.mockResolvedValue([status])
    taskStatusService.createStatus.mockResolvedValue(status)
    taskStatusService.updateStatus.mockResolvedValue({ ...status, label: 'Updated' })
    taskStatusService.reorderStatuses.mockResolvedValue([status])
    taskStatusService.deleteStatus.mockResolvedValue({ success: true })

    new TaskStatusIpcRegistrar({
      authService,
      taskStatusService,
      registrar
    }).register()

    const listResponse = await handlers.get('taskStatus:list')!({}, 'token', {
      projectId: status.projectId
    })
    expect(listResponse).toEqual({ ok: true, data: [status] })

    const createResponse = await handlers.get('taskStatus:create')!({}, 'token', {
      projectId: status.projectId,
      label: status.label
    })
    expect(createResponse).toEqual({ ok: true, data: status })

    const updateResponse = await handlers.get('taskStatus:update')!({}, 'token', status.id, {
      label: 'Updated'
    })
    expect(updateResponse).toEqual({ ok: true, data: { ...status, label: 'Updated' } })

    const reorderResponse = await handlers.get('taskStatus:reorder')!({}, 'token', {
      projectId: status.projectId,
      order: [status.id]
    })
    expect(reorderResponse).toEqual({ ok: true, data: [status] })

    const deleteResponse = await handlers.get('taskStatus:delete')!({}, 'token', {
      statusId: status.id,
      fallbackStatusId: 'status-2'
    })
    expect(deleteResponse).toEqual({ ok: true, data: { success: true } })
  })

  it('propaga errori quando il servizio fallisce', async () => {
    taskStatusService.listStatuses.mockRejectedValue(new Error('boom'))

    new TaskStatusIpcRegistrar({
      authService,
      taskStatusService,
      registrar
    }).register()

    const response = await handlers.get('taskStatus:list')!({}, 'token', { projectId: 'project-1' })
    expect(response).toEqual({ ok: false, code: 'ERR_INTERNAL', message: 'boom' })
  })
})

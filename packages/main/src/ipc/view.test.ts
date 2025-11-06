/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AuthService } from '@services/services/auth'
import type { ViewService } from '@services/services/view'
import type { SavedViewDTO } from '@services/services/view/types'
import { ViewIpcRegistrar } from '@main/ipc/view'
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

const baseView = (): SavedViewDTO => ({
  id: 'view-1',
  projectId: 'project-1',
  userId: 'user-1',
  name: 'In progress',
  filters: {
    searchQuery: '',
    status: 'in_progress',
    priority: 'all',
    assignee: 'all',
    sprint: 'all',
    dueDateRange: null
  },
  sort: {
    field: 'dueDate',
    direction: 'asc'
  },
  columns: ['key', 'title', 'status'],
  createdAt: new Date('2024-01-02T10:00:00.000Z').toISOString(),
  updatedAt: new Date('2024-01-03T10:00:00.000Z').toISOString()
})

describe('ViewIpcRegistrar', () => {
  const actor = { userId: 'user-1' } as const
  let authService: jest.Mocked<AuthService>
  let viewService: jest.Mocked<ViewService>
  let handlers: Map<string, (...args: any[]) => Promise<unknown>>
  let registrar: IpcChannelRegistrar

  beforeEach(() => {
    authService = {
      resolveActor: jest.fn().mockResolvedValue(actor)
    } as unknown as jest.Mocked<AuthService>

    viewService = {
      listViews: jest.fn(),
      createView: jest.fn(),
      updateView: jest.fn(),
      deleteView: jest.fn()
    } as unknown as jest.Mocked<ViewService>

    const registry = createRegistry()
    handlers = registry.handlers
    registrar = registry.registrar
  })

  it('registra e delega le chiamate al ViewService', async () => {
    const dto = baseView()
    viewService.listViews.mockResolvedValue([dto])
    viewService.createView.mockResolvedValue(dto)
    viewService.updateView.mockResolvedValue({ ...dto, name: 'Updated' })
    viewService.deleteView.mockResolvedValue(undefined)

    new ViewIpcRegistrar({ authService, viewService, registrar }).register()

    const listResponse = await handlers.get('view:list')!({}, 'token', { projectId: dto.projectId })
    expect(listResponse).toEqual({ ok: true, data: [dto] })

    const createPayload = {
      projectId: dto.projectId,
      name: dto.name,
      filters: dto.filters,
      sort: dto.sort,
      columns: dto.columns
    }
    const createResponse = await handlers.get('view:create')!({}, 'token', createPayload)
    expect(createResponse).toEqual({ ok: true, data: dto })

    const updateResponse = await handlers.get('view:update')!({}, 'token', dto.id, {
      name: 'Updated'
    })
    expect(updateResponse).toEqual({
      ok: true,
      data: { ...dto, name: 'Updated' }
    })

    const deleteResponse = await handlers.get('view:delete')!({}, 'token', dto.id)
    expect(deleteResponse).toEqual({ ok: true, data: { success: true } })
  })

  it('restituisce errori incapsulati quando il servizio fallisce', async () => {
    viewService.listViews.mockRejectedValue(new Error('boom'))

    new ViewIpcRegistrar({ authService, viewService, registrar }).register()

    const response = await handlers.get('view:list')!({}, 'token', { projectId: 'project-1' })
    expect(response).toEqual({ ok: false, code: 'ERR_INTERNAL', message: 'boom' })
  })
})


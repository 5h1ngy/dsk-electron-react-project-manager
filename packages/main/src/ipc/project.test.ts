import type { AuthService } from '@main/services/auth'
import type { ProjectService } from '@main/services/project'
import { ProjectIpcRegistrar } from '@main/ipc/project'
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

describe('ProjectIpcRegistrar', () => {
  const actor = { userId: 'user-1' } as const
  let authService: jest.Mocked<AuthService>
  let projectService: jest.Mocked<ProjectService>
  let handlers: Map<string, (...args: any[]) => Promise<unknown>>
  let registrar: IpcChannelRegistrar

  beforeEach(() => {
    authService = {
      resolveActor: jest.fn().mockResolvedValue(actor)
    } as unknown as jest.Mocked<AuthService>

    projectService = {
      listProjects: jest.fn(),
      getProject: jest.fn(),
      createProject: jest.fn(),
      updateProject: jest.fn(),
      deleteProject: jest.fn(),
      addOrUpdateMember: jest.fn(),
      removeMember: jest.fn()
    } as unknown as jest.Mocked<ProjectService>

    const registry = createRegistry()
    handlers = registry.handlers
    registrar = registry.registrar
  })

  it('invokes project service methods with resolved actor', async () => {
    projectService.listProjects.mockResolvedValue([])
    projectService.getProject.mockResolvedValue({ id: 'p1' })
    projectService.createProject.mockResolvedValue({ id: 'p1' })
    projectService.updateProject.mockResolvedValue({ id: 'p1' })
    projectService.deleteProject.mockResolvedValue(undefined)
    projectService.addOrUpdateMember.mockResolvedValue({ id: 'p1' })
    projectService.removeMember.mockResolvedValue(undefined)

    new ProjectIpcRegistrar({ authService, projectService, registrar }).register()

    await handlers.get('project:list')!({}, 'token')
    expect(authService.resolveActor).toHaveBeenCalledWith('token', { touch: true })

    const deleteResponse = await handlers.get('project:delete')!({}, 'token', 'proj-1')
    expect(deleteResponse).toEqual({ ok: true, data: { success: true } })
    expect(projectService.deleteProject).toHaveBeenCalledWith(actor, 'proj-1')
  })

  it('bubbles up unexpected errors', async () => {
    projectService.listProjects.mockRejectedValue(new Error('boom'))

    new ProjectIpcRegistrar({ authService, projectService, registrar }).register()

    const response = await handlers.get('project:list')!({}, 'token')
    expect(response).toEqual({ ok: false, code: 'ERR_INTERNAL', message: 'boom' })
  })
})

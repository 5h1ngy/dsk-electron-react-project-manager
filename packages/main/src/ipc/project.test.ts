import type { AuthService } from '@main/services/auth'
import type { ProjectService } from '@main/services/project'
import type { ProjectDetailsDTO, ProjectSummaryDTO } from '@main/services/project/types'
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

const createProjectDetails = (overrides: Partial<ProjectDetailsDTO> = {}): ProjectDetailsDTO => {
  const base: ProjectDetailsDTO = {
    id: overrides.id ?? 'project-1',
    key: overrides.key ?? 'PRJ',
    name: overrides.name ?? 'Portal Revamp',
    description: overrides.description ?? 'Revamp the internal customer portal.',
    createdBy: overrides.createdBy ?? 'user-1',
    createdAt: overrides.createdAt ?? new Date('2024-02-01T09:00:00.000Z'),
    updatedAt: overrides.updatedAt ?? new Date('2024-02-10T09:00:00.000Z'),
    role: overrides.role ?? 'admin',
    memberCount: overrides.memberCount ?? 4,
    tags: overrides.tags ?? ['ux', 'refactor'],
    members:
      overrides.members ?? [
        {
          userId: 'user-1',
          username: 'jane.doe',
          displayName: 'Jane Doe',
          isActive: true,
          role: 'admin',
          createdAt: new Date('2024-02-01T09:05:00.000Z')
        }
      ]
  }
  return base
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
    const projectDetails = createProjectDetails({ id: 'p1' })
    projectService.listProjects.mockResolvedValue([
      {
        id: projectDetails.id,
        key: projectDetails.key,
        name: projectDetails.name,
        description: projectDetails.description,
        createdBy: projectDetails.createdBy,
        createdAt: projectDetails.createdAt,
        updatedAt: projectDetails.updatedAt,
        role: projectDetails.role,
        memberCount: projectDetails.memberCount,
        tags: projectDetails.tags
      } satisfies ProjectSummaryDTO
    ])
    projectService.getProject.mockResolvedValue(projectDetails)
    projectService.createProject.mockResolvedValue(projectDetails)
    projectService.updateProject.mockResolvedValue(projectDetails)
    projectService.deleteProject.mockResolvedValue(undefined)
    projectService.addOrUpdateMember.mockResolvedValue(projectDetails)
    projectService.removeMember.mockResolvedValue(projectDetails)

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

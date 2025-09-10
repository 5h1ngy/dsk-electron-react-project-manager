import type { AuthService } from '../services/auth.service'
import type { ProjectService } from '../services/project.service'
import { appContext } from '../appContext'
import { IpcChannelRegistrar, ipcChannelRegistrar } from './utils'

export interface ProjectIpcDependencies {
  authService: AuthService
  projectService: ProjectService
  registrar: IpcChannelRegistrar
}

export class ProjectIpcRegistrar {
  private readonly authService: AuthService
  private readonly projectService: ProjectService
  private readonly registrar: IpcChannelRegistrar

  constructor(dependencies: ProjectIpcDependencies) {
    this.authService = dependencies.authService
    this.projectService = dependencies.projectService
    this.registrar = dependencies.registrar
  }

  register(): void {
    this.registrar.register('project:list', async (token: string) => {
      const actor = await this.resolveActor(token)
      return await this.projectService.listProjects(actor)
    })

    this.registrar.register('project:get', async (token: string, projectId: string) => {
      const actor = await this.resolveActor(token)
      return await this.projectService.getProject(actor, projectId)
    })

    this.registrar.register('project:create', async (token: string, payload: unknown) => {
      const actor = await this.resolveActor(token)
      return await this.projectService.createProject(actor, payload)
    })

    this.registrar.register(
      'project:update',
      async (token: string, projectId: string, payload: unknown) => {
        const actor = await this.resolveActor(token)
        return await this.projectService.updateProject(actor, projectId, payload)
      }
    )

    this.registrar.register('project:delete', async (token: string, projectId: string) => {
      const actor = await this.resolveActor(token)
      await this.projectService.deleteProject(actor, projectId)
      return { success: true }
    })

    this.registrar.register(
      'project:add-member',
      async (token: string, projectId: string, payload: unknown) => {
        const actor = await this.resolveActor(token)
        return await this.projectService.addOrUpdateMember(actor, projectId, payload)
      }
    )

    this.registrar.register(
      'project:remove-member',
      async (token: string, projectId: string, userId: string) => {
        const actor = await this.resolveActor(token)
        return await this.projectService.removeMember(actor, projectId, userId)
      }
    )
  }

  private async resolveActor(token: string) {
    return await this.authService.resolveActor(token, { touch: true })
  }
}

export const registerProjectIpc = (): void => {
  if (!appContext.projectService) {
    throw new Error('ProjectService not initialized')
  }

  new ProjectIpcRegistrar({
    authService: appContext.authService,
    projectService: appContext.projectService,
    registrar: ipcChannelRegistrar
  }).register()
}

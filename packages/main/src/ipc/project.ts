import { appContext } from '../appContext'
import { registerIpcHandler } from './utils'

export const registerProjectIpc = (): void => {
  const { authService, projectService } = appContext

  if (!projectService) {
    throw new Error('ProjectService not initialized')
  }

  registerIpcHandler('project:list', async (token: string) => {
    const actor = await authService.resolveActor(token, { touch: true })
    return await projectService.listProjects(actor)
  })

  registerIpcHandler('project:get', async (token: string, projectId: string) => {
    const actor = await authService.resolveActor(token, { touch: true })
    return await projectService.getProject(actor, projectId)
  })

  registerIpcHandler('project:create', async (token: string, payload: unknown) => {
    const actor = await authService.resolveActor(token, { touch: true })
    return await projectService.createProject(actor, payload)
  })

  registerIpcHandler(
    'project:update',
    async (token: string, projectId: string, payload: unknown) => {
      const actor = await authService.resolveActor(token, { touch: true })
      return await projectService.updateProject(actor, projectId, payload)
    }
  )

  registerIpcHandler('project:delete', async (token: string, projectId: string) => {
    const actor = await authService.resolveActor(token, { touch: true })
    await projectService.deleteProject(actor, projectId)
    return { success: true }
  })

  registerIpcHandler(
    'project:add-member',
    async (token: string, projectId: string, payload: unknown) => {
      const actor = await authService.resolveActor(token, { touch: true })
      return await projectService.addOrUpdateMember(actor, projectId, payload)
    }
  )

  registerIpcHandler(
    'project:remove-member',
    async (token: string, projectId: string, userId: string) => {
      const actor = await authService.resolveActor(token, { touch: true })
      return await projectService.removeMember(actor, projectId, userId)
    }
  )
}

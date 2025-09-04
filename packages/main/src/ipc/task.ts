import { appContext } from '../appContext'
import { registerIpcHandler } from './utils'

export const registerTaskIpc = (): void => {
  const { authService, taskService } = appContext

  if (!taskService) {
    throw new Error('TaskService not initialized')
  }

  registerIpcHandler(
    'task:list',
    async (token: string, projectId: string) => {
      const actor = await authService.resolveActor(token, { touch: true })
      return await taskService.listByProject(actor, projectId)
    }
  )

  registerIpcHandler('task:get', async (token: string, taskId: string) => {
    const actor = await authService.resolveActor(token, { touch: true })
    return await taskService.getTask(actor, taskId)
  })

  registerIpcHandler('task:create', async (token: string, payload: unknown) => {
    const actor = await authService.resolveActor(token, { touch: true })
    return await taskService.createTask(actor, payload)
  })

  registerIpcHandler(
    'task:update',
    async (token: string, taskId: string, payload: unknown) => {
      const actor = await authService.resolveActor(token, { touch: true })
      return await taskService.updateTask(actor, taskId, payload)
    }
  )

  registerIpcHandler(
    'task:move',
    async (token: string, taskId: string, payload: unknown) => {
      const actor = await authService.resolveActor(token, { touch: true })
      return await taskService.moveTask(actor, taskId, payload)
    }
  )

  registerIpcHandler('task:delete', async (token: string, taskId: string) => {
    const actor = await authService.resolveActor(token, { touch: true })
    await taskService.deleteTask(actor, taskId)
    return { success: true }
  })

  registerIpcHandler(
    'task:comment:list',
    async (token: string, taskId: string) => {
      const actor = await authService.resolveActor(token, { touch: true })
      return await taskService.listComments(actor, taskId)
    }
  )

  registerIpcHandler(
    'task:comment:add',
    async (token: string, payload: unknown) => {
      const actor = await authService.resolveActor(token, { touch: true })
      return await taskService.addComment(actor, payload)
    }
  )

  registerIpcHandler('task:search', async (token: string, payload: unknown) => {
    const actor = await authService.resolveActor(token, { touch: true })
    return await taskService.search(actor, payload)
  })
}

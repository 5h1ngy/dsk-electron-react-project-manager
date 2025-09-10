import type { AuthService } from '@main/services/auth'
import type { TaskService } from '@main/services/task'
import { appContext } from '@main/appContext'
import { IpcChannelRegistrar, ipcChannelRegistrar } from '@main/ipc/utils'

export interface TaskIpcDependencies {
  authService: AuthService
  taskService: TaskService
  registrar: IpcChannelRegistrar
}

export class TaskIpcRegistrar {
  private readonly authService: AuthService
  private readonly taskService: TaskService
  private readonly registrar: IpcChannelRegistrar

  constructor(dependencies: TaskIpcDependencies) {
    this.authService = dependencies.authService
    this.taskService = dependencies.taskService
    this.registrar = dependencies.registrar
  }

  register(): void {
    this.registrar.register(
      'task:list',
      async (token: string, projectId: string) => {
        const actor = await this.resolveActor(token)
        return await this.taskService.listByProject(actor, projectId)
      }
    )

    this.registrar.register('task:get', async (token: string, taskId: string) => {
      const actor = await this.resolveActor(token)
      return await this.taskService.getTask(actor, taskId)
    })

    this.registrar.register('task:create', async (token: string, payload: unknown) => {
      const actor = await this.resolveActor(token)
      return await this.taskService.createTask(actor, payload)
    })

    this.registrar.register(
      'task:update',
      async (token: string, taskId: string, payload: unknown) => {
        const actor = await this.resolveActor(token)
        return await this.taskService.updateTask(actor, taskId, payload)
      }
    )

    this.registrar.register(
      'task:move',
      async (token: string, taskId: string, payload: unknown) => {
        const actor = await this.resolveActor(token)
        return await this.taskService.moveTask(actor, taskId, payload)
      }
    )

    this.registrar.register('task:delete', async (token: string, taskId: string) => {
      const actor = await this.resolveActor(token)
      await this.taskService.deleteTask(actor, taskId)
      return { success: true }
    })

    this.registrar.register(
      'task:comment:list',
      async (token: string, taskId: string) => {
        const actor = await this.resolveActor(token)
        return await this.taskService.listComments(actor, taskId)
      }
    )

    this.registrar.register(
      'task:comment:add',
      async (token: string, payload: unknown) => {
        const actor = await this.resolveActor(token)
        return await this.taskService.addComment(actor, payload)
      }
    )

    this.registrar.register('task:search', async (token: string, payload: unknown) => {
      const actor = await this.resolveActor(token)
      return await this.taskService.search(actor, payload)
    })
  }

  private async resolveActor(token: string) {
    return await this.authService.resolveActor(token, { touch: true })
  }
}

export const registerTaskIpc = (): void => {
  if (!appContext.taskService) {
    throw new Error('TaskService not initialized')
  }

  new TaskIpcRegistrar({
    authService: appContext.authService,
    taskService: appContext.taskService,
    registrar: ipcChannelRegistrar
  }).register()
}

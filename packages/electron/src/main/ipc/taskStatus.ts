import type { AuthService } from '@services/services/auth'
import type { TaskStatusService } from '@services/services/taskStatus'

import { IpcChannelRegistrar } from '@main/ipc/utils'

export interface TaskStatusIpcDependencies {
  authService: AuthService
  taskStatusService: TaskStatusService
  registrar: IpcChannelRegistrar
}

export class TaskStatusIpcRegistrar {
  private readonly authService: AuthService
  private readonly taskStatusService: TaskStatusService
  private readonly registrar: IpcChannelRegistrar

  constructor(dependencies: TaskStatusIpcDependencies) {
    this.authService = dependencies.authService
    this.taskStatusService = dependencies.taskStatusService
    this.registrar = dependencies.registrar
  }

  register(): void {
    this.registrar.register('taskStatus:list', async (token: string, payload: unknown) => {
      const actor = await this.resolveActor(token)
      return await this.taskStatusService.listStatuses(actor, payload)
    })

    this.registrar.register('taskStatus:create', async (token: string, payload: unknown) => {
      const actor = await this.resolveActor(token)
      return await this.taskStatusService.createStatus(actor, payload)
    })

    this.registrar.register(
      'taskStatus:update',
      async (token: string, statusId: string, payload: unknown) => {
        const actor = await this.resolveActor(token)
        return await this.taskStatusService.updateStatus(actor, statusId, payload)
      }
    )

    this.registrar.register('taskStatus:reorder', async (token: string, payload: unknown) => {
      const actor = await this.resolveActor(token)
      return await this.taskStatusService.reorderStatuses(actor, payload)
    })

    this.registrar.register('taskStatus:delete', async (token: string, payload: unknown) => {
      const actor = await this.resolveActor(token)
      return await this.taskStatusService.deleteStatus(actor, payload)
    })
  }

  private async resolveActor(token: string) {
    return await this.authService.resolveActor(token, { touch: true })
  }
}

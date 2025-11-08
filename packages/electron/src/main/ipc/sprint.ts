import type { AuthService } from '@services/services/auth'
import type { SprintService } from '@services/services/sprint'

import { IpcChannelRegistrar } from '@main/ipc/utils'

export interface SprintIpcDependencies {
  authService: AuthService
  sprintService: SprintService
  registrar: IpcChannelRegistrar
}

export class SprintIpcRegistrar {
  private readonly authService: AuthService
  private readonly sprintService: SprintService
  private readonly registrar: IpcChannelRegistrar

  constructor(dependencies: SprintIpcDependencies) {
    this.authService = dependencies.authService
    this.sprintService = dependencies.sprintService
    this.registrar = dependencies.registrar
  }

  register(): void {
    this.registrar.register('sprint:list', async (token: string, projectId: string) => {
      const actor = await this.resolveActor(token)
      return await this.sprintService.listByProject(actor, projectId)
    })

    this.registrar.register('sprint:get', async (token: string, sprintId: string) => {
      const actor = await this.resolveActor(token)
      return await this.sprintService.getSprint(actor, sprintId)
    })

    this.registrar.register('sprint:create', async (token: string, payload: unknown) => {
      const actor = await this.resolveActor(token)
      return await this.sprintService.createSprint(actor, payload)
    })

    this.registrar.register(
      'sprint:update',
      async (token: string, sprintId: string, payload: unknown) => {
        const actor = await this.resolveActor(token)
        return await this.sprintService.updateSprint(actor, sprintId, payload)
      }
    )

    this.registrar.register('sprint:delete', async (token: string, sprintId: string) => {
      const actor = await this.resolveActor(token)
      await this.sprintService.deleteSprint(actor, sprintId)
      return { success: true }
    })
  }

  private async resolveActor(token: string) {
    return await this.authService.resolveActor(token, { touch: true })
  }
}

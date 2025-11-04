import type { AuthService } from '@main/services/auth'
import type { SprintService } from '@main/services/sprint'
import { IpcChannelRegistrar } from '@main/ipc/utils'

export interface SprintIpcDependencies {
  authService: AuthService
  sprintService: SprintService
  registrar: IpcChannelRegistrar
}

export class SprintIpcRegistrar {
  constructor(private readonly deps: SprintIpcDependencies) {}

  register(): void {
    const { registrar } = this.deps

    registrar.register('sprint:list', async (token: string, projectId: string) => {
      const actor = await this.resolveActor(token)
      return await this.deps.sprintService.listByProject(actor, projectId)
    })

    registrar.register('sprint:get', async (token: string, sprintId: string) => {
      const actor = await this.resolveActor(token)
      return await this.deps.sprintService.getSprint(actor, sprintId)
    })

    registrar.register('sprint:create', async (token: string, payload: unknown) => {
      const actor = await this.resolveActor(token)
      return await this.deps.sprintService.createSprint(actor, payload)
    })

    registrar.register(
      'sprint:update',
      async (token: string, sprintId: string, payload: unknown) => {
        const actor = await this.resolveActor(token)
        return await this.deps.sprintService.updateSprint(actor, sprintId, payload)
      }
    )

    registrar.register('sprint:delete', async (token: string, sprintId: string) => {
      const actor = await this.resolveActor(token)
      await this.deps.sprintService.deleteSprint(actor, sprintId)
      return { success: true }
    })
  }

  private async resolveActor(token: string) {
    return await this.deps.authService.resolveActor(token, { touch: true })
  }
}

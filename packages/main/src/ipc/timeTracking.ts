import type { AuthService } from '@main/services/auth'
import type { TimeTrackingService } from '@main/services/timeTracking'
import { IpcChannelRegistrar } from '@main/ipc/utils'

export interface TimeTrackingIpcDependencies {
  authService: AuthService
  timeTrackingService: TimeTrackingService
  registrar: IpcChannelRegistrar
}

export class TimeTrackingIpcRegistrar {
  constructor(private readonly deps: TimeTrackingIpcDependencies) {}

  register(): void {
    const { registrar } = this.deps

    registrar.register('time:log', async (token: string, payload: unknown) => {
      const actor = await this.resolveActor(token)
      return await this.deps.timeTrackingService.logEntry(actor, payload)
    })

    registrar.register('time:update', async (token: string, entryId: string, payload: unknown) => {
      const actor = await this.resolveActor(token)
      return await this.deps.timeTrackingService.updateEntry(actor, entryId, payload)
    })

    registrar.register('time:delete', async (token: string, entryId: string) => {
      const actor = await this.resolveActor(token)
      await this.deps.timeTrackingService.deleteEntry(actor, entryId)
      return { success: true }
    })

    registrar.register('time:summary', async (token: string, payload: unknown) => {
      const actor = await this.resolveActor(token)
      return await this.deps.timeTrackingService.getProjectSummary(actor, payload)
    })
  }

  private async resolveActor(token: string) {
    return await this.deps.authService.resolveActor(token, { touch: true })
  }
}

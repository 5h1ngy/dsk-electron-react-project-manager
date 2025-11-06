import type { AuthService } from '@services/services/auth'
import type { ViewService } from '@services/services/view'
import { IpcChannelRegistrar } from '@main/ipc/utils'

export interface ViewIpcDependencies {
  authService: AuthService
  viewService: ViewService
  registrar: IpcChannelRegistrar
}

export class ViewIpcRegistrar {
  private readonly authService: AuthService
  private readonly viewService: ViewService
  private readonly registrar: IpcChannelRegistrar

  constructor(dependencies: ViewIpcDependencies) {
    this.authService = dependencies.authService
    this.viewService = dependencies.viewService
    this.registrar = dependencies.registrar
  }

  register(): void {
    this.registrar.register('view:list', async (token: string, payload: unknown) => {
      const actor = await this.resolveActor(token)
      return await this.viewService.listViews(actor, payload)
    })

    this.registrar.register('view:create', async (token: string, payload: unknown) => {
      const actor = await this.resolveActor(token)
      return await this.viewService.createView(actor, payload)
    })

    this.registrar.register(
      'view:update',
      async (token: string, viewId: string, payload: unknown) => {
        const actor = await this.resolveActor(token)
        return await this.viewService.updateView(actor, viewId, payload)
      }
    )

    this.registrar.register('view:delete', async (token: string, viewId: string) => {
      const actor = await this.resolveActor(token)
      await this.viewService.deleteView(actor, viewId)
      return { success: true }
    })
  }

  private async resolveActor(token: string) {
    return await this.authService.resolveActor(token, { touch: true })
  }
}


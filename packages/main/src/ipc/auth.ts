import type { AuthService } from '@main/services/auth'
import { appContext } from '@main/appContext'
import { IpcChannelRegistrar, ipcChannelRegistrar } from '@main/ipc/utils'

export interface AuthIpcDependencies {
  authService: AuthService
  registrar: IpcChannelRegistrar
}

export class AuthIpcRegistrar {
  private readonly authService: AuthService
  private readonly registrar: IpcChannelRegistrar

  constructor(dependencies: AuthIpcDependencies) {
    this.authService = dependencies.authService
    this.registrar = dependencies.registrar
  }

  register(): void {
    this.registrar.register('auth:login', async (payload: unknown) => {
      return await this.authService.login(payload)
    })

    this.registrar.register('auth:register', async (payload: unknown) => {
      return await this.authService.register(payload)
    })

    this.registrar.register('auth:logout', async (token: string) => {
      await this.authService.logout(token)
      return { success: true }
    })

    this.registrar.register('auth:session', async (token: string) => {
      return await this.authService.currentSession(token)
    })

    this.registrar.register('auth:list-users', async (token: string) => {
      return await this.authService.listUsers(token)
    })

    this.registrar.register('auth:create-user', async (token: string, payload: unknown) => {
      return await this.authService.createUser(token, payload)
    })

    this.registrar.register(
      'auth:update-user',
      async (token: string, userId: string, payload: unknown) => {
        return await this.authService.updateUser(token, userId, payload)
      }
    )
  }
}

export const registerAuthIpc = (): void => {
  new AuthIpcRegistrar({
    authService: appContext.authService,
    registrar: ipcChannelRegistrar
  }).register()
}

import { appContext } from '../appContext'
import { registerIpcHandler } from './utils'

export const registerAuthIpc = (): void => {
  const { authService } = appContext

  registerIpcHandler('auth:login', async (payload: unknown) => {
    return await authService.login(payload)
  })

  registerIpcHandler('auth:register', async (payload: unknown) => {
    return await authService.register(payload)
  })

  registerIpcHandler('auth:logout', async (token: string) => {
    await authService.logout(token)
    return { success: true }
  })

  registerIpcHandler('auth:session', async (token: string) => {
    return await authService.currentSession(token)
  })

  registerIpcHandler('auth:list-users', async (token: string) => {
    return await authService.listUsers(token)
  })

  registerIpcHandler('auth:create-user', async (token: string, payload: unknown) => {
    return await authService.createUser(token, payload)
  })

  registerIpcHandler('auth:update-user', async (token: string, userId: string, payload: unknown) => {
    return await authService.updateUser(token, userId, payload)
  })
}

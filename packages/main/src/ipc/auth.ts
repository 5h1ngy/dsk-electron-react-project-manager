import { ipcMain } from 'electron'
import { appContext } from '../appContext'
import { logger } from '../utils/logger'
import { AppError, wrapError } from '../errors/appError'

interface SuccessResponse<T> {
  ok: true
  data: T
}

interface ErrorResponse {
  ok: false
  code: string
  message: string
}

const success = <T>(data: T): SuccessResponse<T> => ({ ok: true, data })

const error = (appError: AppError): ErrorResponse => ({
  ok: false,
  code: appError.code,
  message: appError.message
})

const registerHandler = <Args extends any[], Result>(
  channel: string,
  handler: (...args: Args) => Promise<Result>
): void => {
  if (ipcMain.listenerCount(channel) > 0) {
    ipcMain.removeHandler(channel)
  }

  ipcMain.handle(channel, async (_event, ...args: Args) => {
    try {
      const data = await handler(...args)
      return success(data)
    } catch (unknownError) {
      const appError = wrapError(unknownError)
      if (appError.code === 'ERR_INTERNAL') {
        logger.error(appError.message, 'IPC', appError)
      } else {
        logger.warn(appError.message, 'IPC')
      }
      return error(appError)
    }
  })
}

export const registerAuthIpc = (): void => {
  const { authService } = appContext

  registerHandler('auth:login', async (payload: unknown) => {
    return await authService.login(payload)
  })

  registerHandler('auth:register', async (payload: unknown) => {
    return await authService.register(payload)
  })

  registerHandler('auth:logout', async (token: string) => {
    await authService.logout(token)
    return { success: true }
  })

  registerHandler('auth:session', async (token: string) => {
    return await authService.currentSession(token)
  })

  registerHandler('auth:list-users', async (token: string) => {
    return await authService.listUsers(token)
  })

  registerHandler('auth:create-user', async (token: string, payload: unknown) => {
    return await authService.createUser(token, payload)
  })

  registerHandler('auth:update-user', async (token: string, userId: string, payload: unknown) => {
    return await authService.updateUser(token, userId, payload)
  })
}

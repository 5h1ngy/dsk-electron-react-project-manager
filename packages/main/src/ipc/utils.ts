import { ipcMain } from 'electron'
import { logger } from '../config/logger'
import { AppError, wrapError } from '../errors/appError'

export interface IpcSuccessResponse<T> {
  ok: true
  data: T
}

export interface IpcErrorResponse {
  ok: false
  code: string
  message: string
}

export type IpcResponse<T> = IpcSuccessResponse<T> | IpcErrorResponse

export const success = <T>(data: T): IpcSuccessResponse<T> => ({
  ok: true,
  data
})

export const error = (appError: AppError): IpcErrorResponse => ({
  ok: false,
  code: appError.code,
  message: appError.message
})

export const registerIpcHandler = <Args extends unknown[], Result>(
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

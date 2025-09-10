import { ipcMain } from 'electron'
import { logger } from '@main/config/logger'
import { AppError, wrapError } from '@main/config/appError'

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

export interface IpcChannelRegistrarOptions {
  ipc?: Pick<typeof ipcMain, 'listenerCount' | 'removeHandler' | 'handle'>
  logger?: Pick<typeof logger, 'warn' | 'error'>
}

class IpcResponseFactory {
  success<T>(data: T): IpcSuccessResponse<T> {
    return {
      ok: true,
      data
    }
  }

  error(appError: AppError): IpcErrorResponse {
    return {
      ok: false,
      code: appError.code,
      message: appError.message
    }
  }
}

export class IpcChannelRegistrar {
  private readonly ipc: Pick<typeof ipcMain, 'listenerCount' | 'removeHandler' | 'handle'>
  private readonly logger: Pick<typeof logger, 'warn' | 'error'>
  private readonly responses: IpcResponseFactory

  constructor(options: IpcChannelRegistrarOptions = {}) {
    this.ipc = options.ipc ?? ipcMain
    this.logger = options.logger ?? logger
    this.responses = new IpcResponseFactory()
  }

  register<Args extends unknown[], Result>(
    channel: string,
    handler: (...args: Args) => Promise<Result>
  ): void {
    if (this.ipc.listenerCount(channel) > 0) {
      this.ipc.removeHandler(channel)
    }

    this.ipc.handle(channel, async (_event, ...args: Args) => {
      try {
        const data = await handler(...args)
        return this.responses.success(data)
      } catch (unknownError) {
        const appError = wrapError(unknownError)
        this.logFailure(appError)
        return this.responses.error(appError)
      }
    })
  }

  private logFailure(appError: AppError): void {
    if (appError.code === 'ERR_INTERNAL') {
      this.logger.error(appError.message, 'IPC', appError)
      return
    }
    this.logger.warn(appError.message, 'IPC')
  }
}

export const ipcChannelRegistrar = new IpcChannelRegistrar()

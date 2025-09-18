import type { App } from 'electron'
import type { Sequelize } from 'sequelize-typescript'

import { AppError } from '@main/config/appError'
import { IpcChannelRegistrar } from '@main/ipc/utils'
import type { IpcResponse } from '@main/ipc/utils'

export interface HealthStatus {
  status: 'healthy'
  version: string
  timestamp: string
  uptimeSeconds: number
}

export const HEALTH_CHANNEL = 'system:health'

export interface HealthIpcDependencies {
  sequelize: Sequelize
  appRef: Pick<App, 'getVersion'>
  registrar: IpcChannelRegistrar
  channel?: string
}

export class HealthIpcRegistrar {
  private readonly sequelize: Sequelize
  private readonly appRef: Pick<App, 'getVersion'>
  private readonly registrar: IpcChannelRegistrar
  private readonly channel: string

  constructor(dependencies: HealthIpcDependencies) {
    this.sequelize = dependencies.sequelize
    this.appRef = dependencies.appRef
    this.registrar = dependencies.registrar
    this.channel = dependencies.channel ?? HEALTH_CHANNEL
  }

  register(): void {
    this.registrar.register(this.channel, async (): Promise<HealthStatus> => {
      try {
        await this.sequelize.authenticate()
        return {
          status: 'healthy',
          version: this.appRef.getVersion(),
          timestamp: new Date().toISOString(),
          uptimeSeconds: process.uptime()
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        throw new AppError('ERR_INTERNAL', message, { cause: error })
      }
    })
  }
}

export type HealthResponse = IpcResponse<HealthStatus>

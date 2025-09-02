import { app, ipcMain } from 'electron'
import type { Sequelize } from 'sequelize-typescript'

export interface HealthStatus {
  status: 'healthy'
  version: string
  timestamp: string
  uptimeSeconds: number
}

export type HealthOkResponse = { ok: true; data: HealthStatus }
export type HealthErrorResponse = { ok: false; code: string; message: string }
export type HealthResponse = HealthOkResponse | HealthErrorResponse

const CHANNEL = 'system:health'

export const registerHealthIpc = (sequelize: Sequelize): void => {
  if (ipcMain.listenerCount(CHANNEL) > 0) {
    ipcMain.removeHandler(CHANNEL)
  }

  ipcMain.handle(CHANNEL, async (): Promise<HealthResponse> => {
    try {
      await sequelize.authenticate()

      return {
        ok: true,
        data: {
          status: 'healthy',
          version: app.getVersion(),
          timestamp: new Date().toISOString(),
          uptimeSeconds: process.uptime()
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'

      return {
        ok: false,
        code: 'ERR_INTERNAL',
        message
      }
    }
  })
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Sequelize } from 'sequelize-typescript'

import { HealthIpcRegistrar, HEALTH_CHANNEL } from '@main/ipc/health'
import { IpcChannelRegistrar } from '@main/ipc/utils'

const createRegistry = () => {
  const handlers = new Map<string, (...args: any[]) => Promise<unknown>>()
  const ipcMock = {
    handle: jest.fn((channel: string, handler: (...args: any[]) => Promise<unknown>) => {
      handlers.set(channel, handler)
    }),
    listenerCount: jest.fn(() => 0),
    removeHandler: jest.fn()
  }
  const loggerMock = { warn: jest.fn(), error: jest.fn() }
  const registrar = new IpcChannelRegistrar({ ipc: ipcMock as any, logger: loggerMock })
  return { handlers, registrar }
}

describe('HealthIpcRegistrar', () => {
  let authenticate: jest.Mock
  let sequelize: Sequelize
  let handlers: Map<string, (...args: any[]) => Promise<unknown>>
  let registrar: IpcChannelRegistrar
  const appRef = { getVersion: () => '1.2.3' }

  beforeEach(() => {
    authenticate = jest.fn().mockResolvedValue(undefined)
    sequelize = { authenticate } as unknown as Sequelize

    const registry = createRegistry()
    handlers = registry.handlers
    registrar = registry.registrar
  })

  it('reports healthy status when authentication succeeds', async () => {
    new HealthIpcRegistrar({ sequelize, appRef, registrar }).register()

    const response = await handlers.get(HEALTH_CHANNEL)!({})

    expect(response).toMatchObject({
      ok: true,
      data: {
        status: 'healthy',
        version: '1.2.3'
      }
    })
    expect(authenticate).toHaveBeenCalledTimes(1)
  })

  it('returns an error response when authentication fails', async () => {
    authenticate.mockRejectedValue(new Error('boom'))

    new HealthIpcRegistrar({ sequelize, appRef, registrar }).register()

    const response = await handlers.get(HEALTH_CHANNEL)!({})
    expect(response).toEqual({
      ok: false,
      code: 'ERR_INTERNAL',
      message: 'boom'
    })
  })
})

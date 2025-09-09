import type { Sequelize } from 'sequelize-typescript'

import { HealthIpcRegistrar, HEALTH_CHANNEL } from './health'
import { IpcChannelRegistrar } from './utils'

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
  let sequelize: { authenticate: jest.Mock } & Partial<Sequelize>
  let handlers: Map<string, (...args: any[]) => Promise<unknown>>
  let registrar: IpcChannelRegistrar
  const appRef = { getVersion: () => '1.2.3' }

  beforeEach(() => {
    sequelize = {
      authenticate: jest.fn().mockResolvedValue(undefined)
    } as unknown as { authenticate: jest.Mock } & Partial<Sequelize>

    const registry = createRegistry()
    handlers = registry.handlers
    registrar = registry.registrar
  })

  it('reports healthy status when authentication succeeds', async () => {
    new HealthIpcRegistrar({ sequelize: sequelize as Sequelize, appRef, registrar }).register()

    const response = await handlers.get(HEALTH_CHANNEL)!({})

    expect(response).toMatchObject({
      ok: true,
      data: {
        status: 'healthy',
        version: '1.2.3'
      }
    })
    expect(sequelize.authenticate).toHaveBeenCalledTimes(1)
  })

  it('returns an error response when authentication fails', async () => {
    sequelize.authenticate.mockRejectedValue(new Error('boom'))

    new HealthIpcRegistrar({ sequelize: sequelize as Sequelize, appRef, registrar }).register()

    const response = await handlers.get(HEALTH_CHANNEL)!({})
    expect(response).toEqual({
      ok: false,
      code: 'ERR_INTERNAL',
      message: 'boom'
    })
  })
})

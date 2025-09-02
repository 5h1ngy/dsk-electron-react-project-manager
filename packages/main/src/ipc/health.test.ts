
import { registerHealthIpc } from './health'

const handlerRegistry = new Map<string, () => Promise<unknown>>()

jest.mock('electron', () => ({
  app: {
    getVersion: () => '1.0.0'
  },
  ipcMain: {
    listenerCount: jest.fn().mockReturnValue(0),
    removeHandler: jest.fn(),
    handle: (channel: string, handler: () => Promise<unknown>) => {
      handlerRegistry.set(channel, handler)
    }
  }
}))

describe('registerHealthIpc', () => {
  beforeEach(() => {
    handlerRegistry.clear()
  })

  it('returns a healthy payload when the database authenticates', async () => {
    const sequelize = {
      authenticate: jest.fn().mockResolvedValue(undefined)
    } as any

    registerHealthIpc(sequelize)

    const handler = handlerRegistry.get('system:health')
    expect(handler).toBeDefined()

    const response = (await handler?.()) as { ok: boolean; data: { version: string } }

    expect(response.ok).toBe(true)
    expect(response.data.version).toBe('1.0.0')
  })

  it('returns an error payload when authentication fails', async () => {
    const sequelize = {
      authenticate: jest.fn().mockRejectedValue(new Error('boom'))
    } as any

    registerHealthIpc(sequelize)

    const handler = handlerRegistry.get('system:health')
    expect(handler).toBeDefined()

    const response = (await handler?.()) as { ok: boolean; message: string; code: string }

    expect(response.ok).toBe(false)
    expect(response.code).toBe('ERR_INTERNAL')
    expect(response.message).toBe('boom')
  })
})

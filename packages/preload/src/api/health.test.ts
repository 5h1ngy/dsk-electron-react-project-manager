import { ipcRenderer } from 'electron'
import { healthApi } from './health'

jest.mock('electron', () => ({
  ipcRenderer: {
    invoke: jest.fn()
  }
}))

const invokeMock = ipcRenderer.invoke as jest.Mock

describe('health preload api', () => {
  beforeEach(() => {
    invokeMock.mockReset()
  })

  it('returns the health payload when valid', async () => {
    const payload = {
      ok: true,
      data: {
        status: 'healthy',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        uptimeSeconds: 10
      }
    }

    invokeMock.mockResolvedValueOnce(payload)
    await expect(healthApi.check()).resolves.toEqual(payload)
    expect(invokeMock).toHaveBeenCalledWith('system:health')
  })

  it('throws when the payload is invalid', async () => {
    invokeMock.mockResolvedValueOnce({ invalid: true })
    await expect(healthApi.check()).rejects.toThrow('ERR_INVALID_HEALTH_RESPONSE')
  })
})

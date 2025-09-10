import { ipcRenderer } from 'electron'
import { authApi } from '@preload/api/auth'

jest.mock('electron', () => ({
  ipcRenderer: {
    invoke: jest.fn()
  }
}))

const invokeMock = ipcRenderer.invoke as jest.Mock

describe('auth preload api', () => {
  beforeEach(() => {
    invokeMock.mockReset()
  })

  it('invokes login channel with credentials', async () => {
    const response = {
      ok: true,
      data: {
        token: 'abc',
        user: {
          id: '1',
          username: 'admin',
          displayName: 'Admin',
          isActive: true,
          roles: ['Admin'],
          lastLoginAt: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }
    }
    invokeMock.mockResolvedValue(response)
    const payload = { username: 'admin', password: 'secret123' }

    const result = await authApi.login(payload)

    expect(invokeMock).toHaveBeenCalledWith('auth:login', payload)
    expect(result).toEqual(response)
  })

  it('throws when response is not in the expected format', async () => {
    invokeMock.mockResolvedValue({ invalid: true })
    await expect(authApi.login({ username: 'admin', password: 'secret123' })).rejects.toThrow(
      'ERR_INVALID_IPC_RESPONSE:auth:login'
    )
  })
})

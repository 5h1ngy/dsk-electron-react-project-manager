const handlers = new Map<string, (...args: any[]) => Promise<unknown>>()

jest.mock('electron', () => ({
  ipcMain: {
    handle: (channel: string, handler: (...args: any[]) => Promise<unknown>) => {
      handlers.set(channel, handler)
    },
    listenerCount: () => 0,
    removeHandler: () => {}
  }
}))

const loginMock = jest.fn()
const registerMock = jest.fn()
const logoutMock = jest.fn()
const sessionMock = jest.fn()
const listUsersMock = jest.fn()
const createUserMock = jest.fn()
const updateUserMock = jest.fn()

jest.mock('../appContext', () => ({
  appContext: {
    authService: {
      login: loginMock,
      register: registerMock,
      logout: logoutMock,
      currentSession: sessionMock,
      listUsers: listUsersMock,
      createUser: createUserMock,
      updateUser: updateUserMock
    }
  }
}))

import { registerAuthIpc } from './auth'
import { AppError } from '../errors/appError'

describe('auth ipc handlers', () => {
  beforeEach(() => {
    handlers.clear()
    loginMock.mockReset()
    registerMock.mockReset()
    logoutMock.mockReset()
    sessionMock.mockReset()
    listUsersMock.mockReset()
    createUserMock.mockReset()
    updateUserMock.mockReset()
  })

  it('registers auth handlers and returns success payloads', async () => {
    loginMock.mockResolvedValue({ token: 't', user: { id: '1' } })
    registerMock.mockResolvedValue({ token: 't', user: { id: '2' } })
    logoutMock.mockResolvedValue(undefined)
    sessionMock.mockResolvedValue(null)
    listUsersMock.mockResolvedValue([])
    createUserMock.mockResolvedValue({ id: '2' })
    updateUserMock.mockResolvedValue({ id: '2' })

    registerAuthIpc()

    await expect(
      handlers.get('auth:login')!(undefined, { username: 'a', password: 'b' })
    ).resolves.toEqual({
      ok: true,
      data: { token: 't', user: { id: '1' } }
    })

    await expect(
      handlers.get('auth:register')!(undefined, { username: 'b', password: 'c' })
    ).resolves.toEqual({
      ok: true,
      data: { token: 't', user: { id: '2' } }
    })

    await handlers.get('auth:logout')!(undefined, 'token')
    expect(logoutMock).toHaveBeenCalledWith('token')

    await expect(handlers.get('auth:list-users')!(undefined, 'token')).resolves.toEqual({
      ok: true,
      data: []
    })
    await expect(handlers.get('auth:create-user')!(undefined, 'token', {})).resolves.toEqual({
      ok: true,
      data: { id: '2' }
    })
  })

  it('formats application errors', async () => {
    loginMock.mockRejectedValue(new AppError('ERR_PERMISSION', 'Denied'))
    registerAuthIpc()

    const result = await handlers.get('auth:login')!(undefined, { username: 'x', password: 'y' })
    expect(result).toEqual({ ok: false, code: 'ERR_PERMISSION', message: 'Denied' })
  })
})

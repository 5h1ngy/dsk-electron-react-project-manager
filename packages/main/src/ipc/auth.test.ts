import type { AuthService } from '../services/auth.service'
import { AppError } from '../config/appError'
import { AuthIpcRegistrar } from './auth'
import { IpcChannelRegistrar } from './utils'

interface HandlerMap {
  handlers: Map<string, (...args: any[]) => Promise<unknown>>
  ipcMock: {
    handle: jest.Mock
    listenerCount: jest.Mock
    removeHandler: jest.Mock
  }
}

const createHandlerRegistry = (): HandlerMap => {
  const handlers = new Map<string, (...args: any[]) => Promise<unknown>>()
  const ipcMock = {
    handle: jest.fn((channel: string, handler: (...args: any[]) => Promise<unknown>) => {
      handlers.set(channel, handler)
    }),
    listenerCount: jest.fn((channel: string) => (handlers.has(channel) ? 1 : 0)),
    removeHandler: jest.fn((channel: string) => {
      handlers.delete(channel)
    })
  }

  return { handlers, ipcMock }
}

describe('AuthIpcRegistrar', () => {
  let registry: HandlerMap
  let loggerMock: { warn: jest.Mock; error: jest.Mock }
  let registrar: IpcChannelRegistrar
  let authService: jest.Mocked<AuthService>

  beforeEach(() => {
    registry = createHandlerRegistry()
    loggerMock = { warn: jest.fn(), error: jest.fn() }
    registrar = new IpcChannelRegistrar({
      ipc: registry.ipcMock as any,
      logger: loggerMock
    })
    authService = {
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      currentSession: jest.fn(),
      listUsers: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn()
    } as unknown as jest.Mocked<AuthService>
  })

  it('registers auth handlers and emits success responses', async () => {
    authService.login.mockResolvedValue({ token: 't' })
    authService.register.mockResolvedValue({ token: 'r' })
    authService.logout.mockResolvedValue(undefined)
    authService.currentSession.mockResolvedValue(null)
    authService.listUsers.mockResolvedValue([])
    authService.createUser.mockResolvedValue({ id: '1' })
    authService.updateUser.mockResolvedValue({ id: '2' })

    const authRegistrar = new AuthIpcRegistrar({ authService, registrar })
    authRegistrar.register()

    const loginResponse = await registry.handlers
      .get('auth:login')!
      ({}, { username: 'a', password: 'b' })
    expect(loginResponse).toEqual({ ok: true, data: { token: 't' } })

    const logoutResponse = await registry.handlers.get('auth:logout')!({}, 'token')
    expect(logoutResponse).toEqual({ ok: true, data: { success: true } })
    expect(authService.logout).toHaveBeenCalledWith('token')
  })

  it('formats application errors', async () => {
    authService.login.mockRejectedValue(new AppError('ERR_PERMISSION', 'Denied'))
    const authRegistrar = new AuthIpcRegistrar({ authService, registrar })
    authRegistrar.register()

    const response = await registry.handlers
      .get('auth:login')!({}, { username: 'x', password: 'y' })
    expect(response).toEqual({
      ok: false,
      code: 'ERR_PERMISSION',
      message: 'Denied'
    })
  })
})

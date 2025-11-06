/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AuthService, SessionPayload, UserDTO } from '@services/services/auth'
import { AppError } from '@services/config/appError'
import { AuthIpcRegistrar } from '@main/ipc/auth'
import { IpcChannelRegistrar } from '@main/ipc/utils'

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

const createUserDto = (overrides: Partial<UserDTO> = {}): UserDTO => ({
  id: overrides.id ?? 'user-1',
  username: overrides.username ?? 'jane.doe',
  displayName: overrides.displayName ?? 'Jane Doe',
  isActive: overrides.isActive ?? true,
  roles: overrides.roles ?? ['Admin'],
  lastLoginAt: overrides.lastLoginAt ?? null,
  createdAt: overrides.createdAt ?? new Date('2024-01-01T09:00:00.000Z'),
  updatedAt: overrides.updatedAt ?? new Date('2024-01-10T09:00:00.000Z')
})

const createSessionPayload = (overrides: Partial<SessionPayload> = {}): SessionPayload => ({
  token: overrides.token ?? 'token-abc',
  user: overrides.user ?? createUserDto()
})

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
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
      resolveActor: jest.fn()
    } as unknown as jest.Mocked<AuthService>
  })

  it('registers auth handlers and emits success responses', async () => {
    const loginPayload = createSessionPayload({ token: 't' })
    const registerPayload = createSessionPayload({ token: 'r' })
    authService.login.mockResolvedValue(loginPayload)
    authService.register.mockResolvedValue(registerPayload)
    authService.logout.mockResolvedValue(undefined)
    authService.currentSession.mockResolvedValue(null)
    authService.listUsers.mockResolvedValue([createUserDto({ id: 'catalog-1' })])
    authService.createUser.mockResolvedValue(createUserDto({ id: '1', username: 'new.user' }))
    authService.updateUser.mockResolvedValue(createUserDto({ id: '2', username: 'updated.user' }))
    authService.deleteUser.mockResolvedValue(undefined)

    const authRegistrar = new AuthIpcRegistrar({ authService, registrar })
    authRegistrar.register()

    const loginResponse = await registry.handlers.get('auth:login')!(
      {},
      { username: 'a', password: 'b' }
    )
    expect(loginResponse).toEqual({ ok: true, data: loginPayload })

    const logoutResponse = await registry.handlers.get('auth:logout')!({}, 'token')
    expect(logoutResponse).toEqual({ ok: true, data: { success: true } })
    expect(authService.logout).toHaveBeenCalledWith('token')

    const deleteResponse = await registry.handlers.get('auth:delete-user')!(
      {},
      'token',
      'target-user'
    )
    expect(deleteResponse).toEqual({ ok: true, data: { success: true } })
    expect(authService.deleteUser).toHaveBeenCalledWith('token', 'target-user')
  })

  it('formats application errors', async () => {
    authService.login.mockRejectedValue(new AppError('ERR_PERMISSION', 'Denied'))
    const authRegistrar = new AuthIpcRegistrar({ authService, registrar })
    authRegistrar.register()

    const response = await registry.handlers.get('auth:login')!(
      {},
      { username: 'x', password: 'y' }
    )
    expect(response).toEqual({
      ok: false,
      code: 'ERR_PERMISSION',
      message: 'Denied'
    })
  })
})


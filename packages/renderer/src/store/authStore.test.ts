import { createAppStore } from './index'

import { login, logout } from './slices/authSlice'

const sessionPayload = {
  ok: true,
  data: {
    token: 'token-123',
    user: {
      id: '1',
      username: 'admin',
      displayName: 'Admin',
      isActive: true,
      roles: ['Admin'] as Array<'Admin'>,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
}

describe('auth slice', () => {
  beforeEach(() => {
    sessionStorage.clear()
    window.api = {
      health: { check: jest.fn() },
      auth: {
        login: jest.fn().mockResolvedValue(sessionPayload),
        logout: jest.fn().mockResolvedValue({ ok: true, data: { success: true } }),
        session: jest.fn().mockResolvedValue({ ok: true, data: sessionPayload.data.user }),
        listUsers: jest.fn().mockResolvedValue({ ok: true, data: [] }),
        createUser: jest.fn(),
        updateUser: jest.fn()
      }
    } as unknown as typeof window.api
  })

  it('stores token and user on login', async () => {
    const store = createAppStore()

    await store.dispatch(login({ username: 'admin', password: 'changeme!' }))

    const state = store.getState().auth
    expect(state.token).toBe('token-123')
    expect(state.currentUser?.username).toBe('admin')
    expect(sessionStorage.getItem('dsk-auth-token')).toBe('token-123')
  })

  it('clears token on logout', async () => {
    const store = createAppStore()

    sessionStorage.setItem('dsk-auth-token', 'token-123')
    store.dispatch({ type: login.fulfilled.type, payload: sessionPayload.data })

    await store.dispatch(logout())

    const state = store.getState().auth
    expect(state.token).toBeNull()
    expect(sessionStorage.getItem('dsk-auth-token')).toBeNull()
  })
})

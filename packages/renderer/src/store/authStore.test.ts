import { act } from '@testing-library/react'
import { useAuthStore } from './authStore'

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

describe('auth store', () => {
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
    }
    useAuthStore.setState({ token: null, currentUser: null, users: [], status: 'idle', error: undefined })
  })

  it('stores token and user on login', async () => {
    await act(async () => {
      const success = await useAuthStore.getState().login({ username: 'admin', password: 'changeme!' })
      expect(success).toBe(true)
    })

    const state = useAuthStore.getState()
    expect(state.token).toBe('token-123')
    expect(state.currentUser?.username).toBe('admin')
    expect(sessionStorage.getItem('dsk-auth-token')).toBe('token-123')
  })

  it('clears token on logout', async () => {
    useAuthStore.setState({ token: 'token-123', currentUser: sessionPayload.data.user, users: [], status: 'idle' })
    sessionStorage.setItem('dsk-auth-token', 'token-123')

    await act(async () => {
      await useAuthStore.getState().logout()
    })

    const state = useAuthStore.getState()
    expect(state.token).toBeNull()
    expect(sessionStorage.getItem('dsk-auth-token')).toBeNull()
  })
})


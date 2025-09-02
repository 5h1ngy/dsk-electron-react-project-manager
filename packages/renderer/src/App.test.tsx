import { render, screen, waitFor } from '@testing-library/react'
import App from './App'
import { useAuthStore } from './store/authStore'

const createHealthResponse = () => ({
  ok: true,
  data: {
    status: 'healthy' as const,
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: 5
  }
})

const sessionUser = {
  id: '1',
  username: 'admin',
  displayName: 'Admin',
  isActive: true,
  roles: ['Admin'] as Array<'Admin'>,
  lastLoginAt: null,
  createdAt: new Date(),
  updatedAt: new Date()
}

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    }))
  })
})

describe('App', () => {
  beforeEach(() => {
    sessionStorage.clear()
    window.api = {
      health: {
        check: jest.fn().mockResolvedValue(createHealthResponse())
      },
      auth: {
        login: jest.fn().mockResolvedValue({ ok: true, data: { token: 'token', user: sessionUser } }),
        logout: jest.fn().mockResolvedValue({ ok: true, data: { success: true } }),
        session: jest.fn().mockResolvedValue({ ok: true, data: null }),
        listUsers: jest.fn().mockResolvedValue({ ok: true, data: [] }),
        createUser: jest.fn().mockResolvedValue({ ok: true, data: { id: 'new-user' } }),
        updateUser: jest.fn().mockResolvedValue({ ok: true, data: { id: 'updated-user' } })
      }
    }
    useAuthStore.setState({ token: null, currentUser: null, users: [], status: 'idle', error: undefined })
  })

  it('renders login view when there is no active session', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Accedi')).toBeInTheDocument()
    })

    expect(document.body.dataset.theme).toBe('light')
    expect(window.api.health.check).toHaveBeenCalled()
  })

  it('renders the shell when session is restored', async () => {
    sessionStorage.setItem('dsk-auth-token', 'token')
    const authMock = window.api.auth as jest.Mocked<typeof window.api.auth>
    authMock.session.mockResolvedValue({ ok: true, data: sessionUser })

    render(<App />)

    await waitFor(() => {
      expect(authMock.session).toHaveBeenCalled()
      expect(screen.getByText('DSK Project Manager')).toBeInTheDocument()
    })

    expect(authMock.listUsers).toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument()
  })
})

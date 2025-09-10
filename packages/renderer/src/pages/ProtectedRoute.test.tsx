import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { ProtectedRoute } from '@renderer/pages/ProtectedRoute'
import { logout, selectCurrentUser, selectIsAuthenticated } from '@renderer/store/slices/auth'
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import { useSessionWatcher } from '@renderer/hooks/useSessionWatcher'
import type { UserDTO } from '@main/services/auth'
import Shell from '@renderer/layout/Shell'

jest.mock('@renderer/hooks/useSessionWatcher', () => ({
  useSessionWatcher: jest.fn()
}))

jest.mock('@renderer/store/hooks', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn()
}))

jest.mock('@renderer/store/slices/auth', () => ({
  logout: jest.fn(),
  selectCurrentUser: jest.fn(),
  selectIsAuthenticated: jest.fn()
}))

const shellMock = jest.fn(({ children, onLogout }: { children: ReactNode; onLogout: () => void }) => (
  <div data-testid="shell">
    <button type="button" onClick={onLogout}>
      trigger-logout
    </button>
    <div data-testid="shell-content">{children}</div>
  </div>
))

jest.mock('@renderer/layout/Shell', () => ({
  __esModule: true,
  default: (props: { children: ReactNode; onLogout: () => void }) => shellMock(props)
}))

describe('ProtectedRoute', () => {
  const mockDispatch = jest.fn()
  const mockUser: UserDTO = {
    id: 'user-1',
    username: 'admin',
    displayName: 'Admin',
    isActive: true,
    roles: ['Admin'],
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const setupSelectors = ({
    isAuthenticated,
    currentUser
  }: {
    isAuthenticated: boolean
    currentUser: UserDTO | null
  }) => {
    ;(useAppSelector as jest.Mock).mockImplementation((selector) => {
      if (selector === selectIsAuthenticated) {
        return isAuthenticated
      }
      if (selector === selectCurrentUser) {
        return currentUser
      }
      return undefined
    })
  }

  const renderWithRouter = () =>
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route index element={<div data-testid="private-content">Private</div>} />
          </Route>
          <Route path="/login" element={<div data-testid="login-screen">Login</div>} />
        </Routes>
      </MemoryRouter>
    )

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAppDispatch as jest.Mock).mockReturnValue(mockDispatch)
    ;(logout as jest.Mock).mockImplementation(() => ({ type: 'auth/logout' }))
    shellMock.mockClear()
  })

  it('redirects to the login route when there is no authenticated user', async () => {
    setupSelectors({ isAuthenticated: false, currentUser: null })

    renderWithRouter()

    expect(await screen.findByTestId('login-screen')).toBeInTheDocument()
    expect(shellMock).not.toHaveBeenCalled()
    expect(useSessionWatcher).toHaveBeenCalled()
  })

  it('renders the shell layout when the user is authenticated', async () => {
    setupSelectors({ isAuthenticated: true, currentUser: mockUser })

    renderWithRouter()

    expect(await screen.findByTestId('shell')).toBeInTheDocument()
    expect(screen.getByTestId('private-content')).toBeInTheDocument()
    expect(shellMock).toHaveBeenCalledWith(
      expect.objectContaining({
        currentUser: mockUser,
        onLogout: expect.any(Function),
        children: expect.anything()
      })
    )
  })

  it('dispatches the logout thunk when the provided handler fires', async () => {
    const logoutAction = { type: 'auth/logout' }
    ;(logout as jest.Mock).mockReturnValue(logoutAction)
    setupSelectors({ isAuthenticated: true, currentUser: mockUser })

    renderWithRouter()
    await userEvent.click(screen.getByRole('button', { name: 'trigger-logout' }))

    expect(logout).toHaveBeenCalledTimes(1)
    expect(mockDispatch).toHaveBeenCalledWith(logoutAction)
  })
})

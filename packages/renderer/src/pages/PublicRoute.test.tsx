import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { PublicRoute } from '@renderer/pages/PublicRoute'
import { selectIsAuthenticated } from '@renderer/store/slices/auth'
import { useAppSelector } from '@renderer/store/hooks'

jest.mock('@renderer/store/hooks', () => ({
  useAppSelector: jest.fn()
}))

jest.mock('@renderer/store/slices/auth', () => ({
  selectIsAuthenticated: jest.fn()
}))

const blankMock = jest.fn(({ children }: { children: ReactNode }) => (
  <div data-testid="blank-layout">{children}</div>
))

jest.mock('@renderer/layout/Blank', () => ({
  __esModule: true,
  default: (props: { children: ReactNode }) => blankMock(props)
}))

describe('PublicRoute', () => {
  const arrangeSelector = (isAuthenticated: boolean) => {
    ;(useAppSelector as jest.Mock).mockImplementation((selector) => {
      if (selector === selectIsAuthenticated) {
        return isAuthenticated
      }
      return undefined
    })
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the blank layout and outlet content when unauthenticated', async () => {
    arrangeSelector(false)

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route element={<PublicRoute redirectTo="/app" />}>
            <Route path="/login" element={<div data-testid="public-content">Login</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByTestId('blank-layout')).toBeInTheDocument()
    expect(screen.getByTestId('public-content')).toBeInTheDocument()
    expect(blankMock).toHaveBeenCalledWith(
      expect.objectContaining({ children: expect.anything() })
    )
  })

  it('navigates to the redirect path when already authenticated', async () => {
    arrangeSelector(true)

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route element={<PublicRoute redirectTo="/app" />}>
            <Route path="/login" element={<div data-testid="login-view">Login</div>} />
          </Route>
          <Route path="/app" element={<div data-testid="app-destination">Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByTestId('app-destination')).toBeInTheDocument()
    expect(blankMock).not.toHaveBeenCalled()
  })
})

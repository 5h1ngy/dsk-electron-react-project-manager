import { useCallback, useMemo, type JSX } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import type { UserDTO } from '@main/auth/authService'
import { AppShell } from './layout/AppShell'
import { LoginPage } from './pages/auth/LoginPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { useAuthStore } from '@renderer/store/authStore'

interface ProtectedLayoutProps {
  isAuthenticated: boolean
  currentUser: UserDTO | null
  onLogout: () => void
}

const ProtectedLayout = ({
  isAuthenticated,
  currentUser,
  onLogout
}: ProtectedLayoutProps): JSX.Element => {
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />
  }

  return (
    <AppShell currentUser={currentUser} onLogout={onLogout}>
      <Outlet />
    </AppShell>
  )
}

export const AppRoutes = (): JSX.Element => {
  const token = useAuthStore((state) => state.token)
  const currentUser = useAuthStore((state) => state.currentUser)
  const logout = useAuthStore((state) => state.logout)

  const isAuthenticated = useMemo(() => Boolean(token && currentUser), [token, currentUser])
  const handleLogout = useCallback(() => logout(), [logout])

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        element={
          <ProtectedLayout
            isAuthenticated={isAuthenticated}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        }
      >
        <Route index element={<DashboardPage />} />
      </Route>
      <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
    </Routes>
  )
}

import { useCallback } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

import { AppShell } from '@renderer/layout/AppShell'
import { useAuthStore } from '@renderer/store/authStore'

export const ProtectedRoute = () => {
  const token = useAuthStore((state) => state.token)
  const currentUser = useAuthStore((state) => state.currentUser)
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = useCallback(() => logout(), [logout])

  return !token || !currentUser ? (
    <Navigate to="/login" replace />
  ) : (
    <AppShell currentUser={currentUser} onLogout={handleLogout}>
      <Outlet />
    </AppShell>
  )
}

import { useCallback } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

import { AppShell } from '@renderer/layout/AppShell'
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import { logout, selectCurrentUser, selectIsAuthenticated } from '@renderer/store/slices/authSlice'

export const ProtectedRoute = () => {
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const currentUser = useAppSelector(selectCurrentUser)

  const handleLogout = useCallback(() => {
    void dispatch(logout())
  }, [dispatch])

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />
  }

  return (
    <AppShell currentUser={currentUser} onLogout={handleLogout}>
      <Outlet />
    </AppShell>
  )
}

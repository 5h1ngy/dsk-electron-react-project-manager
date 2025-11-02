import { useCallback } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

import Shell from '@renderer/layout/Shell'
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import { logout, selectCurrentUser, selectIsAuthenticated } from '@renderer/store/slices/auth'
import { useSessionWatcher } from '@renderer/hooks/useSessionWatcher'

export const ProtectedRoute = () => {
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const currentUser = useAppSelector(selectCurrentUser)

  useSessionWatcher()

  const handleLogout = useCallback(() => {
    void dispatch(logout())
  }, [dispatch])

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />
  }

  return (
    <Shell currentUser={currentUser} onLogout={handleLogout}>
      <Outlet />
    </Shell>
  )
}

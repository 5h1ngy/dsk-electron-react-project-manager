import { Navigate, Outlet } from 'react-router-dom'

import { useAuthStore } from '@renderer/store/authStore'

interface PublicRouteProps {
  redirectTo?: string
}

export const PublicRoute = ({ redirectTo = '/' }: PublicRouteProps) => {
  const token = useAuthStore((state) => state.token)
  const currentUser = useAuthStore((state) => state.currentUser)

  return token && currentUser ? <Navigate to={redirectTo} replace /> : <Outlet />
}

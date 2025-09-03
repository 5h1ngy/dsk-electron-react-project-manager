import { Navigate, Outlet } from 'react-router-dom'

import { useAppSelector } from '@renderer/store/hooks'
import { selectIsAuthenticated } from '@renderer/store/slices/auth'

interface PublicRouteProps {
  redirectTo?: string
}

export const PublicRoute = ({ redirectTo = '/' }: PublicRouteProps) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  return isAuthenticated ? <Navigate to={redirectTo} replace /> : <Outlet />
}

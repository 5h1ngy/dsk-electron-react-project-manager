import { Navigate, Route, Routes } from 'react-router-dom'

import LoginPage from '@renderer/pages/LoginPage'
import DashboardPage from '@renderer/pages/Dashboard'
import { ProtectedRoute } from '@renderer/pages/ProtectedRoute'
import { PublicRoute } from '@renderer/pages/PublicRoute'

export const AppRoutes = () => (
  <Routes>
    <Route element={<PublicRoute redirectTo="/" />}>
      <Route path="/login" element={<LoginPage />} />
    </Route>
    <Route element={<ProtectedRoute />}>
      <Route index element={<DashboardPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)

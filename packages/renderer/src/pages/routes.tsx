import { Navigate, Route, Routes } from 'react-router-dom'

import Login from '@renderer/pages/Login'
import Register from '@renderer/pages/Register'
import DashboardPage from '@renderer/pages/Dashboard'
import ProjectsPage from '@renderer/pages/Projects'
import ProjectDetailsPage from '@renderer/pages/Projects/Details'
import { ProtectedRoute } from '@renderer/pages/ProtectedRoute'
import { PublicRoute } from '@renderer/pages/PublicRoute'

export const AppRoutes = () => (
  <Routes>
    <Route element={<PublicRoute redirectTo="/" />}>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Route>
    <Route element={<ProtectedRoute />}>
      <Route index element={<DashboardPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)

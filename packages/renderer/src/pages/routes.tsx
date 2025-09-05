import { Navigate, Route, Routes } from 'react-router-dom'

import Login from '@renderer/pages/Login'
import Register from '@renderer/pages/Register'
import DashboardPage from '@renderer/pages/Dashboard'
import ProjectsPage from '@renderer/pages/Projects'
import ProjectLayout from '@renderer/pages/Projects/ProjectLayout'
import ProjectOverviewPage from '@renderer/pages/Projects/Overview'
import ProjectTasksPage from '@renderer/pages/Projects/Tasks'
import ProjectBoardPage from '@renderer/pages/Projects/Board'
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
      <Route path="/projects/:projectId" element={<ProjectLayout />}>
        <Route index element={<ProjectOverviewPage />} />
        <Route path="tasks" element={<ProjectTasksPage />} />
        <Route path="board" element={<ProjectBoardPage />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)

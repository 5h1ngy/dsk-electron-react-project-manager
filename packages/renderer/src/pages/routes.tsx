import { Navigate, Route, Routes } from 'react-router-dom'

import Login from '@renderer/pages/Login'
import Register from '@renderer/pages/Register'
import DashboardPage from '@renderer/pages/Dashboard'
import ProjectsPage from '@renderer/pages/Projects'
import ProjectLayout from '@renderer/pages/ProjectLayout'
import ProjectOverviewPage from '@renderer/pages/ProjectOverview'
import ProjectTasksPage from '@renderer/pages/ProjectTasks'
import ProjectNotesPage from '@renderer/pages/ProjectNotes'
import SettingsPage from '@renderer/pages/Settings'
import UserManagementPage from '@renderer/pages/UserManagement'
import RoleManagementPage from '@renderer/pages/RoleManagement'
import DatabasePage from '@renderer/pages/Database'
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
      <Route path="/admin/users" element={<UserManagementPage />} />
      <Route path="/admin/roles" element={<RoleManagementPage />} />
      <Route path="/admin/database" element={<DatabasePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/projects/:projectId" element={<ProjectLayout />}>
        <Route index element={<ProjectOverviewPage />} />
        <Route path="tasks" element={<ProjectTasksPage />} />
        <Route path="notes" element={<ProjectNotesPage />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)

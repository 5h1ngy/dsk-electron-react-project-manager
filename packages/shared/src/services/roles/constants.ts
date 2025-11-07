import { ROLE_NAMES } from '@services/services/auth/constants'

export interface RolePermissionDefinition {
  key: string
  label: string
  description: string
}

export const ROLE_PERMISSION_DEFINITIONS: RolePermissionDefinition[] = [
  {
    key: 'manageUsers',
    label: 'Manage users',
    description: 'Create, update, deactivate and reset accounts for workspace members.'
  },
  {
    key: 'manageRoles',
    label: 'Manage roles',
    description: 'Create roles and adjust permission sets available to workspace users.'
  },
  {
    key: 'manageProjects',
    label: 'Manage projects',
    description: 'Create, update and archive projects and assign members.'
  },
  {
    key: 'manageTasks',
    label: 'Manage tasks',
    description: 'Create, update and delete project tasks and comments.'
  },
  {
    key: 'manageTaskStatuses',
    label: 'Manage task statuses',
    description: 'Configure workflow columns and their ordering inside projects.'
  },
  {
    key: 'manageNotes',
    label: 'Manage notes',
    description: 'Create, update and delete project notes and notebooks.'
  },
  {
    key: 'manageViews',
    label: 'Manage saved views',
    description: 'Create, update and share saved filter sets across the workspace.'
  },
  {
    key: 'viewAnalytics',
    label: 'View analytics',
    description: 'Access dashboards, reports and aggregated workspace metrics.'
  }
]

export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  Admin: ROLE_PERMISSION_DEFINITIONS.map((definition) => definition.key),
  Maintainer: [
    'manageProjects',
    'manageTasks',
    'manageTaskStatuses',
    'manageNotes',
    'manageViews',
    'viewAnalytics'
  ],
  Contributor: ['manageTasks', 'manageNotes', 'manageViews'],
  Viewer: ['viewAnalytics']
}

export const DEFAULT_ROLE_DESCRIPTIONS: Record<string, string> = {
  Admin: 'Full access to all workspace settings, users, roles and projects.',
  Maintainer: 'Manages projects and workflows without access to workspace settings.',
  Contributor: 'Collaborates on tasks and notes across assigned projects.',
  Viewer: 'Read-only access to projects and workspace reports.'
}

export const SYSTEM_ROLE_NAMES = new Set<string>(ROLE_NAMES)

export const isSystemRole = (roleName: string): boolean => SYSTEM_ROLE_NAMES.has(roleName)

export const sanitizePermissions = (permissions: string[]): string[] => {
  const available = new Set(ROLE_PERMISSION_DEFINITIONS.map((definition) => definition.key))
  return Array.from(new Set(permissions.filter((permission) => available.has(permission))))
}

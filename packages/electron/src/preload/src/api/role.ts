import type { RoleSummary } from '@services/services/roles'
import type { CreateRoleInput, UpdateRoleInput } from '@services/services/roles/schemas'
import type { RolePermissionDefinition } from '@services/services/roles/constants'
import { invokeIpc } from '@preload/api/shared'

const CHANNELS = {
  list: 'role:list',
  permissions: 'role:permissions',
  create: 'role:create',
  update: 'role:update',
  remove: 'role:delete',
  syncDefaults: 'role:sync-defaults'
} as const

export const roleApi = {
  list: async (token: string) => await invokeIpc<RoleSummary[]>(CHANNELS.list, token),
  permissions: async (token: string) =>
    await invokeIpc<RolePermissionDefinition[]>(CHANNELS.permissions, token),
  create: async (token: string, payload: CreateRoleInput) =>
    await invokeIpc<RoleSummary>(CHANNELS.create, token, payload),
  update: async (token: string, roleId: string, payload: UpdateRoleInput) =>
    await invokeIpc<RoleSummary>(CHANNELS.update, token, roleId, payload),
  remove: async (token: string, roleId: string) =>
    await invokeIpc<{ success: boolean }>(CHANNELS.remove, token, roleId),
  syncDefaults: async (token: string) =>
    await invokeIpc<RoleSummary[]>(CHANNELS.syncDefaults, token)
}

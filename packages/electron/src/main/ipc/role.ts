import type { AuthService } from '@services/services/auth'
import type { RoleService } from '@services/services/roles'

import { IpcChannelRegistrar } from '@main/ipc/utils'

export interface RoleIpcDependencies {
  authService: AuthService
  roleService: RoleService
  registrar: IpcChannelRegistrar
}

export class RoleIpcRegistrar {
  private readonly authService: AuthService
  private readonly roleService: RoleService
  private readonly registrar: IpcChannelRegistrar

  constructor(dependencies: RoleIpcDependencies) {
    this.authService = dependencies.authService
    this.roleService = dependencies.roleService
    this.registrar = dependencies.registrar
  }

  register(): void {
    this.registrar.register('role:list', async (token: string) => {
      const actor = await this.resolveActor(token)
      return await this.roleService.listRoles(actor)
    })

    this.registrar.register('role:list-permissions', async (token: string) => {
      const actor = await this.resolveActor(token)
      return await this.roleService.listPermissions(actor)
    })

    this.registrar.register('role:create', async (token: string, payload: unknown) => {
      const actor = await this.resolveActor(token)
      return await this.roleService.createRole(actor, payload)
    })

    this.registrar.register(
      'role:update',
      async (token: string, roleId: string, payload: unknown) => {
        const actor = await this.resolveActor(token)
        return await this.roleService.updateRole(actor, roleId, payload)
      }
    )

    this.registrar.register('role:delete', async (token: string, roleId: string) => {
      const actor = await this.resolveActor(token)
      await this.roleService.deleteRole(actor, roleId)
      return { success: true }
    })
  }

  private async resolveActor(token: string) {
    return await this.authService.resolveActor(token, { touch: true })
  }
}

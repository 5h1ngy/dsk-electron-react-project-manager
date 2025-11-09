import { randomUUID } from 'node:crypto'
import { Op, Transaction } from 'sequelize'
import type { Sequelize } from 'sequelize-typescript'

import { Role } from '@services/models/Role'
import { UserRole } from '@services/models/UserRole'
import { AuditService } from '@services/services/audit'
import { AppError, wrapError } from '@services/config/appError'
import type { ServiceActor } from '@services/services/types'
import {
  DEFAULT_ROLE_DESCRIPTIONS,
  DEFAULT_ROLE_PERMISSIONS,
  ROLE_PERMISSION_DEFINITIONS,
  isSystemRole,
  sanitizePermissions
} from '@services/services/roles/constants'
import {
  CreateRoleSchema,
  UpdateRoleSchema,
  type CreateRoleInput,
  type UpdateRoleInput
} from '@services/services/roles/schemas'

export interface RoleSummary {
  id: string
  name: string
  description: string | null
  permissions: string[]
  userCount: number
  isSystemRole: boolean
  createdAt: Date
  updatedAt: Date
}

const requireAdmin = (actor: ServiceActor): void => {
  if (!actor.roles.includes('Admin')) {
    throw new AppError('ERR_PERMISSION', 'Operazione consentita solo agli amministratori')
  }
}

const normalizeName = (name: string): string => name.trim()

const normalizeDescription = (value: CreateRoleInput['description']): string | null => {
  if (typeof value !== 'string') {
    return null
  }
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export class RoleService {
  constructor(
    private readonly sequelize: Sequelize,
    private readonly auditService: AuditService
  ) {}

  async listRoles(actor: ServiceActor): Promise<RoleSummary[]> {
    requireAdmin(actor)
    const roles = await Role.findAll({
      order: [['name', 'ASC']]
    })

    const roleIds = roles.map((role) => role.id)
    const assignments = await UserRole.findAll({
      attributes: ['roleId'],
      where: { roleId: roleIds }
    })
    const counts = assignments.reduce<Record<string, number>>((acc, assignment) => {
      const key = assignment.roleId
      acc[key] = (acc[key] ?? 0) + 1
      return acc
    }, {})

    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description ?? null,
      permissions: Array.isArray(role.permissions) ? role.permissions : [],
      userCount: counts[role.id] ?? 0,
      isSystemRole: isSystemRole(role.name),
      createdAt: role.createdAt!,
      updatedAt: role.updatedAt!
    }))
  }

  async listPermissions(actor: ServiceActor) {
    requireAdmin(actor)
    return ROLE_PERMISSION_DEFINITIONS
  }

  async createRole(actor: ServiceActor, payload: unknown): Promise<RoleSummary> {
    requireAdmin(actor)

    let input: CreateRoleInput
    try {
      input = CreateRoleSchema.parse(payload)
    } catch (error) {
      throw new AppError('ERR_VALIDATION', 'Dati ruolo non validi', { cause: error })
    }

    const name = normalizeName(input.name)
    if (!name) {
      throw new AppError('ERR_VALIDATION', "Il nome del ruolo e' obbligatorio")
    }

    const permissions = sanitizePermissions(input.permissions ?? [])
    const description = normalizeDescription(input.description)

    const existing = await Role.findOne({
      where: { name: { [Op.eq]: name } }
    })

    if (existing) {
      throw new AppError('ERR_CONFLICT', "Esiste gia' un ruolo con lo stesso nome")
    }

    try {
      return await this.sequelize.transaction(async (transaction) => {
        const role = await Role.create(
          {
            id: randomUUID(),
            name,
            description,
            permissions
          },
          { transaction }
        )

        await this.auditService.record(
          actor.userId,
          'role',
          role.id,
          'create',
          {
            name: role.name,
            permissions
          },
          { transaction }
        )

        return {
          id: role.id,
          name: role.name,
          description: role.description ?? null,
          permissions,
          userCount: 0,
          isSystemRole: isSystemRole(role.name),
          createdAt: role.createdAt!,
          updatedAt: role.updatedAt!
        }
      })
    } catch (error) {
      throw wrapError(error)
    }
  }

  async updateRole(actor: ServiceActor, roleId: string, payload: unknown): Promise<RoleSummary> {
    requireAdmin(actor)

    let input: UpdateRoleInput
    try {
      input = UpdateRoleSchema.parse(payload)
    } catch (error) {
      throw new AppError('ERR_VALIDATION', 'Dati ruolo non validi', { cause: error })
    }

    const role = await Role.findByPk(roleId)
    if (!role) {
      throw new AppError('ERR_NOT_FOUND', 'Ruolo non trovato')
    }

    const updates: Partial<Role> = {}
    const systemRole = isSystemRole(role.name)

    if (input.name !== undefined) {
      const normalized = normalizeName(input.name)
      if (!normalized) {
        throw new AppError('ERR_VALIDATION', "Il nome del ruolo e' obbligatorio")
      }
      if (systemRole && normalized !== role.name) {
        throw new AppError('ERR_PERMISSION', "Non e' possibile rinominare un ruolo di sistema")
      }
      if (normalized !== role.name) {
        const conflict = await Role.findOne({
          where: {
            id: { [Op.ne]: role.id },
            name: { [Op.eq]: normalized }
          }
        })
        if (conflict) {
          throw new AppError('ERR_CONFLICT', "Esiste gia' un ruolo con lo stesso nome")
        }
        updates.name = normalized
      }
    }

    if (input.description !== undefined) {
      updates.description = normalizeDescription(input.description)
    }

    if (input.permissions !== undefined) {
      updates.permissions = sanitizePermissions(input.permissions)
    }

    try {
      return await this.sequelize.transaction(async (transaction) => {
        const before = {
          name: role.name,
          description: role.description,
          permissions: Array.isArray(role.permissions) ? [...role.permissions] : []
        }

        if (Object.keys(updates).length > 0) {
          await role.update(updates, { transaction })
        }

        await this.auditService.record(
          actor.userId,
          'role',
          role.id,
          'update',
          {
            before,
            after: {
              name: role.name,
              description: role.description,
              permissions: Array.isArray(role.permissions) ? role.permissions : []
            }
          },
          { transaction }
        )

        const userCount = await UserRole.count({ where: { roleId: role.id }, transaction })

        return {
          id: role.id,
          name: role.name,
          description: role.description ?? null,
          permissions: Array.isArray(role.permissions) ? role.permissions : [],
          userCount,
          isSystemRole: isSystemRole(role.name),
          createdAt: role.createdAt!,
          updatedAt: role.updatedAt!
        }
      })
    } catch (error) {
      throw wrapError(error)
    }
  }
  async deleteRole(actor: ServiceActor, roleId: string): Promise<void> {
    requireAdmin(actor)

    const role = await Role.findByPk(roleId)
    if (!role) {
      return
    }

    if (isSystemRole(role.name)) {
      throw new AppError('ERR_PERMISSION', "Non e' possibile eliminare un ruolo di sistema")
    }

    try {
      await this.sequelize.transaction(async (transaction) => {
        const assignmentCount = await UserRole.count({ where: { roleId }, transaction })
        if (assignmentCount > 0) {
          throw new AppError(
            'ERR_PERMISSION',
            'Impossibile eliminare un ruolo assegnato agli utenti'
          )
        }

        await role.destroy({ transaction })

        await this.auditService.record(
          actor.userId,
          'role',
          role.id,
          'delete',
          {
            name: role.name
          },
          { transaction }
        )
      })
    } catch (error) {
      throw wrapError(error)
    }
  }

  async syncDefaults(actor: ServiceActor): Promise<RoleSummary[]> {
    requireAdmin(actor)
    try {
      await this.ensureDefaults()
      return await this.listRoles(actor)
    } catch (error) {
      throw wrapError(error)
    }
  }

  async ensureDefaults(transaction?: Transaction): Promise<void> {
    const roles = await Role.findAll({ transaction })
    for (const role of roles) {
      const defaultPermissions = DEFAULT_ROLE_PERMISSIONS[role.name] ?? []
      const defaultDescription = DEFAULT_ROLE_DESCRIPTIONS[role.name]
      let mutated = false

      const currentPermissions = Array.isArray(role.permissions) ? role.permissions : []
      const sanitizedPermissions = sanitizePermissions(currentPermissions)

      if (
        sanitizedPermissions.length !== currentPermissions.length ||
        sanitizedPermissions.some((value, index) => value !== currentPermissions[index])
      ) {
        role.permissions = sanitizedPermissions
        mutated = true
      }

      if (role.permissions.length === 0 && defaultPermissions.length > 0) {
        role.permissions = [...defaultPermissions]
        mutated = true
      }

      const normalizedDescription = normalizeDescription(role.description ?? null)
      if (normalizedDescription !== (role.description ?? null)) {
        role.description = normalizedDescription
        mutated = true
      }

      if (!role.description && defaultDescription) {
        role.description = defaultDescription
        mutated = true
      }

      if (mutated) {
        await role.save({ transaction })
      }
    }
  }
}

import { AppError } from '../../config/appError'
import type { ProjectMembershipRole } from '../../models/ProjectMember'
import type { RoleName } from '../auth/constants'
import type { ProjectActor } from './project.types'

const PROJECT_ROLE_WEIGHT: Record<ProjectMembershipRole, number> = {
  view: 0,
  edit: 1,
  admin: 2
}

export const DEFAULT_MEMBER_ROLE: ProjectMembershipRole = 'view'

export const isSystemAdmin = (actor: ProjectActor): boolean => actor.roles.includes('Admin')

export const resolveRoleWeight = (role: ProjectMembershipRole): number =>
  PROJECT_ROLE_WEIGHT[role] ?? 0

export const requireSystemRole = (actor: ProjectActor, allowed: RoleName[]): void => {
  if (!actor.roles.some((role) => allowed.includes(role))) {
    throw new AppError('ERR_PERMISSION', 'Operazione non autorizzata')
  }
}

export const assertProjectRole = (
  actor: ProjectActor,
  membershipRole: ProjectMembershipRole | null,
  required: ProjectMembershipRole
): void => {
  if (isSystemAdmin(actor)) {
    return
  }
  if (!membershipRole) {
    throw new AppError('ERR_PERMISSION', 'Accesso al progetto negato')
  }
  if (resolveRoleWeight(membershipRole) < resolveRoleWeight(required)) {
    throw new AppError('ERR_PERMISSION', 'Permessi insufficienti')
  }
}

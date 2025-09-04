import { randomUUID } from 'node:crypto'
import { UniqueConstraintError, Op } from 'sequelize'
import type { Sequelize, Transaction } from 'sequelize'
import { z } from 'zod'
import type { RoleName } from '../auth/constants'
import { AuditService } from '../audit/auditService'
import { Project } from '../db/models/Project'
import { ProjectMember, type ProjectMembershipRole } from '../db/models/ProjectMember'
import { User } from '../db/models/User'
import { AppError, wrapError } from '../errors/appError'
import {
  createProjectSchema,
  memberRoleSchema,
  updateProjectSchema,
  type CreateProjectInput,
  type UpdateProjectInput
} from './projectValidation'
import type { ServiceActor } from './types'

const PROJECT_ROLE_WEIGHT: Record<ProjectMembershipRole, number> = {
  view: 0,
  edit: 1,
  admin: 2
}

const DEFAULT_MEMBER_ROLE: ProjectMembershipRole = 'view'

const userIdSchema = z
  .string()
  .trim()
  .min(1, 'userId richiesto')
  .max(36, 'userId troppo lungo')

const addMemberSchema = z.object({
  userId: userIdSchema,
  role: memberRoleSchema
})

type AddMemberInput = z.infer<typeof addMemberSchema>

export type ProjectActor = ServiceActor

export interface ProjectSummaryDTO {
  id: string
  key: string
  name: string
  description: string | null
  createdBy: string
  createdAt: Date
  updatedAt: Date
  role: ProjectMembershipRole
  memberCount: number
}

export interface ProjectMemberDTO {
  userId: string
  username: string
  displayName: string
  isActive: boolean
  role: ProjectMembershipRole
  createdAt: Date
}

export interface ProjectDetailsDTO extends ProjectSummaryDTO {
  members: ProjectMemberDTO[]
}

const sanitizeMember = (member: ProjectMember): ProjectMemberDTO => {
  const user = member.user
  if (!user) {
    throw new AppError('ERR_INTERNAL', 'Member user relation missing')
  }
  return {
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
    isActive: user.isActive,
    role: member.role,
    createdAt: member.createdAt
  }
}

const sanitizeProject = (
  project: Project,
  role: ProjectMembershipRole,
  memberCount: number
): ProjectSummaryDTO => ({
  id: project.id,
  key: project.key,
  name: project.name,
  description: project.description ?? null,
  createdBy: project.createdBy,
  createdAt: project.createdAt!,
  updatedAt: project.updatedAt!,
  role,
  memberCount
})

const isSystemAdmin = (actor: ProjectActor): boolean => actor.roles.includes('Admin')

const resolveRoleWeight = (role: ProjectMembershipRole): number => PROJECT_ROLE_WEIGHT[role] ?? 0

const requireSystemRole = (actor: ProjectActor, allowed: RoleName[]): void => {
  if (!actor.roles.some((role) => allowed.includes(role))) {
    throw new AppError('ERR_PERMISSION', 'Operazione non autorizzata')
  }
}

export class ProjectService {
  constructor(
    private readonly sequelize: Sequelize,
    private readonly auditService: AuditService
  ) {}

  private async withTransaction<T>(handler: (tx: Transaction) => Promise<T>): Promise<T> {
    const transaction = await this.sequelize.transaction()
    try {
      const result = await handler(transaction)
      await transaction.commit()
      return result
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  private async loadMembership(
    projectId: string,
    userId: string,
    transaction?: Transaction
  ): Promise<ProjectMember | null> {
    return await ProjectMember.findOne({
      where: { projectId, userId },
      transaction
    })
  }

  private async getProjectOrFail(projectId: string, transaction?: Transaction): Promise<Project> {
    const project = await Project.findByPk(projectId, {
      transaction
    })
    if (!project) {
      throw new AppError('ERR_NOT_FOUND', 'Progetto non trovato')
    }
    return project
  }

  private assertProjectRole(
    actor: ProjectActor,
    membershipRole: ProjectMembershipRole | null,
    minimumRole: ProjectMembershipRole
  ): void {
    if (isSystemAdmin(actor)) {
      return
    }

    if (!membershipRole) {
      throw new AppError('ERR_PERMISSION', 'Accesso al progetto negato')
    }

    if (resolveRoleWeight(membershipRole) < resolveRoleWeight(minimumRole)) {
      throw new AppError('ERR_PERMISSION', 'Permessi insufficienti per questa operazione')
    }
  }

  private resolveActorProjectRole(
    actor: ProjectActor,
    membershipRole: ProjectMembershipRole | null
  ): ProjectMembershipRole {
    if (isSystemAdmin(actor)) {
      return 'admin'
    }
    return membershipRole ?? DEFAULT_MEMBER_ROLE
  }

  async listProjects(actor: ProjectActor): Promise<ProjectSummaryDTO[]> {
    try {
      if (isSystemAdmin(actor)) {
        const projects = await Project.findAll({
          include: [
            {
              model: ProjectMember,
              required: false
            }
          ],
          order: [['createdAt', 'ASC']]
        })

        return projects.map((project) => {
          const membership =
            project.members?.find((member) => member.userId === actor.userId) ?? null
          const memberCount = project.members?.length ?? 0
          const role = this.resolveActorProjectRole(actor, membership?.role ?? null)
          return sanitizeProject(project, role, memberCount)
        })
      }

      const membershipRows = await ProjectMember.findAll({
        where: { userId: actor.userId },
        attributes: ['projectId', 'role']
      })

      if (membershipRows.length === 0) {
        return []
      }

      const projectIds = membershipRows.map((row) => row.projectId)

      const projects = await Project.findAll({
        where: { id: { [Op.in]: projectIds } },
        include: [
          {
            model: ProjectMember,
            required: false
          }
        ],
        order: [['createdAt', 'ASC']]
      })

      return projects.map((project) => {
        const membership =
          project.members?.find((member) => member.userId === actor.userId) ?? null
        if (!membership) {
          throw new AppError('ERR_INTERNAL', 'Permessi progetto non disponibili')
        }
        const memberCount = project.members?.length ?? 0
        return sanitizeProject(project, membership.role, memberCount)
      })
    } catch (error) {
      throw wrapError(error)
    }
  }

  async getProject(actor: ProjectActor, projectId: string): Promise<ProjectDetailsDTO> {
    try {
      const project = await Project.findByPk(projectId, {
        include: [
          {
            model: ProjectMember,
            include: [User]
          }
        ]
      })

      if (!project) {
        throw new AppError('ERR_NOT_FOUND', 'Progetto non trovato')
      }

      const membership = project.members?.find((member) => member.userId === actor.userId) ?? null
      this.assertProjectRole(actor, membership?.role ?? null, 'view')

      const role = this.resolveActorProjectRole(actor, membership?.role ?? null)
      const members = (project.members ?? []).map(sanitizeMember)

      return {
        ...sanitizeProject(project, role, members.length),
        members
      }
    } catch (error) {
      throw wrapError(error)
    }
  }

  async createProject(actor: ProjectActor, payload: unknown): Promise<ProjectDetailsDTO> {
    let input: CreateProjectInput
    try {
      input = createProjectSchema.parse(payload)
    } catch (error) {
      throw new AppError('ERR_VALIDATION', 'Dati progetto non validi', { cause: error })
    }

    requireSystemRole(actor, ['Admin', 'Maintainer'])

    try {
      const project = await this.withTransaction(async (transaction) => {
        const created = await Project.create(
          {
            id: randomUUID(),
            key: input.key,
            name: input.name,
            description: input.description ?? null,
            createdBy: actor.userId
          },
          { transaction }
        )

        await ProjectMember.create(
          {
            projectId: created.id,
            userId: actor.userId,
            role: 'admin',
            createdAt: new Date()
          },
          { transaction }
        )

        return created
      })

      await this.auditService.record(actor.userId, 'project', project.id, 'create', {
        key: project.key,
        name: project.name
      })

      return await this.getProject(actor, project.id)
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new AppError('ERR_CONFLICT', 'Esiste già un progetto con la stessa key', {
          cause: error
        })
      }
      throw wrapError(error)
    }
  }

  async updateProject(
    actor: ProjectActor,
    projectId: string,
    payload: unknown
  ): Promise<ProjectDetailsDTO> {
    let input: UpdateProjectInput
    try {
      input = updateProjectSchema.parse(payload)
    } catch (error) {
      throw new AppError('ERR_VALIDATION', 'Modifiche progetto non valide', { cause: error })
    }

    try {
      const membership = await this.loadMembership(projectId, actor.userId)
      this.assertProjectRole(actor, membership?.role ?? null, 'admin')

      const project = await this.getProjectOrFail(projectId)
      Object.assign(project, input)
      await project.save()

      await this.auditService.record(actor.userId, 'project', projectId, 'update', input)

      return await this.getProject(actor, projectId)
    } catch (error) {
      throw wrapError(error)
    }
  }

  async deleteProject(actor: ProjectActor, projectId: string): Promise<void> {
    try {
      const membership = await this.loadMembership(projectId, actor.userId)
      this.assertProjectRole(actor, membership?.role ?? null, 'admin')

      await this.withTransaction(async (transaction) => {
        const project = await this.getProjectOrFail(projectId, transaction)
        await project.destroy({ transaction })
      })

      await this.auditService.record(actor.userId, 'project', projectId, 'delete', null)
    } catch (error) {
      throw wrapError(error)
    }
  }

  async addOrUpdateMember(
    actor: ProjectActor,
    projectId: string,
    payload: unknown
  ): Promise<ProjectDetailsDTO> {
    let input: AddMemberInput
    try {
      input = addMemberSchema.parse(payload)
    } catch (error) {
      throw new AppError('ERR_VALIDATION', 'Dati membro non validi', { cause: error })
    }

    try {
      const membership = await this.loadMembership(projectId, actor.userId)
      this.assertProjectRole(actor, membership?.role ?? null, 'admin')

      const targetUser = await User.findByPk(input.userId)
      if (!targetUser) {
        throw new AppError('ERR_NOT_FOUND', 'Utente non trovato')
      }

      await this.withTransaction(async (transaction) => {
        await this.getProjectOrFail(projectId, transaction)

        const [member, created] = await ProjectMember.findOrCreate({
          where: { projectId, userId: input.userId },
          defaults: {
            projectId,
            userId: input.userId,
            role: input.role,
            createdAt: new Date()
          },
          transaction
        })

        if (!created) {
          member.role = input.role
          await member.save({ transaction })
        }
      })

      await this.auditService.record(actor.userId, 'project', projectId, 'member_upsert', {
        targetUserId: input.userId,
        role: input.role
      })

      return await this.getProject(actor, projectId)
    } catch (error) {
      throw wrapError(error)
    }
  }
  async removeMember(actor: ProjectActor, projectId: string, userId: string): Promise<ProjectDetailsDTO> {
    try {
      const membership = await this.loadMembership(projectId, actor.userId)
      this.assertProjectRole(actor, membership?.role ?? null, 'admin')

      let removedRole: ProjectMembershipRole | null = null

      await this.withTransaction(async (transaction) => {
        const project = await this.getProjectOrFail(projectId, transaction)

        if (project.createdBy === userId) {
          throw new AppError('ERR_PERMISSION', 'Non e possibile rimuovere il creatore del progetto')
        }

        const member = await ProjectMember.findOne({
          where: { projectId, userId },
          transaction
        })

        if (!member) {
          throw new AppError('ERR_NOT_FOUND', 'Membro del progetto non trovato')
        }

        if (member.role === 'admin') {
          const adminCount = await ProjectMember.count({
            where: { projectId, role: 'admin' },
            transaction
          })

          if (adminCount <= 1) {
            throw new AppError(
              'ERR_PERMISSION',
              'Il progetto deve avere almeno un membro con ruolo admin'
            )
          }
        }

        removedRole = member.role
        await member.destroy({ transaction })
      })

      await this.auditService.record(actor.userId, 'project', projectId, 'member_remove', {
        targetUserId: userId,
        role: removedRole
      })

      return await this.getProject(actor, projectId)
    } catch (error) {
      throw wrapError(error)
    }
  }
}


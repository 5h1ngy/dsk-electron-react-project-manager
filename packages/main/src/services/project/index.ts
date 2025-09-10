import { randomUUID } from 'node:crypto'
import { UniqueConstraintError, Op } from 'sequelize'
import type { Sequelize, Transaction } from 'sequelize'
import { z } from 'zod'
import type { RoleName } from '../auth/constants'
import { AuditService } from '../audit'
import { Project } from '../../models/Project'
import { ProjectMember, type ProjectMembershipRole } from '../../models/ProjectMember'
import { ProjectTag } from '../../models/ProjectTag'
import { User } from '../../models/User'
import { AppError, wrapError } from '../../config/appError'
import {
  createProjectSchema,
  memberRoleSchema,
  updateProjectSchema,
  type CreateProjectInput,
  type UpdateProjectInput
} from './schemas'
import type { ProjectActor, ProjectDetailsDTO, ProjectMemberDTO, ProjectSummaryDTO } from './types'
import {
  DEFAULT_MEMBER_ROLE,
  assertProjectRole,
  isSystemAdmin,
  requireSystemRole
} from './roles'
import { mapProjectDetails, mapProjectSummary } from './helpers'

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

  private resolveActorProjectRole(
    actor: ProjectActor,
    membershipRole: ProjectMembershipRole | null
  ): ProjectMembershipRole {
    if (isSystemAdmin(actor)) {
      return 'admin'
    }
    return membershipRole ?? DEFAULT_MEMBER_ROLE
  }

  private async syncProjectTags(
    projectId: string,
    tags: string[],
    transaction: Transaction
  ): Promise<void> {
    const normalized = Array.from(
      new Set(
        tags
          .map((tag) => tag.trim().toLowerCase())
          .filter((tag) => tag.length > 0)
          .slice(0, 20)
      )
    )

    const existing = await ProjectTag.findAll({ where: { projectId }, transaction })
    const existingSet = new Set(existing.map((tag) => tag.tag))
    const targetSet = new Set(normalized)

    const toRemove = existing.filter((tag) => !targetSet.has(tag.tag))
    const toAdd = normalized.filter((tag) => !existingSet.has(tag))

    if (toRemove.length > 0) {
      await ProjectTag.destroy({
        where: {
          id: toRemove.map((tag) => tag.id)
        },
        transaction
      })
    }

    for (const tag of toAdd) {
      await ProjectTag.create(
        {
          id: randomUUID(),
          projectId,
          tag
        },
        { transaction }
      )
    }
  }

  async listProjects(actor: ProjectActor): Promise<ProjectSummaryDTO[]> {
    try {
      if (isSystemAdmin(actor)) {
        const projects = await Project.findAll({
          include: [
            {
              model: ProjectMember,
              required: false
            },
            {
              model: ProjectTag,
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
          return mapProjectSummary(project, role, memberCount)
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
          },
          {
            model: ProjectTag,
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
        return mapProjectSummary(project, membership.role, memberCount)
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
        },
        {
          model: ProjectTag
        }
      ]
    })

      if (!project) {
        throw new AppError('ERR_NOT_FOUND', 'Progetto non trovato')
      }

      const membership = project.members?.find((member) => member.userId === actor.userId) ?? null
      assertProjectRole(actor, membership?.role ?? null, 'view')

      const role = this.resolveActorProjectRole(actor, membership?.role ?? null)
      const members = project.members ?? []
      return mapProjectDetails(project, role, members.length, members)
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

        await this.syncProjectTags(created.id, input.tags ?? [], transaction)

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
      assertProjectRole(actor, membership?.role ?? null, 'admin')

      await this.withTransaction(async (transaction) => {
        const project = await this.getProjectOrFail(projectId, transaction)
        Object.assign(project, input)
        await project.save({ transaction })

        if (input.tags) {
          await this.syncProjectTags(projectId, input.tags, transaction)
        }
      })

      await this.auditService.record(actor.userId, 'project', projectId, 'update', input)

      return await this.getProject(actor, projectId)
    } catch (error) {
      throw wrapError(error)
    }
  }

  async deleteProject(actor: ProjectActor, projectId: string): Promise<void> {
    try {
      const membership = await this.loadMembership(projectId, actor.userId)
      assertProjectRole(actor, membership?.role ?? null, 'admin')

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
      assertProjectRole(actor, membership?.role ?? null, 'admin')

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
      assertProjectRole(actor, membership?.role ?? null, 'admin')

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



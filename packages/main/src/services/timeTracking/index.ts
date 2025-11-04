import { randomUUID } from 'node:crypto'
import { Op, type Sequelize, type Transaction } from 'sequelize'

import { AuditService } from '@main/services/audit'
import { TimeEntry } from '@main/models/TimeEntry'
import { Task } from '@main/models/Task'
import { Project } from '@main/models/Project'
import { ProjectMember, type ProjectMembershipRole } from '@main/models/ProjectMember'
import { User } from '@main/models/User'
import {
  createTimeEntrySchema,
  updateTimeEntrySchema,
  projectTimeSummarySchema,
  type CreateTimeEntryInput,
  type UpdateTimeEntryInput,
  type ProjectTimeSummaryInput
} from '@main/services/timeTracking/schemas'
import type { ProjectTimeSummaryDTO, TimeEntryDTO } from '@main/services/timeTracking/types'
import type { ServiceActor } from '@main/services/types'
import { AppError, wrapError } from '@main/config/appError'
import { mapUserSummary } from '@main/services/task/helpers'
import { isSystemAdmin, resolveRoleWeight } from '@main/services/project/roles'

export class TimeTrackingService {
  constructor(
    private readonly sequelize: Sequelize,
    private readonly auditService: AuditService
  ) {}

  async logEntry(actor: ServiceActor, payload: unknown): Promise<TimeEntryDTO> {
    let input: CreateTimeEntryInput
    try {
      input = createTimeEntrySchema.parse(payload)
    } catch (error) {
      throw new AppError('ERR_VALIDATION', 'Dati tempo non validi', { cause: error })
    }

    try {
      const task = await this.loadTask(input.taskId)
      await this.resolveProjectAccess(actor, task.projectId, 'edit')

      const entry = await this.withTransaction(async (transaction) =>
        TimeEntry.create(
          {
            id: randomUUID(),
            projectId: task.projectId,
            taskId: task.id,
            userId: actor.userId,
            entryDate: input.entryDate,
            durationMinutes: input.durationMinutes,
            description: input.description ?? null
          },
          { transaction }
        )
      )

      await this.auditService.record(actor.userId, 'timeEntry', entry.id, 'create', {
        taskId: entry.taskId,
        projectId: entry.projectId,
        durationMinutes: entry.durationMinutes,
        entryDate: entry.entryDate
      })

      const reloaded = await TimeEntry.findByPk(entry.id, {
        include: [
          {
            model: Task,
            attributes: ['id', 'key', 'title']
          },
          {
            model: User,
            attributes: ['id', 'username', 'displayName']
          }
        ]
      })

      if (!reloaded) {
        throw new AppError('ERR_INTERNAL', 'Voce tempo non reperibile')
      }

      return this.mapTimeEntry(reloaded)
    } catch (error) {
      throw wrapError(error)
    }
  }

  async updateEntry(actor: ServiceActor, entryId: string, payload: unknown): Promise<TimeEntryDTO> {
    let input: UpdateTimeEntryInput
    try {
      input = updateTimeEntrySchema.parse(payload)
    } catch (error) {
      throw new AppError('ERR_VALIDATION', 'Modifiche tempo non valide', { cause: error })
    }

    try {
      const entry = await TimeEntry.findByPk(entryId)
      if (!entry) {
        throw new AppError('ERR_NOT_FOUND', 'Voce tempo non trovata')
      }

      const task = await this.loadTask(entry.taskId)
      await this.resolveProjectAccess(actor, task.projectId, 'edit')

      await this.withTransaction(async (transaction) => {
        if (input.entryDate !== undefined) {
          entry.entryDate = input.entryDate
        }
        if (input.durationMinutes !== undefined) {
          entry.durationMinutes = input.durationMinutes
        }
        if (input.description !== undefined) {
          entry.description = input.description ?? null
        }

        await entry.save({ transaction })
      })

      await this.auditService.record(actor.userId, 'timeEntry', entry.id, 'update', input)

      const reloaded = await TimeEntry.findByPk(entry.id, {
        include: [
          {
            model: Task,
            attributes: ['id', 'key', 'title']
          },
          {
            model: User,
            attributes: ['id', 'username', 'displayName']
          }
        ]
      })

      if (!reloaded) {
        throw new AppError('ERR_INTERNAL', 'Voce tempo non reperibile')
      }

      return this.mapTimeEntry(reloaded)
    } catch (error) {
      throw wrapError(error)
    }
  }

  async deleteEntry(actor: ServiceActor, entryId: string): Promise<void> {
    try {
      const entry = await TimeEntry.findByPk(entryId)
      if (!entry) {
        throw new AppError('ERR_NOT_FOUND', 'Voce tempo non trovata')
      }

      const task = await this.loadTask(entry.taskId)
      await this.resolveProjectAccess(actor, task.projectId, 'edit')

      await this.withTransaction(async (transaction) => {
        await entry.destroy({ transaction })
      })

      await this.auditService.record(actor.userId, 'timeEntry', entry.id, 'delete', null)
    } catch (error) {
      throw wrapError(error)
    }
  }

  async getProjectSummary(actor: ServiceActor, payload: unknown): Promise<ProjectTimeSummaryDTO> {
    let input: ProjectTimeSummaryInput
    try {
      input = projectTimeSummarySchema.parse(payload)
    } catch (error) {
      throw new AppError('ERR_VALIDATION', 'Filtri tempo non validi', { cause: error })
    }

    try {
      const { project } = await this.resolveProjectAccess(actor, input.projectId, 'view')

      const where: Record<string, unknown> = {
        projectId: project.id
      }

      if (input.from || input.to) {
        where.entryDate = {
          ...(input.from ? { [Op.gte]: input.from } : {}),
          ...(input.to ? { [Op.lte]: input.to } : {})
        }
      }

      if (input.userIds?.length) {
        where.userId = { [Op.in]: input.userIds }
      }

      if (input.taskIds?.length) {
        where.taskId = { [Op.in]: input.taskIds }
      }

      const entries = await TimeEntry.findAll({
        where,
        include: [
          {
            model: Task,
            attributes: ['id', 'key', 'title']
          },
          {
            model: User,
            attributes: ['id', 'username', 'displayName']
          }
        ],
        order: [
          ['entryDate', 'DESC'],
          ['createdAt', 'DESC']
        ]
      })

      let totalMinutes = 0
      const byUser = new Map<string, { user: TimeEntryDTO['user']; minutes: number }>()
      const byTask = new Map<
        string,
        { taskId: string; taskKey: string; taskTitle: string; minutes: number }
      >()
      const byDate = new Map<string, number>()
      const entryDtos: TimeEntryDTO[] = []

      entries.forEach((entry) => {
        const dto = this.mapTimeEntry(entry)
        entryDtos.push(dto)
        totalMinutes += dto.durationMinutes

        const userKey = dto.user.id
        const userAggregate = byUser.get(userKey) ?? { user: dto.user, minutes: 0 }
        userAggregate.minutes += dto.durationMinutes
        byUser.set(userKey, userAggregate)

        const taskAggregate = byTask.get(dto.taskId) ?? {
          taskId: dto.taskId,
          taskKey: dto.taskKey,
          taskTitle: dto.taskTitle,
          minutes: 0
        }
        taskAggregate.minutes += dto.durationMinutes
        byTask.set(dto.taskId, taskAggregate)

        byDate.set(dto.entryDate, (byDate.get(dto.entryDate) ?? 0) + dto.durationMinutes)
      })

      const dateValues = Array.from(byDate.keys())
      const computedRange = {
        from:
          input.from ??
          (dateValues.length ? dateValues.reduce((min, date) => (date < min ? date : min)) : null),
        to:
          input.to ??
          (dateValues.length ? dateValues.reduce((max, date) => (date > max ? date : max)) : null)
      }

      const summary: ProjectTimeSummaryDTO = {
        projectId: project.id,
        range: computedRange,
        totalMinutes,
        byUser: Array.from(byUser.values())
          .map((item) => ({
            user: item.user,
            minutes: item.minutes
          }))
          .sort((a, b) => b.minutes - a.minutes),
        byTask: Array.from(byTask.values()).sort((a, b) => b.minutes - a.minutes),
        byDate: Array.from(byDate.entries())
          .map(([date, minutes]) => ({ date, minutes }))
          .sort((a, b) => a.date.localeCompare(b.date)),
        entries: entryDtos
      }

      return summary
    } catch (error) {
      throw wrapError(error)
    }
  }

  private async loadTask(taskId: string, transaction?: Transaction): Promise<Task> {
    const task = await Task.findByPk(taskId, { transaction })
    if (!task) {
      throw new AppError('ERR_NOT_FOUND', 'Task non trovato')
    }
    return task
  }

  private mapTimeEntry(entry: TimeEntry & { task?: Task; user?: User }): TimeEntryDTO {
    const task = entry.task
    if (!task) {
      throw new AppError('ERR_INTERNAL', 'Relazione task non disponibile')
    }

    const user = mapUserSummary(entry.user ?? null)
    if (!user) {
      throw new AppError('ERR_INTERNAL', 'Relazione utente non disponibile')
    }

    return {
      id: entry.id,
      projectId: entry.projectId,
      taskId: entry.taskId,
      taskKey: task.key,
      taskTitle: task.title,
      entryDate: entry.entryDate,
      durationMinutes: entry.durationMinutes,
      description: entry.description ?? null,
      user,
      createdAt: entry.createdAt ?? new Date(),
      updatedAt: entry.updatedAt ?? new Date()
    }
  }

  private async resolveProjectAccess(
    actor: ServiceActor,
    projectId: string,
    minimumRole: ProjectMembershipRole,
    transaction?: Transaction
  ): Promise<{ project: Project; role: ProjectMembershipRole }> {
    const project = await Project.findByPk(projectId, { transaction })
    if (!project) {
      throw new AppError('ERR_NOT_FOUND', 'Progetto non trovato')
    }

    if (isSystemAdmin(actor)) {
      return { project, role: 'admin' }
    }

    const membership = await ProjectMember.findOne({
      where: { projectId, userId: actor.userId },
      transaction
    })

    if (!membership) {
      throw new AppError('ERR_PERMISSION', 'Accesso al progetto negato')
    }

    if (resolveRoleWeight(membership.role) < resolveRoleWeight(minimumRole)) {
      throw new AppError('ERR_PERMISSION', 'Permessi insufficienti per questa operazione')
    }

    return { project, role: membership.role }
  }

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
}

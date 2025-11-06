import { randomUUID } from 'node:crypto'
import { Op, fn, type Sequelize, type Transaction } from 'sequelize'

import { AuditService } from '@main/services/audit'
import { Sprint } from '@main/models/Sprint'
import { Project } from '@main/models/Project'
import { ProjectMember, type ProjectMembershipRole } from '@main/models/ProjectMember'
import { Task } from '@main/models/Task'
import { Comment } from '@main/models/Comment'
import { User } from '@main/models/User'
import { Note } from '@main/models/Note'
import {
  createSprintSchema,
  updateSprintSchema,
  type CreateSprintInput,
  type UpdateSprintInput
} from '@main/services/sprint/schemas'
import type { SprintDTO, SprintDetailsDTO, SprintMetricsDTO } from '@main/services/sprint/types'
import type { ServiceActor } from '@main/services/types'
import { AppError, wrapError } from '@main/config/appError'
import { mapSprintSummary, mapTaskDetails } from '@main/services/task/helpers'
import { isSystemAdmin, resolveRoleWeight } from '@main/services/project/roles'

export class SprintService {
  constructor(
    private readonly sequelize: Sequelize,
    private readonly auditService: AuditService
  ) {}

  async listByProject(actor: ServiceActor, projectId: string): Promise<SprintDTO[]> {
    try {
      const { project } = await this.resolveProjectAccess(actor, projectId, 'view')

      const sprints = await Sprint.findAll({
        where: { projectId: project.id },
        order: [
          ['sequence', 'ASC'],
          ['startDate', 'ASC'],
          ['createdAt', 'ASC']
        ]
      })

      if (!sprints.length) {
        return []
      }

      const sprintIds = sprints.map((sprint) => sprint.id)

      const tasks = await Task.findAll({
        attributes: ['id', 'sprintId', 'status', 'estimatedMinutes'],
        where: {
          projectId: project.id,
          sprintId: { [Op.in]: sprintIds }
        }
      })

      const tasksBySprint = new Map<string, Task[]>()
      tasks.forEach((task) => {
        if (!task.sprintId) {
          return
        }
        const list = tasksBySprint.get(task.sprintId) ?? []
        list.push(task)
        tasksBySprint.set(task.sprintId, list)
      })

      return sprints.map((sprint) => {
        const summary = mapSprintSummary(sprint)
        if (!summary) {
          throw new AppError('ERR_INTERNAL', 'Impossibile mappare i dati sprint')
        }
        const sprintTasks = tasksBySprint.get(sprint.id) ?? []
        const metrics = this.buildMetrics(sprintTasks)
        return {
          ...summary,
          metrics
        }
      })
    } catch (error) {
      throw wrapError(error)
    }
  }

  async getSprint(actor: ServiceActor, sprintId: string): Promise<SprintDetailsDTO> {
    try {
      const sprint = await Sprint.findByPk(sprintId)
      if (!sprint) {
        throw new AppError('ERR_NOT_FOUND', 'Sprint non trovato')
      }

      const { project } = await this.resolveProjectAccess(actor, sprint.projectId, 'view')

      const tasks = await Task.findAll({
        where: { sprintId: sprint.id },
        include: [
          { model: User, as: 'assignee' },
          { model: User, as: 'owner' },
          { model: Sprint, as: 'sprint', required: false },
          {
            model: Note,
            through: { attributes: [] },
            required: false
          }
        ],
        order: [
          ['status', 'ASC'],
          ['createdAt', 'ASC']
        ]
      })

      const taskIds = tasks.map((task) => task.id)
      const commentCounts = await this.loadCommentCounts(taskIds)

      const summary = mapSprintSummary(sprint)
      if (!summary) {
        throw new AppError('ERR_INTERNAL', 'Impossibile mappare i dati sprint')
      }

      const metrics = this.buildMetrics(tasks.map((task) => task as Task))

      const taskDtos = tasks.map((task) =>
        mapTaskDetails(task, project.key, commentCounts.get(task.id) ?? 0)
      )

      return {
        ...summary,
        metrics,
        tasks: taskDtos
      }
    } catch (error) {
      throw wrapError(error)
    }
  }

  async createSprint(actor: ServiceActor, payload: unknown): Promise<SprintDTO> {
    let input: CreateSprintInput
    try {
      input = createSprintSchema.parse(payload)
    } catch (error) {
      throw new AppError('ERR_VALIDATION', 'Dati sprint non validi', { cause: error })
    }

    try {
      const { project } = await this.resolveProjectAccess(actor, input.projectId, 'edit')

      const sprint = await this.withTransaction(async (transaction) => {
        const sequence =
          input.sequence ??
          (Number(
            await Sprint.max('sequence', { where: { projectId: project.id }, transaction })
          ) || 0) + 1

        return await Sprint.create(
          {
            id: randomUUID(),
            projectId: project.id,
            name: input.name,
            goal: input.goal ?? null,
            startDate: input.startDate,
            endDate: input.endDate,
            status: input.status ?? 'planned',
            capacityMinutes: input.capacityMinutes ?? null,
            sequence
          },
          { transaction }
        )
      })

      await this.auditService.record(actor.userId, 'sprint', sprint.id, 'create', {
        projectId: sprint.projectId,
        name: sprint.name,
        status: sprint.status
      })

      const summary = mapSprintSummary(sprint)
      if (!summary) {
        throw new AppError('ERR_INTERNAL', 'Impossibile mappare i dati sprint')
      }

      return {
        ...summary,
        metrics: this.buildMetrics([])
      }
    } catch (error) {
      throw wrapError(error)
    }
  }

  async updateSprint(actor: ServiceActor, sprintId: string, payload: unknown): Promise<SprintDTO> {
    let input: UpdateSprintInput
    try {
      input = updateSprintSchema.parse(payload)
    } catch (error) {
      throw new AppError('ERR_VALIDATION', 'Modifiche sprint non valide', { cause: error })
    }

    try {
      const sprint = await Sprint.findByPk(sprintId)
      if (!sprint) {
        throw new AppError('ERR_NOT_FOUND', 'Sprint non trovato')
      }

      await this.resolveProjectAccess(actor, sprint.projectId, 'edit')

      await this.withTransaction(async (transaction) => {
        const nextStart = input.startDate ?? sprint.startDate
        const nextEnd = input.endDate ?? sprint.endDate
        if (Date.parse(`${nextStart}T00:00:00Z`) > Date.parse(`${nextEnd}T00:00:00Z`)) {
          throw new AppError(
            'ERR_VALIDATION',
            'La data di fine deve essere successiva o uguale alla data di inizio'
          )
        }

        if (input.name !== undefined) {
          sprint.name = input.name
        }
        if (input.goal !== undefined) {
          sprint.goal = input.goal ?? null
        }
        if (input.startDate !== undefined) {
          sprint.startDate = input.startDate
        }
        if (input.endDate !== undefined) {
          sprint.endDate = input.endDate
        }
        if (input.status !== undefined) {
          sprint.status = input.status
        }
        if (input.capacityMinutes !== undefined) {
          sprint.capacityMinutes = input.capacityMinutes ?? null
        }
        if (input.sequence !== undefined) {
          sprint.sequence = input.sequence
        }

        await sprint.save({ transaction })
      })

      await this.auditService.record(actor.userId, 'sprint', sprint.id, 'update', input)

      const tasks = await Task.findAll({
        attributes: ['id', 'sprintId', 'status', 'estimatedMinutes'],
        where: { sprintId: sprint.id }
      })

      const summary = mapSprintSummary(sprint)
      if (!summary) {
        throw new AppError('ERR_INTERNAL', 'Impossibile mappare i dati sprint')
      }

      return {
        ...summary,
        metrics: this.buildMetrics(tasks)
      }
    } catch (error) {
      throw wrapError(error)
    }
  }

  async deleteSprint(actor: ServiceActor, sprintId: string): Promise<void> {
    try {
      const sprint = await Sprint.findByPk(sprintId)
      if (!sprint) {
        throw new AppError('ERR_NOT_FOUND', 'Sprint non trovato')
      }

      await this.resolveProjectAccess(actor, sprint.projectId, 'edit')

      await this.withTransaction(async (transaction) => {
        await Task.update(
          { sprintId: null },
          {
            where: { sprintId: sprint.id },
            transaction
          }
        )
        await sprint.destroy({ transaction })
      })

      await this.auditService.record(actor.userId, 'sprint', sprint.id, 'delete', null)
    } catch (error) {
      throw wrapError(error)
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

  private async loadCommentCounts(taskIds: string[]): Promise<Map<string, number>> {
    if (!taskIds.length) {
      return new Map()
    }

    const rows = (await Comment.findAll({
      attributes: ['taskId', [fn('COUNT', '*'), 'count']],
      where: { taskId: { [Op.in]: taskIds } },
      group: ['taskId'],
      raw: true
    })) as unknown as Array<{ taskId: string; count: number }>

    const map = new Map<string, number>()
    rows.forEach((row) => map.set(row.taskId, Number(row.count ?? 0)))
    return map
  }

  private buildMetrics(tasks: Task[]): SprintMetricsDTO {
    const metrics: SprintMetricsDTO = {
      totalTasks: tasks.length,
      estimatedMinutes: 0,
      statusBreakdown: {}
    }

    for (const task of tasks) {
      const status = task.status ?? 'unknown'
      metrics.statusBreakdown[status] = (metrics.statusBreakdown[status] ?? 0) + 1
      if (task.estimatedMinutes) {
        metrics.estimatedMinutes += task.estimatedMinutes
      }
    }

    return metrics
  }
}

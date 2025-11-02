import { randomUUID } from 'node:crypto'
import { type Transaction, type Sequelize } from 'sequelize'

import { AppError, wrapError } from '@main/config/appError'
import { AuditService } from '@main/services/audit'
import { Project } from '@main/models/Project'
import { ProjectMember, type ProjectMembershipRole } from '@main/models/ProjectMember'
import { TaskStatus } from '@main/models/TaskStatus'
import { Task } from '@main/models/Task'
import type { ServiceActor } from '@main/services/types'
import {
  createTaskStatusSchema,
  deleteTaskStatusSchema,
  listTaskStatusesSchema,
  reorderTaskStatusesSchema,
  updateTaskStatusSchema,
  type CreateTaskStatusInput,
  type DeleteTaskStatusInput,
  type ListTaskStatusesInput,
  type ReorderTaskStatusesInput,
  type UpdateTaskStatusInput
} from '@main/services/taskStatus/schemas'
import type { TaskStatusDTO } from '@main/services/taskStatus/types'
import { resolveRoleWeight, isSystemAdmin } from '@main/services/project/roles'
import { DEFAULT_TASK_STATUSES } from '@main/services/taskStatus/defaults'

const DEFAULT_STATUS_KEYS = new Set(DEFAULT_TASK_STATUSES.map((status) => status.key))

const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

const mapTaskStatus = (status: TaskStatus): TaskStatusDTO => ({
  id: status.id,
  projectId: status.projectId,
  key: status.key,
  label: status.label,
  position: status.position
})

export class TaskStatusService {
  constructor(
    private readonly sequelize: Sequelize,
    private readonly auditService: AuditService
  ) {}

  async listStatuses(actor: ServiceActor, payload: unknown): Promise<TaskStatusDTO[]> {
    let input: ListTaskStatusesInput
    try {
      input = listTaskStatusesSchema.parse(payload)
    } catch (error) {
      throw new AppError('ERR_VALIDATION', 'Parametri lista stati non validi', { cause: error })
    }

    await this.resolveProjectAccess(actor, input.projectId, 'view')

    const statuses = await TaskStatus.findAll({
      where: { projectId: input.projectId },
      order: [['position', 'ASC']]
    })

    return statuses.map(mapTaskStatus)
  }

  async createStatus(actor: ServiceActor, payload: unknown): Promise<TaskStatusDTO> {
    let input: CreateTaskStatusInput
    try {
      input = createTaskStatusSchema.parse(payload)
    } catch (error) {
      throw new AppError('ERR_VALIDATION', 'Dati stato non validi', { cause: error })
    }

    const { project } = await this.resolveProjectAccess(actor, input.projectId, 'edit')

    try {
      return await this.withTransaction(async (transaction) => {
        const existingStatuses = await TaskStatus.findAll({
          where: { projectId: project.id },
          order: [['position', 'ASC']],
          transaction,
          lock: transaction.LOCK.UPDATE
        })

        const existingKeys = new Set(existingStatuses.map((status) => status.key))

        const key =
          input.key && !existingKeys.has(input.key)
            ? input.key
            : this.generateStatusKey(input.label, existingKeys)

        const position =
          existingStatuses.reduce((max, status) => Math.max(max, status.position), 0) + 1

        const created = await TaskStatus.create(
          {
            id: randomUUID(),
            projectId: project.id,
            key,
            label: input.label.trim(),
            position
          },
          { transaction }
        )

        await this.auditService.record(actor.userId, 'task_status', created.id, 'create', {
          projectId: project.id,
          key: created.key,
          label: created.label
        })

        return mapTaskStatus(created)
      })
    } catch (error) {
      throw wrapError(error)
    }
  }

  async updateStatus(
    actor: ServiceActor,
    statusId: string,
    payload: unknown
  ): Promise<TaskStatusDTO> {
    let input: UpdateTaskStatusInput
    try {
      input = updateTaskStatusSchema.parse(payload)
    } catch (error) {
      throw new AppError('ERR_VALIDATION', 'Dati aggiornamento stato non validi', { cause: error })
    }

    try {
      return await this.withTransaction(async (transaction) => {
        const status = await TaskStatus.findByPk(statusId, {
          transaction,
          lock: transaction.LOCK.UPDATE
        })
        if (!status) {
          throw new AppError('ERR_NOT_FOUND', 'Stato non trovato')
        }

        await this.resolveProjectAccess(actor, status.projectId, 'edit', transaction)

        if (input.label) {
          status.label = input.label.trim()
        }

        await status.save({ transaction })

        await this.auditService.record(actor.userId, 'task_status', status.id, 'update', {
          projectId: status.projectId,
          label: status.label
        })

        return mapTaskStatus(status)
      })
    } catch (error) {
      throw wrapError(error)
    }
  }

  async reorderStatuses(actor: ServiceActor, payload: unknown): Promise<TaskStatusDTO[]> {
    let input: ReorderTaskStatusesInput
    try {
      input = reorderTaskStatusesSchema.parse(payload)
    } catch (error) {
      throw new AppError('ERR_VALIDATION', 'Dati riordinamento stati non validi', { cause: error })
    }

    try {
      return await this.withTransaction(async (transaction) => {
        await this.resolveProjectAccess(actor, input.projectId, 'edit', transaction)

        const statuses = await TaskStatus.findAll({
          where: { projectId: input.projectId },
          transaction,
          lock: transaction.LOCK.UPDATE
        })

        if (statuses.length !== input.order.length) {
          throw new AppError('ERR_VALIDATION', 'La sequenza degli stati non è coerente')
        }

        const statusesById = new Map(statuses.map((status) => [status.id, status]))

        input.order.forEach((statusId, index) => {
          const status = statusesById.get(statusId)
          if (!status) {
            throw new AppError('ERR_VALIDATION', 'Stato non valido nel riordinamento')
          }
          status.position = index + 1
        })

        await Promise.all(statuses.map((status) => status.save({ transaction })))

        await this.auditService.record(actor.userId, 'task_status', input.projectId, 'reorder', {
          order: input.order
        })

        const ordered = statuses.sort((a, b) => a.position - b.position).map(mapTaskStatus)

        return ordered
      })
    } catch (error) {
      throw wrapError(error)
    }
  }

  async deleteStatus(actor: ServiceActor, payload: unknown): Promise<{ success: boolean }> {
    let input: DeleteTaskStatusInput
    try {
      input = deleteTaskStatusSchema.parse(payload)
    } catch (error) {
      throw new AppError('ERR_VALIDATION', 'Dati eliminazione stato non validi', { cause: error })
    }

    try {
      return await this.withTransaction(async (transaction) => {
        const status = await TaskStatus.findByPk(input.statusId, {
          transaction,
          lock: transaction.LOCK.UPDATE
        })
        if (!status) {
          throw new AppError('ERR_NOT_FOUND', 'Stato non trovato')
        }

        const fallback = await TaskStatus.findByPk(input.fallbackStatusId, {
          transaction,
          lock: transaction.LOCK.UPDATE
        })
        if (!fallback || fallback.projectId !== status.projectId) {
          throw new AppError('ERR_VALIDATION', 'Stato di fallback non valido')
        }

        if (fallback.id === status.id) {
          throw new AppError('ERR_VALIDATION', 'Specificare uno stato di fallback diverso')
        }

        const statusesCount = await TaskStatus.count({
          where: { projectId: status.projectId },
          transaction
        })
        if (statusesCount <= 1) {
          throw new AppError('ERR_VALIDATION', 'Il progetto deve avere almeno uno stato')
        }

        await this.resolveProjectAccess(actor, status.projectId, 'edit', transaction)

        await Task.update(
          { status: fallback.key },
          {
            where: { projectId: status.projectId, status: status.key },
            transaction
          }
        )

        await status.destroy({ transaction })

        await this.auditService.record(actor.userId, 'task_status', status.id, 'delete', {
          projectId: status.projectId,
          fallbackStatusId: fallback.id
        })

        return { success: true }
      })
    } catch (error) {
      throw wrapError(error)
    }
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

  private generateStatusKey(label: string, existingKeys: Set<string>): string {
    let base = slugify(label)
    if (!base || DEFAULT_STATUS_KEYS.has(base)) {
      base = `status_${Math.round(Math.random() * 9999)}`
    }
    base = base.slice(0, 48)
    let candidate = base
    let suffix = 1
    while (existingKeys.has(candidate)) {
      candidate = `${base}_${suffix}`.slice(0, 48)
      suffix += 1
    }
    existingKeys.add(candidate)
    return candidate
  }
}

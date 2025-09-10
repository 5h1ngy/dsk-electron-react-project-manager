import { randomUUID } from 'node:crypto'
import { Op, QueryTypes, type Sequelize, type Transaction } from 'sequelize'
import { AuditService } from './audit.service'
import { Project } from '../models/Project'
import { ProjectMember, type ProjectMembershipRole } from '../models/ProjectMember'
import { Task } from '../models/Task'
import { Comment } from '../models/Comment'
import { User } from '../models/User'
import { AppError, wrapError } from '../config/appError'
import {
  createTaskSchema,
  updateTaskSchema,
  moveTaskSchema,
  createCommentSchema,
  searchTasksSchema,
  type CreateTaskInput,
  type UpdateTaskInput,
  type MoveTaskInput,
  type CreateCommentInput,
  type SearchTasksInput
} from './task.schemas'
import type { ServiceActor } from './types'
import type { CommentDTO, TaskDetailsDTO } from './task.types'
import { mapComment, mapTaskDetails } from './task.helpers'
import { isSystemAdmin, resolveRoleWeight } from './project.roles'

export class TaskService {
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

  private async ensureAssignee(
    projectId: string,
    assigneeId: string | null,
    transaction?: Transaction
  ): Promise<void> {
    if (!assigneeId) {
      return
    }

    const user = await User.findByPk(assigneeId, { transaction })
    if (!user) {
      throw new AppError('ERR_NOT_FOUND', 'Utente assegnatario non trovato')
    }

    const membership = await ProjectMember.findOne({
      where: { projectId, userId: assigneeId },
      transaction
    })

    if (!membership) {
      throw new AppError('ERR_VALIDATION', 'L\'assegnatario deve essere membro del progetto')
    }
  }

  private async ensureParentTask(
    projectId: string,
    parentId: string | null,
    transaction?: Transaction
  ): Promise<void> {
    if (!parentId) {
      return
    }

    const parent = await Task.findOne({
      where: { id: parentId, projectId },
      transaction
    })

    if (!parent) {
      throw new AppError('ERR_VALIDATION', 'Task genitore non valido')
    }
  }

  private async loadTask(taskId: string): Promise<Task & { project: Project }> {
    const task = await Task.findByPk(taskId, {
      include: [
        { model: Project },
        { model: User, as: 'assignee' },
        { model: User, as: 'owner' }
      ]
    })

    if (!task) {
      throw new AppError('ERR_NOT_FOUND', 'Task non trovato')
    }

    if (!task.project) {
      throw new AppError('ERR_INTERNAL', 'Relazione progetto non disponibile')
    }

    return task as Task & { project: Project }
  }

  private async generateTaskKey(
    project: Project,
    transaction: Transaction
  ): Promise<string> {
    const tasks = await Task.findAll({
      where: { projectId: project.id },
      attributes: ['key'],
      transaction,
      paranoid: false
    })

    const prefix = `${project.key}-`
    let max = 0

    for (const task of tasks) {
      const key = task.key
      if (typeof key !== 'string' || !key.startsWith(prefix)) {
        continue
      }

      const suffix = key.slice(prefix.length)
      const numeric = Number.parseInt(suffix, 10)
      if (!Number.isNaN(numeric) && numeric > max) {
        max = numeric
      }
    }

    return `${prefix}${max + 1}`
  }

  async listByProject(actor: ServiceActor, projectId: string): Promise<TaskDetailsDTO[]> {
    try {
      const { project } = await this.resolveProjectAccess(actor, projectId, 'view')

      const tasks = await Task.findAll({
        where: { projectId: project.id },
        include: [
          { model: User, as: 'assignee' },
          { model: User, as: 'owner' }
        ],
        order: [
          ['status', 'ASC'],
          ['createdAt', 'ASC']
        ]
      })

      return tasks.map((task) => mapTaskDetails(task, project.key))
    } catch (error) {
      throw wrapError(error)
    }
  }

  async getTask(actor: ServiceActor, taskId: string): Promise<TaskDetailsDTO> {
    try {
      const task = await this.loadTask(taskId)
      await this.resolveProjectAccess(actor, task.projectId, 'view')
      return mapTaskDetails(task, task.project.key)
    } catch (error) {
      throw wrapError(error)
    }
  }

  async createTask(actor: ServiceActor, payload: unknown): Promise<TaskDetailsDTO> {
    let input: CreateTaskInput
    try {
      input = createTaskSchema.parse(payload)
    } catch (error) {
      throw new AppError('ERR_VALIDATION', 'Dati task non validi', { cause: error })
    }

    try {
      const { project } = await this.resolveProjectAccess(actor, input.projectId, 'edit')

      const task = await this.withTransaction(async (transaction) => {
        await this.ensureAssignee(project.id, input.assigneeId ?? null, transaction)
        await this.ensureParentTask(project.id, input.parentId ?? null, transaction)

        const key = await this.generateTaskKey(project, transaction)

        return await Task.create(
          {
            id: randomUUID(),
            projectId: project.id,
            key,
            parentId: input.parentId ?? null,
            title: input.title,
            description: input.description ?? null,
            status: input.status ?? 'todo',
            priority: input.priority ?? 'medium',
            dueDate: input.dueDate ?? null,
            assigneeId: input.assigneeId ?? null,
            ownerUserId: actor.userId
          },
          { transaction }
        )
      })

      await this.auditService.record(actor.userId, 'task', task.id, 'create', {
        projectId: task.projectId,
        title: task.title,
        status: task.status
      })

      const created = await Task.findByPk(task.id, {
        include: [
          { model: User, as: 'assignee' },
          { model: User, as: 'owner' }
        ]
      })

      if (!created) {
        throw new AppError('ERR_INTERNAL', 'Task creato non reperibile')
      }

      return mapTaskDetails(created, project.key)
    } catch (error) {
      throw wrapError(error)
    }
  }

  async updateTask(
    actor: ServiceActor,
    taskId: string,
    payload: unknown
  ): Promise<TaskDetailsDTO> {
    let input: UpdateTaskInput
    try {
      input = updateTaskSchema.parse(payload)
    } catch (error) {
      throw new AppError('ERR_VALIDATION', 'Modifiche task non valide', { cause: error })
    }

    try {
      const task = await this.loadTask(taskId)
      await this.resolveProjectAccess(actor, task.projectId, 'edit')

      await this.withTransaction(async (transaction) => {
        await this.ensureAssignee(task.projectId, input.assigneeId ?? null, transaction)
        await this.ensureParentTask(task.projectId, input.parentId ?? null, transaction)

        Object.assign(task, input)
        await task.save({ transaction })
      })

      await this.auditService.record(actor.userId, 'task', taskId, 'update', input)

      const reloaded = await this.loadTask(taskId)
      return mapTaskDetails(reloaded, reloaded.project.key)
    } catch (error) {
      throw wrapError(error)
    }
  }

  async moveTask(
    actor: ServiceActor,
    taskId: string,
    payload: unknown
  ): Promise<TaskDetailsDTO> {
    let input: MoveTaskInput
    try {
      input = moveTaskSchema.parse(payload)
    } catch (error) {
      throw new AppError('ERR_VALIDATION', 'Aggiornamento stato non valido', { cause: error })
    }

    return await this.updateTask(actor, taskId, { status: input.status })
  }

  async deleteTask(actor: ServiceActor, taskId: string): Promise<void> {
    try {
      const task = await this.loadTask(taskId)
      await this.resolveProjectAccess(actor, task.projectId, 'edit')

      await this.withTransaction(async (transaction) => {
        await task.destroy({ transaction })
      })

      await this.auditService.record(actor.userId, 'task', taskId, 'delete', null)
    } catch (error) {
      throw wrapError(error)
    }
  }

  async listComments(actor: ServiceActor, taskId: string): Promise<CommentDTO[]> {
    try {
      const task = await this.loadTask(taskId)
      await this.resolveProjectAccess(actor, task.projectId, 'view')

      const comments = await Comment.findAll({
        where: { taskId: task.id },
        include: [{ model: User, as: 'author' }],
        order: [['createdAt', 'ASC']]
      })

      return comments.map(mapComment)
    } catch (error) {
      throw wrapError(error)
    }
  }

  async addComment(actor: ServiceActor, payload: unknown): Promise<CommentDTO> {
    let input: CreateCommentInput
    try {
      input = createCommentSchema.parse(payload)
    } catch (error) {
      throw new AppError('ERR_VALIDATION', 'Commento non valido', { cause: error })
    }

    try {
      const task = await this.loadTask(input.taskId)
      await this.resolveProjectAccess(actor, task.projectId, 'edit')

      const comment = await Comment.create({
        id: randomUUID(),
        taskId: task.id,
        authorId: actor.userId,
        body: input.body
      })

      await this.auditService.record(actor.userId, 'task', task.id, 'comment', {
        commentId: comment.id
      })

      const reloaded = await Comment.findByPk(comment.id, {
        include: [{ model: User, as: 'author' }]
      })

      if (!reloaded) {
        throw new AppError('ERR_INTERNAL', 'Commento non reperibile')
      }

      return mapComment(reloaded)
    } catch (error) {
      throw wrapError(error)
    }
  }

  async search(actor: ServiceActor, payload: unknown): Promise<TaskDetailsDTO[]> {
    let input: SearchTasksInput
    try {
      input = searchTasksSchema.parse(payload)
    } catch (error) {
      throw new AppError('ERR_VALIDATION', 'Query di ricerca non valida', { cause: error })
    }

    try {
      const accessibleProjectIds = await this.getAccessibleProjectIds(actor)
      const taskIds = await this.searchTaskIds(input.query, accessibleProjectIds)

      if (!taskIds.length) {
        return []
      }

      const tasks = await Task.findAll({
        where: { id: { [Op.in]: taskIds } },
        include: [
          { model: User, as: 'assignee' },
          { model: User, as: 'owner' },
          { model: Project }
        ]
      })

      return tasks.map((task) => {
        const projectKey = task.project?.key ?? 'UNKNOWN'
        return mapTaskDetails(task, projectKey)
      })
    } catch (error) {
      throw wrapError(error)
    }
  }

  private async getAccessibleProjectIds(actor: ServiceActor): Promise<string[] | null> {
    if (isSystemAdmin(actor)) {
      return null
    }

    const memberships = await ProjectMember.findAll({
      where: { userId: actor.userId },
      attributes: ['projectId']
    })

    return memberships.map((membership) => membership.projectId)
  }

  private async searchTaskIds(query: string, projectIds: string[] | null): Promise<string[]> {
    try {
      return await this.searchTaskIdsViaFts(query, projectIds)
    } catch (error) {
      if (error instanceof Error && /no such table:\s*tasks_fts/i.test(error.message)) {
        return await this.searchTaskIdsViaLike(query, projectIds)
      }
      throw error
    }
  }

  private async searchTaskIdsViaFts(
    query: string,
    projectIds: string[] | null
  ): Promise<string[]> {
    const escaped = `"${query.replace(/"/g, '""')}"`
    const whereClause = projectIds ? 'AND t.projectId IN (:projectIds)' : ''

    const rows = await this.sequelize.query<{ taskId: string }>(
      `SELECT t.id as taskId
         FROM tasks_fts f
         JOIN tasks t ON t.id = f.taskId
         WHERE f MATCH :query
           AND t.deletedAt IS NULL
           ${whereClause}`,
      {
        replacements: {
          query: escaped,
          projectIds: projectIds ?? []
        },
        type: QueryTypes.SELECT
      }
    )

    return rows.map((row) => row.taskId)
  }

  private async searchTaskIdsViaLike(
    query: string,
    projectIds: string[] | null
  ): Promise<string[]> {
    const likePattern = `%${query}%`
    const where: Record<string, unknown> = {
      [Op.or]: [
        { title: { [Op.like]: likePattern } },
        { description: { [Op.like]: likePattern } }
      ]
    }

    if (projectIds) {
      where.projectId = { [Op.in]: projectIds }
    }

    const tasks = await Task.findAll({
      attributes: ['id'],
      where,
      limit: 50
    })

    return tasks.map((task) => task.id)
  }
}

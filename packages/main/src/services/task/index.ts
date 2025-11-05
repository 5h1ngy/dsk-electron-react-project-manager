import { randomUUID } from 'node:crypto'
import {
  Op,
  QueryTypes,
  col,
  fn,
  type FindOptions,
  type Sequelize,
  type Transaction
} from 'sequelize'
import { AuditService } from '@main/services/audit'
import { Project } from '@main/models/Project'
import { ProjectMember, type ProjectMembershipRole } from '@main/models/ProjectMember'
import { Task } from '@main/models/Task'
import { TaskStatus } from '@main/models/TaskStatus'
import { Comment } from '@main/models/Comment'
import { User } from '@main/models/User'
import { Note } from '@main/models/Note'
import { NoteTaskLink } from '@main/models/NoteTaskLink'
import { Sprint } from '@main/models/Sprint'
import { TimeEntry } from '@main/models/TimeEntry'
import { AppError, wrapError } from '@main/config/appError'
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
} from '@main/services/task/schemas'
import type { ServiceActor } from '@main/services/types'
import type { CommentDTO, TaskDetailsDTO, TaskNoteLinkDTO } from '@main/services/task/types'
import { mapComment, mapTaskDetails } from '@main/services/task/helpers'
import { isSystemAdmin, resolveRoleWeight } from '@main/services/project/roles'

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
      throw new AppError('ERR_VALIDATION', "L'assegnatario deve essere membro del progetto")
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

  private async ensureSprint(
    projectId: string,
    sprintId: string | null,
    transaction?: Transaction
  ): Promise<Sprint | null> {
    if (!sprintId) {
      return null
    }

    const sprint = await Sprint.findOne({
      where: { id: sprintId, projectId },
      transaction
    })

    if (!sprint) {
      throw new AppError('ERR_VALIDATION', 'Sprint selezionato non valido')
    }

    return sprint
  }

  private async ensureOwner(
    actor: ServiceActor,
    projectId: string,
    ownerId: string,
    transaction?: Transaction
  ): Promise<void> {
    const user = await User.findByPk(ownerId, { transaction })
    if (!user) {
      throw new AppError('ERR_NOT_FOUND', 'Utente proprietario non trovato')
    }

    if (ownerId === actor.userId && isSystemAdmin(actor)) {
      return
    }

    const membership = await ProjectMember.findOne({
      where: { projectId, userId: ownerId },
      transaction
    })

    if (!membership) {
      throw new AppError('ERR_VALIDATION', 'Il proprietario deve essere membro del progetto')
    }
  }

  private async loadTask(taskId: string): Promise<Task & { project: Project }> {
    const task = await Task.findByPk(taskId, {
      include: [
        { model: Project },
        { model: User, as: 'assignee' },
        { model: User, as: 'owner' },
        { model: Sprint, as: 'sprint' },
        {
          model: Note,
          through: { attributes: [] }
        }
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

  private async generateTaskKey(project: Project, transaction: Transaction): Promise<string> {
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

  private async resolveStatusKey(
    projectId: string,
    requestedStatus: string | null | undefined,
    transaction?: Transaction
  ): Promise<string> {
    if (requestedStatus) {
      const existing = await TaskStatus.findOne({
        where: { projectId, key: requestedStatus },
        transaction
      })
      if (!existing) {
        throw new AppError('ERR_VALIDATION', 'Stato selezionato non valido')
      }
      return existing.key
    }

    const firstStatus = await TaskStatus.findOne({
      where: { projectId },
      order: [['position', 'ASC']],
      transaction
    })

    if (!firstStatus) {
      throw new AppError('ERR_VALIDATION', 'Nessuno stato configurato per il progetto')
    }

    return firstStatus.key
  }

  async listByProject(actor: ServiceActor, projectId: string): Promise<TaskDetailsDTO[]> {
    try {
      const { project, role } = await this.resolveProjectAccess(actor, projectId, 'view')

      const queryOptions: FindOptions<Task> & { distinct: boolean } = {
        where: { projectId: project.id },
        include: [
          { model: User, as: 'assignee' },
          { model: User, as: 'owner' },
          { model: Sprint, as: 'sprint' },
          {
            model: Note,
            through: { attributes: [] }
          }
        ],
        // Distinct is required to avoid duplicates produced by the note join,
        // but it is missing from the TypeScript FindOptions type definition.
        distinct: true,
        order: [
          ['status', 'ASC'],
          ['createdAt', 'ASC']
        ]
      }

      const tasks = await Task.findAll(queryOptions)
      const taskIds = tasks.map((task) => task.id)
      const commentCountMap = new Map<string, number>()
      const timeSpentMap = new Map<string, number>()

      if (taskIds.length > 0) {
        const rawCounts = (await Comment.findAll({
          attributes: ['taskId', [fn('COUNT', '*'), 'count']],
          where: { taskId: { [Op.in]: taskIds } },
          group: ['taskId'],
          raw: true
        })) as unknown as Array<{ taskId: string; count: number }>

        rawCounts.forEach((row) => {
          commentCountMap.set(row.taskId, Number(row.count ?? 0))
        })
      }

      if (taskIds.length > 0) {
        const timeTotals = (await TimeEntry.findAll({
          attributes: ['taskId', [fn('SUM', col('durationMinutes')), 'totalMinutes']],
          where: { taskId: { [Op.in]: taskIds } },
          group: ['taskId'],
          raw: true
        })) as unknown as Array<{ taskId: string; totalMinutes: number }>

        timeTotals.forEach((row) => {
          timeSpentMap.set(row.taskId, Number(row.totalMinutes ?? 0))
        })
      }

      return tasks.map((task) => {
        const commentCount = commentCountMap.get(task.id) ?? 0
        const details = mapTaskDetails(task, project.key, commentCount, {
          timeSpentMinutes: timeSpentMap.get(task.id) ?? 0
        })
        return {
          ...details,
          linkedNotes: this.filterLinkedNotes(actor, role, details.linkedNotes)
        }
      })
    } catch (error) {
      throw wrapError(error)
    }
  }

  async getTask(actor: ServiceActor, taskId: string): Promise<TaskDetailsDTO> {
    try {
      const task = await this.loadTask(taskId)
      const { role } = await this.resolveProjectAccess(actor, task.projectId, 'view')
      const commentCount = await Comment.count({ where: { taskId: task.id } })
      const timeSpent = await TimeEntry.sum('durationMinutes', {
        where: { taskId: task.id }
      })
      const details = mapTaskDetails(task, task.project.key, commentCount, {
        timeSpentMinutes: Number(timeSpent ?? 0)
      })
      return {
        ...details,
        linkedNotes: this.filterLinkedNotes(actor, role, details.linkedNotes)
      }
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
      const { project, role } = await this.resolveProjectAccess(actor, input.projectId, 'edit')

      const createdTask = await this.withTransaction(async (transaction) => {
        await this.ensureAssignee(project.id, input.assigneeId ?? null, transaction)
        await this.ensureParentTask(project.id, input.parentId ?? null, transaction)
        await this.ensureSprint(project.id, input.sprintId ?? null, transaction)
        const ownerId = input.ownerId ?? actor.userId
        await this.ensureOwner(actor, project.id, ownerId, transaction)

        const key = await this.generateTaskKey(project, transaction)
        const statusKey = await this.resolveStatusKey(project.id, input.status ?? null, transaction)

        const task = await Task.create(
          {
            id: randomUUID(),
            projectId: project.id,
            key,
            parentId: input.parentId ?? null,
            title: input.title,
            description: input.description ?? null,
            status: statusKey,
            priority: input.priority ?? 'medium',
            dueDate: input.dueDate ?? null,
            assigneeId: input.assigneeId ?? null,
            ownerUserId: ownerId,
            sprintId: input.sprintId ?? null,
            estimatedMinutes: input.estimatedMinutes ?? null
          },
          { transaction }
        )

        const reloaded = await Task.findByPk(task.id, {
          include: [
            { model: User, as: 'assignee' },
            { model: User, as: 'owner' },
            { model: Sprint, as: 'sprint' },
            {
              model: Note,
              through: { attributes: [] }
            }
          ],
          transaction
        })

        if (!reloaded) {
          throw new AppError('ERR_INTERNAL', 'Task creato non reperibile')
        }

        return reloaded
      })

      await this.auditService.record(actor.userId, 'task', createdTask.id, 'create', {
        projectId: createdTask.projectId,
        title: createdTask.title,
        status: createdTask.status
      })

      const details = mapTaskDetails(createdTask, project.key, 0, { timeSpentMinutes: 0 })
      return {
        ...details,
        linkedNotes: this.filterLinkedNotes(actor, role, details.linkedNotes)
      }
    } catch (error) {
      throw wrapError(error)
    }
  }

  async updateTask(actor: ServiceActor, taskId: string, payload: unknown): Promise<TaskDetailsDTO> {
    let input: UpdateTaskInput
    try {
      input = updateTaskSchema.parse(payload)
    } catch (error) {
      throw new AppError('ERR_VALIDATION', 'Modifiche task non valide', { cause: error })
    }

    try {
      const task = await this.loadTask(taskId)
      const { role } = await this.resolveProjectAccess(actor, task.projectId, 'edit')

      await this.withTransaction(async (transaction) => {
        if (input.assigneeId !== undefined) {
          await this.ensureAssignee(task.projectId, input.assigneeId ?? null, transaction)
          task.assigneeId = input.assigneeId ?? null
        }

        if (input.parentId !== undefined) {
          await this.ensureParentTask(task.projectId, input.parentId ?? null, transaction)
          task.parentId = input.parentId ?? null
        }

        if (input.sprintId !== undefined) {
          await this.ensureSprint(task.projectId, input.sprintId ?? null, transaction)
          task.sprintId = input.sprintId ?? null
        }

        if (input.ownerId !== undefined) {
          await this.ensureOwner(actor, task.projectId, input.ownerId, transaction)
          task.ownerUserId = input.ownerId
        }

        if (input.title !== undefined) {
          task.title = input.title
        }

        if (input.description !== undefined) {
          task.description = input.description ?? null
        }

        if (input.status !== undefined) {
          task.status = await this.resolveStatusKey(task.projectId, input.status, transaction)
        }

        if (input.priority !== undefined) {
          task.priority = input.priority
        }

        if (input.dueDate !== undefined) {
          task.dueDate = input.dueDate ?? null
        }

        if (input.estimatedMinutes !== undefined) {
          task.estimatedMinutes = input.estimatedMinutes ?? null
        }

        await task.save({ transaction })
      })

      await this.auditService.record(actor.userId, 'task', taskId, 'update', input)

      const reloaded = await this.loadTask(taskId)
      const commentCount = await Comment.count({ where: { taskId } })
      const timeSpent = await TimeEntry.sum('durationMinutes', { where: { taskId } })
      const details = mapTaskDetails(reloaded, reloaded.project.key, commentCount, {
        timeSpentMinutes: Number(timeSpent ?? 0)
      })
      return {
        ...details,
        linkedNotes: this.filterLinkedNotes(actor, role, details.linkedNotes)
      }
    } catch (error) {
      throw wrapError(error)
    }
  }

  async moveTask(actor: ServiceActor, taskId: string, payload: unknown): Promise<TaskDetailsDTO> {
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
        await Comment.destroy({
          where: { taskId: task.id },
          transaction
        })
        await NoteTaskLink.destroy({
          where: { taskId: task.id },
          transaction
        })
        await TimeEntry.destroy({
          where: { taskId: task.id },
          transaction
        })
        await task.destroy({ transaction, force: true })
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

      const searchQueryOptions: FindOptions<Task> & { distinct: boolean } = {
        where: { id: { [Op.in]: taskIds } },
        include: [
          { model: User, as: 'assignee' },
          { model: User, as: 'owner' },
          { model: Project },
          { model: Sprint, as: 'sprint' },
          {
            model: Note,
            through: { attributes: [] }
          }
        ],
        distinct: true
      }

      const tasks = await Task.findAll(searchQueryOptions)

      const roles = await this.resolveActorRolesForProjects(
        actor,
        tasks.map((task) => task.projectId)
      )

      const commentCountMap = new Map<string, number>()
      const timeSpentMap = new Map<string, number>()
      if (tasks.length > 0) {
        const taskIdsForCounts = tasks.map((task) => task.id)
        const rawCounts = (await Comment.findAll({
          attributes: ['taskId', [fn('COUNT', '*'), 'count']],
          where: { taskId: { [Op.in]: taskIdsForCounts } },
          group: ['taskId'],
          raw: true
        })) as unknown as Array<{ taskId: string; count: number }>

        rawCounts.forEach((row) => {
          commentCountMap.set(row.taskId, Number(row.count ?? 0))
        })

        const rawTime = (await TimeEntry.findAll({
          attributes: ['taskId', [fn('SUM', col('durationMinutes')), 'totalMinutes']],
          where: { taskId: { [Op.in]: taskIdsForCounts } },
          group: ['taskId'],
          raw: true
        })) as unknown as Array<{ taskId: string; totalMinutes: number }>

        rawTime.forEach((row) => {
          timeSpentMap.set(row.taskId, Number(row.totalMinutes ?? 0))
        })
      }

      return tasks.map((task) => {
        const projectKey = task.project?.key ?? 'UNKNOWN'
        const commentCount = commentCountMap.get(task.id) ?? 0
        const details = mapTaskDetails(task, projectKey, commentCount, {
          timeSpentMinutes: timeSpentMap.get(task.id) ?? 0
        })
        const role = roles.get(task.projectId) ?? 'view'
        return {
          ...details,
          linkedNotes: this.filterLinkedNotes(actor, role, details.linkedNotes)
        }
      })
    } catch (error) {
      throw wrapError(error)
    }
  }

  private filterLinkedNotes(
    actor: ServiceActor,
    role: ProjectMembershipRole,
    notes: TaskNoteLinkDTO[]
  ): TaskNoteLinkDTO[] {
    return notes.filter((note) => {
      if (!note.isPrivate) {
        return true
      }
      if (note.ownerId === actor.userId) {
        return true
      }
      return resolveRoleWeight(role) >= resolveRoleWeight('admin')
    })
  }

  private async resolveActorRolesForProjects(
    actor: ServiceActor,
    projectIds: string[]
  ): Promise<Map<string, ProjectMembershipRole>> {
    const roles = new Map<string, ProjectMembershipRole>()
    if (!projectIds.length) {
      return roles
    }

    const uniqueIds = Array.from(new Set(projectIds))

    if (isSystemAdmin(actor)) {
      uniqueIds.forEach((id) => roles.set(id, 'admin'))
      return roles
    }

    const memberships = await ProjectMember.findAll({
      where: { userId: actor.userId, projectId: { [Op.in]: uniqueIds } },
      attributes: ['projectId', 'role']
    })

    memberships.forEach((membership) => roles.set(membership.projectId, membership.role))
    uniqueIds.forEach((id) => {
      if (!roles.has(id)) {
        roles.set(id, 'view')
      }
    })
    return roles
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

  private async searchTaskIdsViaFts(query: string, projectIds: string[] | null): Promise<string[]> {
    const escaped = `"${query.replace(/"/g, '""')}"`
    const whereClause = projectIds ? 'AND t.projectId IN (:projectIds)' : ''

    const rows = await this.sequelize.query<{ taskId: string }>(
      `SELECT t.id as taskId
         FROM tasks_fts f
         JOIN tasks t ON t.id = f.taskId
         WHERE tasks_fts MATCH :query
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
      [Op.or]: [{ title: { [Op.like]: likePattern } }, { description: { [Op.like]: likePattern } }]
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

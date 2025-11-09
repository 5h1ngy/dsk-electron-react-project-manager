import { randomUUID } from 'node:crypto'
import { Op, QueryTypes, Sequelize, Transaction } from 'sequelize'

import { AppError, wrapError } from '@services/config/appError'
import { AuditService } from '@services/services/audit'
import {
  createNoteSchema,
  listNotesSchema,
  noteIdSchema,
  searchNotesSchema,
  updateNoteSchema,
  type CreateNoteInput,
  type ListNotesInput,
  type SearchNotesInput,
  type UpdateNoteInput
} from '@services/services/note/schemas'
import { mapNoteDetails, mapNoteSummary } from '@services/services/note/helpers'
import type {
  NoteDetailsDTO,
  NoteSearchResultDTO,
  NoteSummaryDTO
} from '@services/services/note/types'
import type { ServiceActor } from '@services/services/types'
import { Note } from '@services/models/Note'
import { NoteTag } from '@services/models/NoteTag'
import { NoteTaskLink } from '@services/models/NoteTaskLink'
import { Task } from '@services/models/Task'
import { User } from '@services/models/User'
import { Project } from '@services/models/Project'
import { ProjectMember, type ProjectMembershipRole } from '@services/models/ProjectMember'
import { isSystemAdmin, resolveRoleWeight } from '@services/services/project/roles'

interface SearchRow {
  noteId: string
  highlight: string | null
  score?: number
}

export class NoteService {
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

  protected async loadMembership(
    projectId: string,
    userId: string,
    transaction?: Transaction
  ): Promise<ProjectMember | null> {
    return await ProjectMember.findOne({
      where: { projectId, userId },
      transaction
    })
  }

  protected resolveActorRole(
    actor: ServiceActor,
    membershipRole: ProjectMembershipRole | null
  ): ProjectMembershipRole {
    if (isSystemAdmin(actor)) {
      return 'admin'
    }
    return membershipRole ?? 'view'
  }

  protected ensureMinimumRole(
    actorRole: ProjectMembershipRole,
    minimum: ProjectMembershipRole
  ): void {
    if (resolveRoleWeight(actorRole) < resolveRoleWeight(minimum)) {
      throw new AppError('ERR_PERMISSION', 'Permessi insufficienti per questa operazione')
    }
  }

  protected async resolveProjectAccess(
    actor: ServiceActor,
    projectId: string,
    minimumRole: ProjectMembershipRole,
    transaction?: Transaction
  ): Promise<{ project: Project; role: ProjectMembershipRole }> {
    const project = await Project.findByPk(projectId, { transaction })
    if (!project) {
      throw new AppError('ERR_NOT_FOUND', 'Progetto non trovato')
    }

    const membership = await this.loadMembership(projectId, actor.userId, transaction)
    const actorRole = this.resolveActorRole(actor, membership?.role ?? null)
    this.ensureMinimumRole(actorRole, minimumRole)

    return { project, role: actorRole }
  }

  private canReadNote(actor: ServiceActor, actorRole: ProjectMembershipRole, note: Note): boolean {
    if (!note.isPrivate) {
      return true
    }
    if (note.ownerUserId === actor.userId) {
      return true
    }
    return resolveRoleWeight(actorRole) >= resolveRoleWeight('admin')
  }

  private canManageNote(
    actor: ServiceActor,
    actorRole: ProjectMembershipRole,
    note: Note
  ): boolean {
    if (note.ownerUserId === actor.userId) {
      return true
    }
    if (isSystemAdmin(actor)) {
      return true
    }
    return resolveRoleWeight(actorRole) >= resolveRoleWeight('admin')
  }

  protected async loadNote(noteId: string, transaction?: Transaction): Promise<Note> {
    const note = await Note.findByPk(noteId, {
      include: [
        { model: NoteTag, required: false },
        {
          model: Task,
          include: [{ model: Project }],
          through: { attributes: [] },
          required: false
        },
        { model: User }
      ],
      transaction
    })
    if (!note) {
      throw new AppError('ERR_NOT_FOUND', 'Nota non trovata')
    }
    return note
  }

  private async syncTags(
    noteId: string,
    tags: string[] | undefined,
    transaction: Transaction
  ): Promise<void> {
    if (tags === undefined) {
      return
    }
    const normalized = Array.from(
      new Set(tags.map((tag) => tag.trim().toLowerCase()).filter((tag) => tag.length > 0))
    ).slice(0, 20)

    await NoteTag.destroy({ where: { noteId }, transaction })

    if (!normalized.length) {
      return
    }

    await NoteTag.bulkCreate(
      normalized.map((tag) => ({
        noteId,
        tag
      })),
      { transaction }
    )
  }

  private async syncTaskLinks(
    note: Note,
    taskIds: string[] | undefined,
    transaction: Transaction
  ): Promise<void> {
    if (taskIds === undefined) {
      return
    }
    await NoteTaskLink.destroy({
      where: { noteId: note.id },
      transaction
    })

    if (!taskIds.length) {
      return
    }

    const tasks = await Task.findAll({
      where: {
        id: { [Op.in]: taskIds },
        projectId: note.projectId
      },
      attributes: ['id'],
      transaction
    })

    const existingIds = new Set(tasks.map((task) => task.id))
    const missing = taskIds.filter((taskId) => !existingIds.has(taskId))
    if (missing.length) {
      throw new AppError(
        'ERR_VALIDATION',
        'Alcuni task collegati non appartengono al progetto corrente',
        {
          details: { missingTaskIds: missing }
        }
      )
    }

    await NoteTaskLink.bulkCreate(
      Array.from(existingIds).map((taskId) => ({
        noteId: note.id,
        taskId
      })),
      { transaction }
    )
  }

  async listNotes(actor: ServiceActor, payload: unknown): Promise<NoteSummaryDTO[]> {
    let input: ListNotesInput
    try {
      input = listNotesSchema.parse(payload)
    } catch (error) {
      throw new AppError('ERR_VALIDATION', 'Parametri elenco note non validi', { cause: error })
    }

    try {
      const { project, role } = await this.resolveProjectAccess(actor, input.projectId, 'view')

      const notes = await Note.findAll({
        where: {
          projectId: project.id,
          ...(input.notebook ? { notebook: input.notebook } : {})
        },
        include: [
          { model: NoteTag, required: false },
          {
            model: Task,
            include: [{ model: Project }],
            through: { attributes: [] },
            required: false
          },
          { model: User }
        ],
        order: [['updatedAt', 'DESC']]
      })

      return notes
        .filter((note) => {
          if (input.includePrivate) {
            return this.canManageNote(actor, role, note)
          }
          return this.canReadNote(actor, role, note)
        })
        .filter((note) => {
          if (!input.tag) {
            return true
          }
          const tags = (note.tags ?? []).map((tag) => tag.tag.toLowerCase())
          return tags.includes(input.tag.toLowerCase())
        })
        .map((note) => mapNoteSummary(note))
    } catch (error) {
      throw wrapError(error)
    }
  }

  async getNote(actor: ServiceActor, noteId: unknown): Promise<NoteDetailsDTO> {
    let id: string
    try {
      id = noteIdSchema.parse(noteId)
    } catch (error) {
      throw new AppError('ERR_VALIDATION', 'Identificativo nota non valido', { cause: error })
    }

    try {
      const note = await this.loadNote(id)
      const membership = await this.loadMembership(note.projectId, actor.userId)
      const actorRole = this.resolveActorRole(actor, membership?.role ?? null)

      if (!this.canReadNote(actor, actorRole, note)) {
        throw new AppError('ERR_PERMISSION', 'Accesso alla nota negato')
      }

      return mapNoteDetails(note)
    } catch (error) {
      throw wrapError(error)
    }
  }

  async createNote(actor: ServiceActor, payload: unknown): Promise<NoteDetailsDTO> {
    let input: CreateNoteInput
    try {
      input = createNoteSchema.parse(payload)
    } catch (error) {
      throw new AppError('ERR_VALIDATION', 'Dati nota non validi', { cause: error })
    }

    try {
      const { project, role } = await this.resolveProjectAccess(actor, input.projectId, 'edit')

      return await this.withTransaction(async (transaction) => {
        const note = await Note.create(
          {
            id: randomUUID(),
            projectId: project.id,
            title: input.title,
            bodyMd: input.body,
            ownerUserId: actor.userId,
            isPrivate: input.isPrivate ?? false,
            notebook: input.notebook ?? null
          },
          { transaction }
        )

        await this.syncTags(note.id, input.tags, transaction)
        await this.syncTaskLinks(note, input.linkedTaskIds, transaction)

        const reloaded = await this.loadNote(note.id, transaction)

        await this.auditService.record(
          actor.userId,
          'note',
          note.id,
          'create',
          {
            projectId: project.id,
            isPrivate: note.isPrivate
          },
          { transaction }
        )

        if (input.linkedTaskIds && input.linkedTaskIds.length) {
          await this.auditService.record(
            actor.userId,
            'note',
            note.id,
            'link_tasks',
            {
              taskIds: input.linkedTaskIds
            },
            { transaction }
          )
        }

        if (!this.canReadNote(actor, role, reloaded)) {
          throw new AppError('ERR_PERMISSION', 'Nota creata ma non leggibile per permessi')
        }

        return mapNoteDetails(reloaded)
      })
    } catch (error) {
      throw wrapError(error)
    }
  }

  async updateNote(
    actor: ServiceActor,
    noteId: unknown,
    payload: unknown
  ): Promise<NoteDetailsDTO> {
    let id: string
    try {
      id = noteIdSchema.parse(noteId)
    } catch (error) {
      throw new AppError('ERR_VALIDATION', 'Identificativo nota non valido', { cause: error })
    }

    let input: UpdateNoteInput
    try {
      input = updateNoteSchema.parse(payload)
    } catch (error) {
      throw new AppError('ERR_VALIDATION', 'Aggiornamento nota non valido', { cause: error })
    }

    try {
      return await this.withTransaction(async (transaction) => {
        const note = await this.loadNote(id, transaction)
        const membership = await this.loadMembership(note.projectId, actor.userId, transaction)
        const actorRole = this.resolveActorRole(actor, membership?.role ?? null)

        if (!this.canManageNote(actor, actorRole, note)) {
          throw new AppError('ERR_PERMISSION', 'Non puoi modificare questa nota')
        }

        if (input.title !== undefined) {
          note.title = input.title
        }
        if (input.body !== undefined) {
          note.bodyMd = input.body
        }
        if (input.isPrivate !== undefined) {
          note.isPrivate = input.isPrivate
        }
        if (input.notebook !== undefined) {
          note.notebook = input.notebook ?? null
        }

        await note.save({ transaction })
        await this.syncTags(note.id, input.tags, transaction)
        await this.syncTaskLinks(note, input.linkedTaskIds, transaction)

        const updated = await this.loadNote(note.id, transaction)

        await this.auditService.record(
          actor.userId,
          'note',
          note.id,
          'update',
          {
            changedFields: Object.keys(input)
          },
          { transaction }
        )

        return mapNoteDetails(updated)
      })
    } catch (error) {
      throw wrapError(error)
    }
  }

  async deleteNote(actor: ServiceActor, noteId: unknown): Promise<void> {
    let id: string
    try {
      id = noteIdSchema.parse(noteId)
    } catch (error) {
      throw new AppError('ERR_VALIDATION', 'Identificativo nota non valido', { cause: error })
    }

    try {
      await this.withTransaction(async (transaction) => {
        const note = await this.loadNote(id, transaction)
        const membership = await this.loadMembership(note.projectId, actor.userId, transaction)
        const actorRole = this.resolveActorRole(actor, membership?.role ?? null)

        if (!this.canManageNote(actor, actorRole, note)) {
          throw new AppError('ERR_PERMISSION', 'Non puoi eliminare questa nota')
        }

        await NoteTaskLink.destroy({ where: { noteId: id }, transaction })
        await NoteTag.destroy({ where: { noteId: id }, transaction })
        await note.destroy({ transaction })

        await this.auditService.record(actor.userId, 'note', id, 'delete', null, { transaction })
      })
    } catch (error) {
      throw wrapError(error)
    }
  }

  async search(actor: ServiceActor, payload: unknown): Promise<NoteSearchResultDTO[]> {
    let input: SearchNotesInput
    try {
      input = searchNotesSchema.parse(payload)
    } catch (error) {
      throw new AppError('ERR_VALIDATION', 'Query di ricerca note non valida', { cause: error })
    }

    try {
      const accessibleProjects = await this.getAccessibleProjectIds(actor)
      if (input.projectId && accessibleProjects && !accessibleProjects.includes(input.projectId)) {
        throw new AppError('ERR_PERMISSION', 'Accesso al progetto negato')
      }

      const projectIds = input.projectId ? [input.projectId] : accessibleProjects
      const rows = await this.performSearchQuery(input.query, projectIds)

      if (!rows.length) {
        return []
      }

      const noteMap = new Map<string, SearchRow>()
      rows.forEach((row) => noteMap.set(row.noteId, row))

      const notes = await Note.findAll({
        where: { id: { [Op.in]: Array.from(noteMap.keys()) } },
        include: [
          { model: NoteTag, required: false },
          {
            model: Task,
            include: [{ model: Project }],
            through: { attributes: [] },
            required: false
          },
          { model: User }
        ]
      })

      const results: NoteSearchResultDTO[] = []
      for (const row of rows) {
        const note = notes.find((candidate) => candidate.id === row.noteId)
        if (!note) {
          continue
        }
        const membership = await this.loadMembership(note.projectId, actor.userId)
        const actorRole = this.resolveActorRole(actor, membership?.role ?? null)
        if (!this.canReadNote(actor, actorRole, note)) {
          continue
        }
        results.push({
          ...mapNoteSummary(note),
          highlight: row.highlight
        })
      }

      return results
    } catch (error) {
      throw wrapError(error)
    }
  }

  private async performSearchQuery(
    query: string,
    projectIds: string[] | null
  ): Promise<SearchRow[]> {
    try {
      return await this.searchViaFts(query, projectIds)
    } catch (error) {
      if (error instanceof Error && /no such table:\s*notes_fts/i.test(error.message)) {
        return await this.searchViaLike(query, projectIds)
      }
      throw error
    }
  }

  private async searchViaFts(query: string, projectIds: string[] | null): Promise<SearchRow[]> {
    const escaped = `"${query.replace(/"/g, '""')}"`
    const whereClause = projectIds ? 'AND n.projectId IN (:projectIds)' : ''

    const rows = await this.sequelize.query<SearchRow>(
      `SELECT n.id AS noteId,
              snippet(notes_fts, 2, '<mark>', '</mark>', ' â€¦ ', 18) AS highlight,
              bm25(notes_fts, 1.0, 1.0, 1.0) AS score
         FROM notes_fts
         JOIN notes n ON n.id = notes_fts.noteId
        WHERE notes_fts MATCH :query
          ${whereClause}
        ORDER BY score`,
      {
        replacements: {
          query: escaped,
          projectIds: projectIds ?? []
        },
        type: QueryTypes.SELECT
      }
    )

    return rows
  }

  private async searchViaLike(query: string, projectIds: string[] | null): Promise<SearchRow[]> {
    const likePattern = `%${query}%`
    const where: Record<string, unknown> = {
      [Op.or]: [{ title: { [Op.like]: likePattern } }, { bodyMd: { [Op.like]: likePattern } }]
    }

    if (projectIds) {
      where.projectId = { [Op.in]: projectIds }
    }

    const notes = await Note.findAll({
      where,
      attributes: ['id'],
      limit: 50
    })

    return notes.map((note) => ({
      noteId: note.id,
      highlight: null
    }))
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
}

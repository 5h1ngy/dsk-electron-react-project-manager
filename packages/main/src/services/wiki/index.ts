import { randomUUID } from 'node:crypto'
import { setTimeout as delay } from 'node:timers/promises'
import { Op, Sequelize, Transaction } from 'sequelize'

import { AppError, wrapError } from '@main/config/appError'
import { AuditService } from '@main/services/audit'
import {
  createWikiPageSchema,
  updateWikiPageSchema,
  wikiPageIdSchema,
  type CreateWikiPageInput,
  type UpdateWikiPageInput
} from '@main/services/wiki/schemas'
import { mapWikiPageDetails, mapWikiPageSummary, mapWikiRevision } from '@main/services/wiki/helpers'
import type {
  WikiPageDetailsDTO,
  WikiPageSummaryDTO,
  WikiRevisionDTO
} from '@main/services/wiki/types'
import type { ServiceActor } from '@main/services/types'
import { WikiPage } from '@main/models/WikiPage'
import { WikiRevision } from '@main/models/WikiRevision'
import { Project } from '@main/models/Project'
import { ProjectMember, type ProjectMembershipRole } from '@main/models/ProjectMember'
import { User } from '@main/models/User'
import { isSystemAdmin, resolveRoleWeight } from '@main/services/project/roles'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const slugify = (value: string): string => {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized.length > 0 ? normalized : 'page'
}

export class WikiService {
private readonly maxTransactionAttempts = 10

  constructor(
    private readonly sequelize: Sequelize,
    private readonly auditService: AuditService
  ) {}

  private async withTransaction<T>(
    handler: (tx: Transaction) => Promise<T>,
    attempt = 0
  ): Promise<T> {
    const transaction = await this.sequelize.transaction()
    try {
      const result = await handler(transaction)
      await transaction.commit()
      return result
    } catch (error) {
      await transaction.rollback()
      if (this.shouldRetryBusy(error, attempt)) {
        await delay(200 * (attempt + 1))
        return await this.withTransaction(handler, attempt + 1)
      }
      throw error
    }
  }

  private shouldRetryBusy(error: unknown, attempt: number): boolean {
    if (attempt >= this.maxTransactionAttempts - 1) {
      return false
    }
    if (!error || typeof error !== 'object') {
      return false
    }
    const candidate = error as { code?: string; message?: string; original?: { code?: string; message?: string } }
    if (candidate.code === 'SQLITE_BUSY' || candidate.original?.code === 'SQLITE_BUSY') {
      return true
    }
    const message = candidate.message ?? candidate.original?.message
    return typeof message === 'string' && message.toLowerCase().includes('sqlite_busy')
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

  private resolveActorRole(
    actor: ServiceActor,
    membershipRole: ProjectMembershipRole | null
  ): ProjectMembershipRole {
    if (isSystemAdmin(actor)) {
      return 'admin'
    }
    return membershipRole ?? 'view'
  }

  private ensureMinimumRole(
    actorRole: ProjectMembershipRole,
    minimum: ProjectMembershipRole
  ): void {
    if (resolveRoleWeight(actorRole) < resolveRoleWeight(minimum)) {
      throw new AppError('ERR_PERMISSION', 'Permessi insufficienti per questa operazione')
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

    const membership = await this.loadMembership(projectId, actor.userId, transaction)
    const actorRole = this.resolveActorRole(actor, membership?.role ?? null)
    this.ensureMinimumRole(actorRole, minimumRole)

    return { project, role: actorRole }
  }

  private async loadPageByIdentifier(
    projectId: string,
    identifier: string,
    transaction?: Transaction
  ): Promise<WikiPage> {
    const where: Record<string, unknown> = { projectId }
    if (UUID_REGEX.test(identifier)) {
      where.id = identifier
    } else {
      where.slug = identifier
    }

    const page = await WikiPage.findOne({
      where,
      include: [
        { model: User, as: 'createdByUser', attributes: ['id', 'username', 'displayName'] },
        { model: User, as: 'updatedByUser', attributes: ['id', 'username', 'displayName'] }
      ],
      transaction
    })

    if (!page) {
      throw new AppError('ERR_NOT_FOUND', 'Pagina wiki non trovata')
    }

    return page
  }

  private async ensureUniqueSlug(
    projectId: string,
    title: string,
    transaction: Transaction,
    excludePageId?: string
  ): Promise<string> {
    const base = slugify(title)
    let candidate = base
    let counter = 2

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const where: Record<string, unknown> = { projectId, slug: candidate }
      if (excludePageId) {
        where.id = { [Op.ne]: excludePageId }
      }
      const existing = await WikiPage.findOne({ where, transaction })
      if (!existing) {
        return candidate
      }
      candidate = `${base}-${counter}`
      counter += 1
    }
  }

  async listPages(actor: ServiceActor, projectId: string): Promise<WikiPageSummaryDTO[]> {
    try {
      await this.resolveProjectAccess(actor, projectId, 'view')
      const pages = await WikiPage.findAll({
        where: { projectId },
        order: [
          ['displayOrder', 'ASC'],
          ['title', 'ASC']
        ],
        include: [
          { model: User, as: 'updatedByUser', attributes: ['id', 'username', 'displayName'] }
        ]
      })

      return pages.map(mapWikiPageSummary)
    } catch (error) {
      throw wrapError(error)
    }
  }

  async getPage(
    actor: ServiceActor,
    projectId: string,
    pageIdOrSlug: string
  ): Promise<WikiPageDetailsDTO> {
    try {
      await this.resolveProjectAccess(actor, projectId, 'view')
      const page = await this.loadPageByIdentifier(projectId, pageIdOrSlug)
      return mapWikiPageDetails(page)
    } catch (error) {
      throw wrapError(error)
    }
  }

  async createPage(
    actor: ServiceActor,
    projectId: string,
    payload: unknown
  ): Promise<WikiPageDetailsDTO> {
    let input: CreateWikiPageInput
    try {
      input = createWikiPageSchema.parse(payload)
    } catch (error) {
      throw new AppError('ERR_VALIDATION', 'Dati pagina non validi', { cause: error })
    }

    try {
      return await this.withTransaction(async (transaction) => {
        await this.resolveProjectAccess(actor, projectId, 'edit', transaction)

        const maxOrder = await WikiPage.max('display_order', {
          where: { projectId },
          transaction
        })
        const nextOrder = Number.isFinite(Number(maxOrder)) ? Number(maxOrder) + 1 : 0
        const slug = await this.ensureUniqueSlug(projectId, input.title, transaction)

        const page = await WikiPage.create(
          {
            id: randomUUID(),
            projectId,
            title: input.title.trim(),
            slug,
            summary: input.summary?.trim() ?? null,
            contentMd: input.content,
            displayOrder: nextOrder,
            createdBy: actor.userId,
            updatedBy: actor.userId
          },
          { transaction }
        )

        await WikiRevision.create(
          {
            id: randomUUID(),
            pageId: page.id,
            title: page.title,
            summary: page.summary ?? null,
            contentMd: page.contentMd,
            createdBy: actor.userId
          },
          { transaction }
        )

        const loaded = await this.loadPageByIdentifier(projectId, page.id, transaction)
        await this.auditService.record(
          actor.userId,
          'wiki_page',
          page.id,
          'create',
          { projectId },
          { transaction }
        )
        return mapWikiPageDetails(loaded)
      })
    } catch (error) {
      throw wrapError(error)
    }
  }

  async updatePage(
    actor: ServiceActor,
    projectId: string,
    pageId: string,
    payload: unknown
  ): Promise<WikiPageDetailsDTO> {
    if (!wikiPageIdSchema.safeParse(pageId).success) {
      throw new AppError('ERR_VALIDATION', 'Identificativo pagina non valido')
    }

    let input: UpdateWikiPageInput
    try {
      input = updateWikiPageSchema.parse(payload)
    } catch (error) {
      throw new AppError('ERR_VALIDATION', 'Dati pagina non validi', { cause: error })
    }

    try {
      return await this.withTransaction(async (transaction) => {
        await this.resolveProjectAccess(actor, projectId, 'edit', transaction)
        const page = await this.loadPageByIdentifier(projectId, pageId, transaction)

        const slug = await this.ensureUniqueSlug(projectId, input.title, transaction, page.id)

        await WikiRevision.create(
          {
            id: randomUUID(),
            pageId: page.id,
            title: page.title,
            summary: page.summary ?? null,
            contentMd: page.contentMd,
            createdBy: actor.userId
          },
          { transaction }
        )

        page.title = input.title.trim()
        page.slug = slug
        page.summary = input.summary?.trim() ?? null
        page.contentMd = input.content
        page.updatedBy = actor.userId
        await page.save({ transaction })

        const reloaded = await this.loadPageByIdentifier(projectId, page.id, transaction)
        await this.auditService.record(
          actor.userId,
          'wiki_page',
          page.id,
          'update',
          { projectId },
          { transaction }
        )
        return mapWikiPageDetails(reloaded)
      })
    } catch (error) {
      throw wrapError(error)
    }
  }

  async deletePage(actor: ServiceActor, projectId: string, pageId: string): Promise<void> {
    if (!wikiPageIdSchema.safeParse(pageId).success) {
      throw new AppError('ERR_VALIDATION', 'Identificativo pagina non valido')
    }

    try {
      await this.withTransaction(async (transaction) => {
        const { role } = await this.resolveProjectAccess(actor, projectId, 'edit', transaction)
        if (resolveRoleWeight(role) < resolveRoleWeight('admin')) {
          throw new AppError('ERR_PERMISSION', 'Permessi insufficienti per eliminare la pagina')
        }
        const page = await this.loadPageByIdentifier(projectId, pageId, transaction)
        await WikiRevision.destroy({ where: { pageId: page.id }, transaction })
        await page.destroy({ transaction })
        await this.auditService.record(
          actor.userId,
          'wiki_page',
          page.id,
          'delete',
          {
            projectId
          },
          { transaction }
        )
      })
    } catch (error) {
      throw wrapError(error)
    }
  }

  async listRevisions(
    actor: ServiceActor,
    projectId: string,
    pageId: string
  ): Promise<WikiRevisionDTO[]> {
    if (!wikiPageIdSchema.safeParse(pageId).success) {
      throw new AppError('ERR_VALIDATION', 'Identificativo pagina non valido')
    }

    try {
      await this.resolveProjectAccess(actor, projectId, 'view')
      await this.loadPageByIdentifier(projectId, pageId)
      const revisions = await WikiRevision.findAll({
        where: { pageId },
        order: [['createdAt', 'DESC']],
        include: [{ model: User, as: 'author', attributes: ['id', 'username', 'displayName'] }],
        limit: 50
      })
      return revisions.map(mapWikiRevision)
    } catch (error) {
      throw wrapError(error)
    }
  }

  async restoreRevision(
    actor: ServiceActor,
    projectId: string,
    pageId: string,
    revisionId: string
  ): Promise<WikiPageDetailsDTO> {
    if (!wikiPageIdSchema.safeParse(pageId).success) {
      throw new AppError('ERR_VALIDATION', 'Identificativo pagina non valido')
    }
    if (!wikiPageIdSchema.safeParse(revisionId).success) {
      throw new AppError('ERR_VALIDATION', 'Identificativo revisione non valido')
    }

    try {
      return await this.withTransaction(async (transaction) => {
        await this.resolveProjectAccess(actor, projectId, 'edit', transaction)
        const page = await this.loadPageByIdentifier(projectId, pageId, transaction)
        const revision = await WikiRevision.findOne({
          where: { id: revisionId, pageId },
          transaction
        })
        if (!revision) {
          throw new AppError('ERR_NOT_FOUND', 'Revisione non trovata')
        }

        await WikiRevision.create(
          {
            id: randomUUID(),
            pageId: page.id,
            title: page.title,
            summary: page.summary ?? null,
            contentMd: page.contentMd,
            createdBy: actor.userId
          },
          { transaction }
        )

        page.title = revision.title
        page.summary = revision.summary ?? null
        page.contentMd = revision.contentMd
        page.updatedBy = actor.userId
        page.slug = await this.ensureUniqueSlug(projectId, page.title, transaction, page.id)
        await page.save({ transaction })

        const loaded = await this.loadPageByIdentifier(projectId, page.id, transaction)
        await this.auditService.record(
          actor.userId,
          'wiki_page',
          page.id,
          'restore_revision',
          {
            projectId,
            revisionId
          },
          { transaction }
        )
        return mapWikiPageDetails(loaded)
      })
    } catch (error) {
      throw wrapError(error)
    }
  }
}

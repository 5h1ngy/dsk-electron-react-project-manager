import { randomUUID } from 'node:crypto'
import type { Sequelize, Transaction } from 'sequelize'

import { AppError, wrapError } from '@services/config/appError'
import { AuditService } from '@services/services/audit'
import {
  createViewSchema,
  listViewsSchema,
  updateViewSchema,
  viewColumnsSchema,
  viewFilterSchema,
  viewIdSchema,
  viewSortSchema,
  VIEW_COLUMN_VALUES
} from '@services/services/view/schemas'
import type { SavedViewDTO } from '@services/services/view/types'
import type { ServiceActor } from '@services/services/types'
import { View } from '@services/models/View'
import { Project } from '@services/models/Project'
import { ProjectMember, type ProjectMembershipRole } from '@services/models/ProjectMember'
import { isSystemAdmin } from '@services/services/project/roles'

const DEFAULT_COLUMNS = Array.from(VIEW_COLUMN_VALUES)

const mapView = (view: View): SavedViewDTO => {
  const filters = viewFilterSchema.parse(view.queryState)
  const sort = view.sortState ? viewSortSchema.parse(view.sortState) : null
  const columns = view.columnsState ? viewColumnsSchema.parse(view.columnsState) : DEFAULT_COLUMNS

  const createdAt =
    view.createdAt instanceof Date
      ? view.createdAt.toISOString()
      : new Date(view.createdAt ?? Date.now()).toISOString()
  const updatedAt =
    view.updatedAt instanceof Date
      ? view.updatedAt.toISOString()
      : new Date(view.updatedAt ?? Date.now()).toISOString()

  return {
    id: view.id,
    projectId: view.projectId,
    userId: view.userId,
    name: view.name,
    filters,
    sort,
    columns,
    createdAt,
    updatedAt
  }
}

export class ViewService {
  constructor(
    private readonly sequelize: Sequelize,
    private readonly auditService: AuditService
  ) {}

  async listViews(actor: ServiceActor, payload: unknown): Promise<SavedViewDTO[]> {
    try {
      const { projectId } = listViewsSchema.parse(payload)
      await this.ensureProjectAccess(actor, projectId, 'view')

      const views = await View.findAll({
        where: {
          projectId,
          userId: actor.userId
        },
        order: [['updatedAt', 'DESC']]
      })

      return views.map(mapView)
    } catch (error) {
      throw wrapError(error)
    }
  }

  async createView(actor: ServiceActor, payload: unknown): Promise<SavedViewDTO> {
    try {
      const input = await createViewSchema.parseAsync(payload)
      await this.ensureProjectAccess(actor, input.projectId, 'view')

      return await this.withTransaction(async (transaction) => {
        const view = await View.create(
          {
            id: randomUUID(),
            projectId: input.projectId,
            userId: actor.userId,
            name: input.name,
            queryState: input.filters,
            sortState: input.sort ?? null,
            columnsState: input.columns ?? DEFAULT_COLUMNS
          },
          { transaction }
        )

        await this.auditService.record(
          actor.userId,
          'view',
          view.id,
          'create',
          {
            projectId: view.projectId,
            name: view.name
          },
          { transaction }
        )

        return mapView(view)
      })
    } catch (error) {
      throw wrapError(error)
    }
  }

  async updateView(actor: ServiceActor, viewId: string, payload: unknown): Promise<SavedViewDTO> {
    try {
      viewIdSchema.parse({ viewId })
      const input = await updateViewSchema.parseAsync(payload)

      return await this.withTransaction(async (transaction) => {
        const view = await View.findByPk(viewId, { transaction })
        if (!view) {
          throw new AppError('ERR_NOT_FOUND', 'Vista salvata non trovata')
        }
        await this.ensureProjectAccess(actor, view.projectId, 'view')
        this.ensureOwnership(actor, view.userId)

        const diff: Record<string, unknown> = {}

        if (input.name && input.name !== view.name) {
          view.name = input.name
          diff.name = input.name
        }
        if (input.filters) {
          view.queryState = input.filters
          diff.filters = input.filters
        }
        if ('sort' in input) {
          view.sortState = input.sort ?? null
          diff.sort = input.sort ?? null
        }
        if (input.columns) {
          view.columnsState = input.columns
          diff.columns = input.columns
        }

        await view.save({ transaction })
        await this.auditService.record(actor.userId, 'view', view.id, 'update', diff, {
          transaction
        })

        await view.reload({ transaction })
        return mapView(view)
      })
    } catch (error) {
      throw wrapError(error)
    }
  }

  async deleteView(actor: ServiceActor, viewId: string): Promise<void> {
    try {
      viewIdSchema.parse({ viewId })

      await this.withTransaction(async (transaction) => {
        const view = await View.findByPk(viewId, { transaction })
        if (!view) {
          throw new AppError('ERR_NOT_FOUND', 'Vista salvata non trovata')
        }
        await this.ensureProjectAccess(actor, view.projectId, 'view')
        this.ensureOwnership(actor, view.userId)

        await view.destroy({ transaction })
        await this.auditService.record(actor.userId, 'view', view.id, 'delete', null, {
          transaction
        })
      })
    } catch (error) {
      throw wrapError(error)
    }
  }

  private async ensureProjectAccess(
    actor: ServiceActor,
    projectId: string,
    minimumRole: ProjectMembershipRole
  ): Promise<void> {
    const project = await Project.findByPk(projectId)
    if (!project) {
      throw new AppError('ERR_NOT_FOUND', 'Progetto non trovato')
    }

    if (isSystemAdmin(actor)) {
      return
    }

    const membership = await ProjectMember.findOne({
      where: { projectId, userId: actor.userId }
    })

    if (!membership) {
      throw new AppError('ERR_PERMISSION', 'Accesso negato al progetto richiesto')
    }

    const allowedRoles: ProjectMembershipRole[] =
      minimumRole === 'admin'
        ? ['admin']
        : minimumRole === 'edit'
          ? ['admin', 'edit']
          : ['admin', 'edit', 'view']

    if (!allowedRoles.includes(membership.role)) {
      throw new AppError('ERR_PERMISSION', 'Permessi insufficienti per gestire le viste')
    }
  }

  private ensureOwnership(actor: ServiceActor, ownerId: string): void {
    if (actor.userId !== ownerId && !isSystemAdmin(actor)) {
      throw new AppError(
        'ERR_PERMISSION',
        'Non Ã¨ possibile modificare viste salvate da un altro utente'
      )
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
}

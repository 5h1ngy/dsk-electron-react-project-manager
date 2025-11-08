import { randomUUID } from 'node:crypto'
import { AuditLog } from '@services/models/AuditLog'
import { logger } from '@services/config/logger'
import type { Transaction } from 'sequelize'

export class AuditService {
  async record(
    userId: string | null,
    entity: string,
    entityId: string,
    action: string,
    diff: unknown = null,
    options: { transaction?: Transaction } = {}
  ): Promise<void> {
    await AuditLog.create(
      {
        id: randomUUID(),
        userId,
        entity,
        entityId,
        action,
        diffJSON: diff ? JSON.stringify(diff) : null,
        createdAt: new Date()
      },
      { transaction: options.transaction }
    )
    logger.debug(`Audit recorded for ${entity} ${action}`, 'Audit')
  }
}

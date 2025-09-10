import { randomUUID } from 'node:crypto'
import { AuditLog } from '@main/models/AuditLog'
import { logger } from '@main/config/logger'

export class AuditService {
  async record(
    userId: string | null,
    entity: string,
    entityId: string,
    action: string,
    diff: unknown = null
  ): Promise<void> {
    await AuditLog.create({
      id: randomUUID(),
      userId,
      entity,
      entityId,
      action,
      diffJSON: diff ? JSON.stringify(diff) : null,
      createdAt: new Date()
    })
    logger.debug(`Audit recorded for ${entity} ${action}`, 'Audit')
  }
}

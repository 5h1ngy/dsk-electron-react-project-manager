import 'reflect-metadata'

import { logger } from '@services/config/logger'
import { initializeDatabase } from '@services/config/database'
import type { DatabaseInitializationOptions } from '@services/config/database.types'
import { resolveAppStoragePath } from '@services/config/storagePath'
import {
  createDomainContext,
  teardownDomainContext,
  type DomainContext,
  type DomainContextOptions
} from '@services/runtime/domainContext'

export interface ApiBootstrapOptions {
  storagePath?: string
  enableSqlLogging?: boolean
  domainOptions?: Partial<Omit<DomainContextOptions, 'sequelize'>>
}

export interface ApiRuntime {
  storagePath: string
  domain: DomainContext
  shutdown(): Promise<void>
}

export const bootstrapDomain = async (options: ApiBootstrapOptions = {}): Promise<ApiRuntime> => {
  const storagePath =
    options.storagePath ??
    resolveAppStoragePath({
      overridePath: process.env.DB_STORAGE_PATH
    })

  const databaseOptions: DatabaseInitializationOptions = {
    resolveStoragePath: () => storagePath,
    logging: options.enableSqlLogging ?? false
  }

  logger.info(`Initializing API database at ${storagePath}`, 'API')
  const sequelize = await initializeDatabase(databaseOptions)
  const domain = createDomainContext({
    sequelize,
    ...options.domainOptions
  })

  return {
    storagePath,
    domain,
    async shutdown() {
      logger.info('Shutting down API domain context', 'API')
      await teardownDomainContext(domain)
    }
  }
}

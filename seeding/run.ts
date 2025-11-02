import type { Sequelize } from 'sequelize-typescript'

import { DatabaseManager } from '../packages/main/src/config/database'
import { logger } from '../packages/main/src/config/logger'
import { resolveAppStoragePath } from '../packages/main/src/config/storagePath'
import { DevelopmentSeeder } from './DevelopmentSeeder'
import type { DevelopmentSeederOptions } from './DevelopmentSeeder.types'

const SEED_LOG_CONTEXT = 'Seed' as const

export const seedDevData = async (
  sequelize: Sequelize,
  options?: DevelopmentSeederOptions
): Promise<void> => {
  await new DevelopmentSeeder(sequelize, options).run()
}

type DatabaseManagerContract = Pick<DatabaseManager, 'initialize'>
type SeedLogger = Pick<typeof logger, 'info' | 'success' | 'error'>

export interface SeedCommandDependencies {
  resolveStoragePath: typeof resolveAppStoragePath
  createDatabaseManager: (storagePath: string) => DatabaseManagerContract
  seed: typeof seedDevData
  logger: SeedLogger
}

const createDefaultDependencies = (): SeedCommandDependencies => ({
  resolveStoragePath: resolveAppStoragePath,
  createDatabaseManager: (storagePath) =>
    new DatabaseManager({
      resolveStoragePath: () => storagePath,
      logging: true
    }),
  seed: seedDevData,
  logger
})

export class SeedCommand {
  private readonly deps: SeedCommandDependencies

  constructor(overrides: Partial<SeedCommandDependencies> = {}) {
    this.deps = { ...createDefaultDependencies(), ...overrides }
  }

  async execute(): Promise<void> {
    const { resolveStoragePath, logger: seedLogger, createDatabaseManager, seed } = this.deps
    const overridePath = process.env.DB_STORAGE_PATH?.trim()
    const storagePath = resolveStoragePath({
      overridePath: overridePath && overridePath.length > 0 ? overridePath : null
    })
    seedLogger.info(`Using database at: ${storagePath}`, SEED_LOG_CONTEXT)

    const manager = createDatabaseManager(storagePath)
    const sequelize = await manager.initialize()

    try {
      await seed(sequelize)
      seedLogger.success('Database seeding completed successfully', SEED_LOG_CONTEXT)
    } finally {
      await sequelize.close()
    }
  }
}

export interface SeedCliOptions {
  command?: SeedCommand
  logger?: SeedLogger
  exit?: (code: number) => never | void
}

export const runSeedCli = (options: SeedCliOptions = {}): Promise<void> => {
  const seedLogger = options.logger ?? logger
  const command =
    options.command ??
    new SeedCommand({
      logger: seedLogger
    })
  const exit = options.exit ?? process.exit

  return command.execute().catch((error) => {
    seedLogger.error('Database seeding failed', SEED_LOG_CONTEXT, error)
    exit(1)
  })
}

if (require.main === module) {
  void runSeedCli()
}

import type { Sequelize } from 'sequelize-typescript'

import { DatabaseManager } from '@services/config/database'
import { logger } from '@services/config/logger'
import { resolveAppStoragePath } from '@services/config/storagePath'
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
  argv?: string[]
}

interface RemoteSeedArgs {
  host?: string
  port?: number
}

interface RemoteSeedTarget {
  host: string
  port: number
}

const parseRemoteSeedArgs = (argv: string[]): RemoteSeedArgs => {
  const result: RemoteSeedArgs = {}
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index]
    if ((value === '--port' || value === '-p') && argv[index + 1]) {
      result.port = Number(argv[index + 1])
      index += 1
    } else if ((value === '--host' || value === '-h') && argv[index + 1]) {
      result.host = argv[index + 1]
      index += 1
    }
  }
  return result
}

const resolveRemoteTarget = (args: RemoteSeedArgs): RemoteSeedTarget | null => {
  const envPort = process.env.SEED_API_PORT ? Number(process.env.SEED_API_PORT) : undefined
  const port = args.port ?? envPort
  if (!port || Number.isNaN(port)) {
    return null
  }
  const host = args.host ?? process.env.SEED_API_HOST ?? 'localhost'
  return { host, port }
}

const triggerRemoteSeed = async (
  target: RemoteSeedTarget,
  seedLogger: SeedLogger
): Promise<void> => {
  const endpoint = new URL('/seed', `http://${target.host}:${target.port}`)
  seedLogger.info(
    `Triggering remote seeding on ${endpoint.toString()}`,
    SEED_LOG_CONTEXT
  )

  const response = await fetch(endpoint, { method: 'POST' })
  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(
      `Remote seeding failed (${response.status} ${response.statusText}) ${detail}`.trim()
    )
  }

  seedLogger.success('Remote API seeding completed successfully', SEED_LOG_CONTEXT)
}

export const runSeedCli = (options: SeedCliOptions = {}): Promise<void> => {
  const seedLogger = options.logger ?? logger
  const argv = options.argv ?? process.argv.slice(2)
  const remoteArgs = parseRemoteSeedArgs(argv)
  const remoteTarget = resolveRemoteTarget(remoteArgs)
  const exit = options.exit ?? process.exit

  if (remoteTarget) {
    return triggerRemoteSeed(remoteTarget, seedLogger).catch((error) => {
      seedLogger.error('Remote seeding failed', SEED_LOG_CONTEXT, error)
      exit(1)
    })
  }

  const command =
    options.command ??
    new SeedCommand({
      logger: seedLogger
    })

  return command.execute().catch((error) => {
    seedLogger.error('Database seeding failed', SEED_LOG_CONTEXT, error)
    exit(1)
  })
}

if (require.main === module) {
  void runSeedCli()
}

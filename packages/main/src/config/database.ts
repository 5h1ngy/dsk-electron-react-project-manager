import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { Sequelize } from 'sequelize-typescript'
import { Umzug, SequelizeStorage } from 'umzug'
import type { QueryInterface } from 'sequelize'
import { MigrationMeta } from '../db/models/MigrationMeta'
import { SystemSetting } from '../db/models/SystemSetting'
import { Role } from '../db/models/Role'
import { User } from '../db/models/User'
import { UserRole } from '../db/models/UserRole'
import { AuditLog } from '../db/models/AuditLog'
import { Project } from '../db/models/Project'
import { ProjectMember } from '../db/models/ProjectMember'
import { ProjectTag } from '../db/models/ProjectTag'
import { Task } from '../db/models/Task'
import { Comment } from '../db/models/Comment'
import { migrations } from '../db/migrations'
import type { DatabaseInitializationOptions } from './database.types'
import { logger } from './logger'

export const MIGRATIONS_TABLE = 'migrations'

/**
 * Coordinates database creation/migration while keeping the procedural
 * interface backward compatible for existing call sites.
 */
export class DatabaseManager {
  private readonly options: DatabaseInitializationOptions

  constructor(options: DatabaseInitializationOptions) {
    this.options = options
  }

  /**
   * Creates a fully configured Sequelize instance, ensuring the target
   * directory for the SQLite file exists before connecting.
   */
  createInstance(): Sequelize {
    const storagePath = this.options.resolveStoragePath()
    logger.debug(`Opening SQLite storage at ${storagePath}`, 'Database')
    mkdirSync(dirname(storagePath), { recursive: true })

    return new Sequelize({
      dialect: 'sqlite',
      storage: storagePath,
      models: DatabaseManager.models,
      logging: this.options.logging ?? false
    })
  }

  /**
   * Builds a migrator that shares the Sequelize connection, so migrations run
   * within the same transaction scope and logging configuration.
   */
  private static createMigrator(sequelize: Sequelize): Umzug<QueryInterface> {
    return new Umzug<QueryInterface>({
      migrations,
      context: sequelize.getQueryInterface(),
      storage: new SequelizeStorage({
        sequelize,
        modelName: 'MigrationMeta',
        tableName: MIGRATIONS_TABLE
      }),
      logger: undefined
    })
  }

  /**
   * Applies pending migrations against the provided Sequelize instance.
   */
  static async runMigrations(sequelize: Sequelize): Promise<void> {
    const migrator = DatabaseManager.createMigrator(sequelize)
    logger.debug('Applying pending migrations', 'Database')
    await migrator.up()
    logger.success('Migrations applied', 'Database')
  }

  /**
   * Authenticates the connection, enforces FK constraints, runs migrations and
   * hands the ready-to-use Sequelize instance back to the caller.
   */
  async initialize(): Promise<Sequelize> {
    const sequelize = this.createInstance()
    await sequelize.authenticate()
    await sequelize.query('PRAGMA foreign_keys = ON;')
    logger.debug('Foreign key constraints enabled', 'Database')
    await DatabaseManager.runMigrations(sequelize)
    logger.success('Database ready', 'Database')
    return sequelize
  }

  private static readonly models = [
    MigrationMeta,
    SystemSetting,
    Role,
    User,
    UserRole,
    AuditLog,
    Project,
    ProjectMember,
    ProjectTag,
    Task,
    Comment
  ]
}

export const createSequelizeInstance = (options: DatabaseInitializationOptions): Sequelize =>
  new DatabaseManager(options).createInstance()

export const runMigrations = async (sequelize: Sequelize): Promise<void> =>
  DatabaseManager.runMigrations(sequelize)

export const initializeDatabase = async (
  options: DatabaseInitializationOptions
): Promise<Sequelize> => new DatabaseManager(options).initialize()

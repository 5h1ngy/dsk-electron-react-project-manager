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

export interface DatabaseInitializationOptions {
  resolveStoragePath: () => string
  logging?: boolean
}

export const MIGRATIONS_TABLE = 'migrations'

export const createSequelizeInstance = (options: DatabaseInitializationOptions): Sequelize => {
  const storagePath = options.resolveStoragePath()
  mkdirSync(dirname(storagePath), { recursive: true })

  return new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    models: [
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
    ],
    logging: options.logging ?? false
  })
}

export const runMigrations = async (sequelize: Sequelize): Promise<void> => {
  const migrator = new Umzug<QueryInterface>({
    migrations,
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({
      sequelize,
      modelName: 'MigrationMeta',
      tableName: MIGRATIONS_TABLE
    }),
    logger: undefined
  })

  await migrator.up()
}

export const initializeDatabase = async (
  options: DatabaseInitializationOptions
): Promise<Sequelize> => {
  const sequelize = createSequelizeInstance(options)

  await sequelize.authenticate()
  await sequelize.query('PRAGMA foreign_keys = ON;')

  await runMigrations(sequelize)

  return sequelize
}



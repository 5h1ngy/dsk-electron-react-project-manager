import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { Sequelize } from 'sequelize-typescript'
import { Umzug, SequelizeStorage } from 'umzug'
import type { QueryInterface } from 'sequelize'
import { MigrationMeta } from './models/MigrationMeta'
import { SystemSetting } from './models/SystemSetting'
import { Role } from './models/Role'
import { User } from './models/User'
import { UserRole } from './models/UserRole'
import { AuditLog } from './models/AuditLog'
import { Project } from './models/Project'
import { ProjectMember } from './models/ProjectMember'
import { ProjectTag } from './models/ProjectTag'
import { Task } from './models/Task'
import { Comment } from './models/Comment'
import { migrations } from './migrations'

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



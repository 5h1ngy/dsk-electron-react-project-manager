import { randomUUID } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { Sequelize } from 'sequelize-typescript'
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
import type { DatabaseInitializationOptions } from './database.types'
import { logger } from './logger'
import { ROLE_NAMES } from '../services/auth/constants'
import { hashPassword } from '../services/auth/password'

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
   * Authenticates the connection, enforces FK constraints, syncs schema and
   * hands the ready-to-use Sequelize instance back to the caller.
   */
  async initialize(): Promise<Sequelize> {
    const sequelize = this.createInstance()
    await sequelize.authenticate()
    await sequelize.query('PRAGMA foreign_keys = ON;')
    logger.debug('Foreign key constraints enabled', 'Database')
    logger.debug('Synchronizing Sequelize models with storage', 'Database')
    await sequelize.sync()
    await this.ensureCoreData()
    logger.success('Database ready', 'Database')
    return sequelize
  }

  private static readonly models = [
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

  private async ensureCoreData(): Promise<void> {
    await this.ensureRoles()
    await this.ensureAdminUser()
  }

  private async ensureRoles(): Promise<void> {
    const existingRoles = await Role.findAll({
      where: { name: ROLE_NAMES }
    })
    const existingNames = new Set(existingRoles.map((role) => role.name))
    const missing = ROLE_NAMES.filter((name) => !existingNames.has(name))
    if (!missing.length) {
      return
    }
    logger.warn(`Missing base roles detected, seeding: ${missing.join(', ')}`, 'Database')
    await Role.bulkCreate(
      missing.map((name) => ({
        id: randomUUID(),
        name,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    )
  }

  private async ensureAdminUser(): Promise<void> {
    const existingAdmin = await User.findOne({ where: { username: 'admin' } })
    if (existingAdmin) {
      return
    }
    const adminRole = await Role.findOne({ where: { name: 'Admin' } })
    if (!adminRole) {
      throw new Error('Admin role missing; cannot create default admin user')
    }
    const passwordHash = await hashPassword('changeme!')
    const adminUser = await User.create({
      id: randomUUID(),
      username: 'admin',
      displayName: 'Administrator',
      passwordHash,
      isActive: true
    })

    await UserRole.create({
      userId: adminUser.id,
      roleId: adminRole.id,
      createdAt: new Date()
    })

    logger.warn('No admin user found; created default admin account (changeme!)', 'Database')
  }
}

export const createSequelizeInstance = (options: DatabaseInitializationOptions): Sequelize =>
  new DatabaseManager(options).createInstance()

export const initializeDatabase = async (
  options: DatabaseInitializationOptions
): Promise<Sequelize> => new DatabaseManager(options).initialize()

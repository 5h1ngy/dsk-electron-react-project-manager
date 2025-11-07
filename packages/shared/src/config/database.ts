import { randomUUID } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { fn, col, DataTypes } from 'sequelize'
import { Sequelize } from 'sequelize-typescript'
import { SystemSetting } from '@services/models/SystemSetting'
import { Role } from '@services/models/Role'
import { User } from '@services/models/User'
import { UserRole } from '@services/models/UserRole'
import { AuditLog } from '@services/models/AuditLog'
import { Project } from '@services/models/Project'
import { ProjectMember } from '@services/models/ProjectMember'
import { ProjectTag } from '@services/models/ProjectTag'
import { Task } from '@services/models/Task'
import { TaskStatus } from '@services/models/TaskStatus'
import { Comment } from '@services/models/Comment'
import { Note } from '@services/models/Note'
import { NoteTag } from '@services/models/NoteTag'
import { NoteTaskLink } from '@services/models/NoteTaskLink'
import { View } from '@services/models/View'
import { WikiPage } from '@services/models/WikiPage'
import { WikiRevision } from '@services/models/WikiRevision'
import { Sprint } from '@services/models/Sprint'
import { DEFAULT_TASK_STATUSES } from '@services/services/taskStatus/defaults'
import type { DatabaseInitializationOptions } from '@services/config/database.types'
import { logger } from '@services/config/logger'
import { ROLE_NAMES } from '@services/services/auth/constants'
import { DEFAULT_ROLE_DESCRIPTIONS, DEFAULT_ROLE_PERMISSIONS } from '@services/services/roles/constants'
import { hashPassword } from '@services/services/auth/password'
import { RoleService } from '@services/services/roles'
import { AuditService } from '@services/services/audit'

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
    await sequelize.query('PRAGMA busy_timeout = 5000;')
    await sequelize.query('PRAGMA journal_mode = WAL;')
    logger.debug('Foreign key constraints enabled', 'Database')
    logger.debug('Synchronizing Sequelize models with storage', 'Database')
    await sequelize.sync()
    await this.ensureCoreData(sequelize)
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
    Sprint,
    Task,
    TaskStatus,
    Comment,
    Note,
    NoteTag,
    NoteTaskLink,
    View,
    WikiPage,
    WikiRevision
  ]

  private async ensureCoreData(sequelize: Sequelize): Promise<void> {
    await this.ensureRoleSchema(sequelize)
    await this.ensureRoles()
    await this.ensureAdminUser()
    await this.ensureTaskSchema(sequelize)
    await this.ensureTaskStatuses()
    await this.ensureTaskFtsInfrastructure(sequelize)
    await this.ensureNoteFtsInfrastructure(sequelize)
  }

  private async ensureTaskSchema(sequelize: Sequelize): Promise<void> {
    const queryInterface = sequelize.getQueryInterface()
    let tasksTable: Record<string, unknown>

    try {
      tasksTable = await queryInterface.describeTable('tasks')
    } catch (error) {
      logger.warn('Unable to inspect tasks schema; skipping migration checks', 'Database')
      logger.debug(error instanceof Error ? error.message : String(error), 'Database')
      return
    }

    const hasSprintId = Object.prototype.hasOwnProperty.call(tasksTable, 'sprintId')
    const hasEstimatedMinutes = Object.prototype.hasOwnProperty.call(tasksTable, 'estimatedMinutes')

    if (!hasSprintId) {
      logger.warn('Missing tasks.sprintId column detected. Applying schema patch.', 'Database')
      try {
        await queryInterface.addColumn('tasks', 'sprintId', {
          type: DataTypes.STRING(36),
          allowNull: true,
          references: {
            model: 'sprints',
            key: 'id'
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE'
        })
        await queryInterface.addIndex('tasks', ['sprintId'], {
          name: 'tasks_sprintId_idx'
        })
      } catch (error) {
        logger.error(
          `Failed to add tasks.sprintId column: ${
            error instanceof Error ? error.message : String(error)
          }`,
          'Database'
        )
      }
    }

    if (!hasEstimatedMinutes) {
      logger.warn(
        'Missing tasks.estimatedMinutes column detected. Applying schema patch.',
        'Database'
      )
      try {
        await queryInterface.addColumn('tasks', 'estimatedMinutes', {
          type: DataTypes.INTEGER,
          allowNull: true
        })
      } catch (error) {
        logger.error(
          `Failed to add tasks.estimatedMinutes column: ${
            error instanceof Error ? error.message : String(error)
          }`,
          'Database'
        )
      }
    }
  }

  private async ensureRoleSchema(sequelize: Sequelize): Promise<void> {
    const queryInterface = sequelize.getQueryInterface()
    let descriptionExists = false
    let permissionsExists = false

    try {
      const table = await queryInterface.describeTable('roles')
      descriptionExists = Object.prototype.hasOwnProperty.call(table, 'description')
      permissionsExists = Object.prototype.hasOwnProperty.call(table, 'permissions')
    } catch (error) {
      logger.warn('Unable to inspect roles schema; attempting to add missing columns', 'Database')
      logger.debug(error instanceof Error ? error.message : String(error), 'Database')
    }

    if (!descriptionExists) {
      try {
        await queryInterface.addColumn('roles', 'description', {
          type: DataTypes.TEXT,
          allowNull: true
        })
      } catch (error) {
        logger.debug(
          `Skip adding description column: ${error instanceof Error ? error.message : String(error)}`,
          'Database'
        )
      }
    }

    if (!permissionsExists) {
      try {
        await queryInterface.addColumn('roles', 'permissions', {
          type: DataTypes.JSON,
          allowNull: false,
          defaultValue: []
        })
      } catch (error) {
        logger.debug(
          `Skip adding permissions column: ${error instanceof Error ? error.message : String(error)}`,
          'Database'
        )
      }
    }

    const roleService = new RoleService(sequelize, new AuditService())
    await roleService.ensureDefaults()
  }

  private async ensureTaskStatuses(): Promise<void> {
    const projects = await Project.findAll({ attributes: ['id'] })
    if (!projects.length) {
      return
    }

    const defaultStatuses = DEFAULT_TASK_STATUSES

    for (const project of projects) {
      const existingStatuses = await TaskStatus.findAll({
        where: { projectId: project.id },
        order: [['position', 'ASC']]
      })

      if (existingStatuses.length === 0) {
        const distinctTaskStatuses = (await Task.findAll({
          attributes: [[fn('DISTINCT', col('status')), 'status']],
          where: { projectId: project.id },
          raw: true
        })) as Array<{ status: string | null }>

        const existingKeys = new Set(
          distinctTaskStatuses
            .map((row) => row.status)
            .filter((status): status is string => Boolean(status))
        )

        const definitions: Array<{ key: string; label: string }> = []
        for (const status of defaultStatuses) {
          definitions.push(status)
          existingKeys.delete(status.key)
        }
        for (const key of existingKeys) {
          const label = key.replace(/[_-]+/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase())
          definitions.push({ key, label })
        }

        await TaskStatus.bulkCreate(
          definitions.map((definition, index) => ({
            id: randomUUID(),
            projectId: project.id,
            key: definition.key,
            label: definition.label,
            position: index + 1
          }))
        )
        continue
      }

      const existingKeySet = new Set(existingStatuses.map((status) => status.key))
      const maxPosition =
        existingStatuses.reduce((max, status) => Math.max(max, status.position), 0) || 0

      const distinctTaskStatuses = (await Task.findAll({
        attributes: [[fn('DISTINCT', col('status')), 'status']],
        where: { projectId: project.id },
        raw: true
      })) as Array<{ status: string | null }>

      const missingTaskStatuses = distinctTaskStatuses.filter((row): row is { status: string } => {
        if (typeof row.status !== 'string' || row.status.length === 0) {
          return false
        }
        return !existingKeySet.has(row.status)
      })

      const newStatuses: Array<{ key: string; label: string; position: number }> = []
      let nextPosition = maxPosition + 1
      for (const row of missingTaskStatuses) {
        const statusKey = row.status
        if (!statusKey || existingKeySet.has(statusKey)) {
          continue
        }
        const label = statusKey
          .replace(/[_-]+/g, ' ')
          .replace(/\b\w/g, (match) => match.toUpperCase())
        newStatuses.push({
          key: statusKey,
          label,
          position: nextPosition
        })
        existingKeySet.add(statusKey)
        nextPosition += 1
      }

      if (newStatuses.length > 0) {
        await TaskStatus.bulkCreate(
          newStatuses.map((definition) => ({
            id: randomUUID(),
            projectId: project.id,
            key: definition.key,
            label: definition.label,
            position: definition.position
          }))
        )
      }
    }
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
        description: DEFAULT_ROLE_DESCRIPTIONS[name] ?? null,
        permissions: DEFAULT_ROLE_PERMISSIONS[name] ?? [],
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

  private async ensureTaskFtsInfrastructure(sequelize: Sequelize): Promise<void> {
    const statements: string[] = [
      `CREATE VIRTUAL TABLE IF NOT EXISTS tasks_fts USING fts5(
        taskId UNINDEXED,
        title,
        description
      )`,
      `CREATE TRIGGER IF NOT EXISTS tasks_fts_ai AFTER INSERT ON tasks BEGIN
         INSERT INTO tasks_fts(taskId, title, description)
         SELECT new.id, new.title, COALESCE(new.description, '')
         WHERE new.deletedAt IS NULL;
       END`,
      `CREATE TRIGGER IF NOT EXISTS tasks_fts_au AFTER UPDATE ON tasks BEGIN
         DELETE FROM tasks_fts WHERE taskId = old.id;
         INSERT INTO tasks_fts(taskId, title, description)
         SELECT new.id, new.title, COALESCE(new.description, '')
         WHERE new.deletedAt IS NULL;
       END`,
      `CREATE TRIGGER IF NOT EXISTS tasks_fts_ad AFTER DELETE ON tasks BEGIN
         DELETE FROM tasks_fts WHERE taskId = old.id;
       END`
    ]

    for (const statement of statements) {
      await sequelize.query(statement)
    }

    logger.debug('FTS5 infrastructure ensured for tasks table', 'Database')
  }

  private async ensureNoteFtsInfrastructure(sequelize: Sequelize): Promise<void> {
    const statements: string[] = [
      `CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
        noteId UNINDEXED,
        title,
        body
      )`,
      `CREATE TRIGGER IF NOT EXISTS notes_fts_ai AFTER INSERT ON notes BEGIN
         INSERT INTO notes_fts(noteId, title, body)
         SELECT new.id, new.title, COALESCE(new.body_md, '');
       END`,
      `CREATE TRIGGER IF NOT EXISTS notes_fts_au AFTER UPDATE ON notes BEGIN
         DELETE FROM notes_fts WHERE noteId = old.id;
         INSERT INTO notes_fts(noteId, title, body)
         SELECT new.id, new.title, COALESCE(new.body_md, '');
       END`,
      `CREATE TRIGGER IF NOT EXISTS notes_fts_ad AFTER DELETE ON notes BEGIN
         DELETE FROM notes_fts WHERE noteId = old.id;
       END`
    ]

    for (const statement of statements) {
      await sequelize.query(statement)
    }

    logger.debug('FTS5 infrastructure ensured for notes table', 'Database')
  }
}

export const initializeDatabase = async (
  options: DatabaseInitializationOptions
): Promise<Sequelize> => new DatabaseManager(options).initialize()

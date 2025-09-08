import { randomUUID } from 'node:crypto'
import { faker } from '@faker-js/faker'
import { Sequelize } from 'sequelize-typescript'
import { Op, type Transaction } from 'sequelize'

import type { RoleName } from '../packages/main/src/auth/constants'
import { hashPassword } from '../packages/main/src/auth/password'
import { logger } from '../packages/main/src/utils/logger'
import { Role } from '../packages/main/src/db/models/Role'
import { User } from '../packages/main/src/db/models/User'
import { UserRole } from '../packages/main/src/db/models/UserRole'
import { Project } from '../packages/main/src/db/models/Project'
import {
  ProjectMember,
  type ProjectMembershipRole
} from '../packages/main/src/db/models/ProjectMember'
import { ProjectTag } from '../packages/main/src/db/models/ProjectTag'
import { Task, type TaskPriority, type TaskStatus } from '../packages/main/src/db/models/Task'

const PASSWORD_SEED = 'changeme!'
const FAKER_SEED = 20251018
const MIN_PROJECTS = 9
const MAX_PROJECTS = 14
const MIN_TASKS_PER_PROJECT = 12
const MAX_TASKS_PER_PROJECT = 28

const ROLE_PROFILES: ReadonlyArray<{ roles: RoleName[]; count: number }> = [
  { roles: ['Maintainer', 'Contributor'], count: 4 },
  { roles: ['Maintainer'], count: 3 },
  { roles: ['Contributor'], count: 8 },
  { roles: ['Contributor', 'Viewer'], count: 4 },
  { roles: ['Viewer'], count: 5 },
  { roles: ['Maintainer', 'Viewer'], count: 2 }
]

const TAG_CATALOG = [
  'analytics',
  'api',
  'automation',
  'backend',
  'compliance',
  'dashboard',
  'documentation',
  'integration',
  'localization',
  'migration',
  'mobile',
  'observability',
  'performance',
  'platform',
  'qa',
  'refactor',
  'release',
  'research',
  'security',
  'support',
  'ux'
] as const

type WeightedValue<T> = { value: T; weight: number }

const STATUS_WEIGHTS: ReadonlyArray<WeightedValue<TaskStatus>> = [
  { value: 'todo', weight: 5 },
  { value: 'in_progress', weight: 4 },
  { value: 'blocked', weight: 1 },
  { value: 'done', weight: 3 }
]

const PRIORITY_WEIGHTS: ReadonlyArray<WeightedValue<TaskPriority>> = [
  { value: 'low', weight: 2 },
  { value: 'medium', weight: 5 },
  { value: 'high', weight: 3 },
  { value: 'critical', weight: 1 }
]

interface UserSeedDefinition {
  username: string
  displayName: string
  roles: RoleName[]
}

interface ProjectMemberSeed {
  userId: string
  role: ProjectMembershipRole
}

interface TaskSeedDefinition {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
  assigneeId: string | null
}

interface ProjectSeedDefinition {
  key: string
  name: string
  description: string
  createdBy: string
  members: ProjectMemberSeed[]
  tags: string[]
  tasks: TaskSeedDefinition[]
}

export interface DevelopmentSeederOptions {
  fakerSeed?: number
  passwordSeed?: string
}
/**
 * High-level orchestrator that generates deterministic demo data for local use.
 */
export class DevelopmentSeeder {
  private readonly random = faker
  private readonly options: Required<DevelopmentSeederOptions>

  constructor(private readonly sequelize: Sequelize, options: DevelopmentSeederOptions = {}) {
    this.options = {
      fakerSeed: options.fakerSeed ?? FAKER_SEED,
      passwordSeed: options.passwordSeed ?? PASSWORD_SEED
    }
  }

  /**
   * Executes the entire seeding workflow inside a single transaction.
   */
  async run(): Promise<void> {
    this.random.seed(this.options.fakerSeed)

    await this.sequelize.transaction(async (transaction) => {
      const adminUser = await this.findAdminUser(transaction)
      const existingProjects = await Project.count({ transaction })
      if (existingProjects > 0) {
        logger.info(
          `Skipping development data seeding: already ${existingProjects} projects in storage`,
          'Seed'
        )
        return
      }

      logger.info('Seeding development data...', 'Seed')

      const seededUsers: Record<string, User> = { [adminUser.username]: adminUser }
      const userRoles = new Map<string, RoleName[]>([['admin', ['Admin']]])

      const userSeeds = this.generateUserSeeds()
      logger.debug(`Generated ${userSeeds.length} user seeds`, 'Seed')

      let createdUsers = 0
      for (const seed of userSeeds) {
        const result = await this.upsertUser(transaction, seed)
        seededUsers[seed.username] = result.user
        userRoles.set(seed.username, seed.roles)
        if (result.created) {
          createdUsers += 1
        }
      }

      logger.debug(`Upserted ${createdUsers} new users`, 'Seed')

      const projectSeeds = this.generateProjectSeeds(seededUsers, userRoles, adminUser)
      logger.debug(`Generated ${projectSeeds.length} project seeds`, 'Seed')

      let createdProjects = 0
      let taskTotal = 0
      for (const projectSeed of projectSeeds) {
        const project = await this.upsertProject(transaction, projectSeed)
        taskTotal += projectSeed.tasks.length
        if (project) {
          createdProjects += 1
        }
      }

      logger.success(
        `Seed complete: ${createdUsers} users, ${createdProjects} projects, ${taskTotal} tasks`,
        'Seed'
      )
    })
  }

  private async findAdminUser(transaction: Transaction): Promise<User> {
    const admin = await User.findOne({ where: { username: 'admin' }, transaction })
    if (!admin) {
      throw new Error('Default admin user not found; cannot seed data')
    }
    return admin
  }

  private pickWeighted<T>(values: ReadonlyArray<WeightedValue<T>>): T {
    return (this.random.helpers.weightedArrayElement(values) as WeightedValue<T>).value
  }

  private capitalize(value: string): string {
    if (!value) {
      return value
    }
    return value[0].toUpperCase() + value.slice(1)
  }

  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 10)
  }
  private createUniqueUsername(existing: Set<string>): { username: string; displayName: string } {
    let attempts = 0
    while (attempts < 20) {
      const first = this.random.person.firstName()
      const last = this.random.person.lastName()
      const normalized = `${first}.${last}`
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_.-]/g, '')
        .replace(/\.+/g, '.')
        .replace(/^\./, '')
        .replace(/\.$/, '')
        .toLowerCase()
      const base =
        normalized.slice(0, 28) || `user${this.random.number.int({ min: 1000, max: 9999 })}`
      let candidate = base
      let suffix = 1

      while ((candidate.length < 3 || existing.has(candidate)) && suffix < 100) {
        const suffixText = suffix.toString().padStart(2, '0')
        candidate = `${base.slice(0, 32 - suffixText.length)}${suffixText}`
        suffix += 1
      }

      if (!existing.has(candidate) && candidate.length >= 3) {
        existing.add(candidate)
        const displayName = `${this.capitalize(first)} ${this.capitalize(last)}`.slice(0, 64)
        return { username: candidate, displayName }
      }

      attempts += 1
    }

    const fallback = `user${this.random.number.int({ min: 1000, max: 9999 })}`
    existing.add(fallback)
    return { username: fallback, displayName: `User ${fallback.slice(-4)}` }
  }

  private generateUserSeeds(): UserSeedDefinition[] {
    const seeds: UserSeedDefinition[] = []
    const seenUsernames = new Set<string>()

    for (const profile of ROLE_PROFILES) {
      for (let index = 0; index < profile.count; index += 1) {
        const composite = this.createUniqueUsername(seenUsernames)
        seeds.push({
          username: composite.username,
          displayName: composite.displayName,
          roles: [...profile.roles]
        })
      }
    }

    return seeds
  }
  private createUniqueProjectKey(usedKeys: Set<string>): string {
    for (let attempt = 0; attempt < 30; attempt += 1) {
      const length = this.random.number.int({ min: 3, max: 5 })
      const candidate = this.random.string.alpha({ length, casing: 'upper' })
      if (!usedKeys.has(candidate)) {
        usedKeys.add(candidate)
        return candidate
      }
    }

    const fallback = `PRJ${String(usedKeys.size + 1).padStart(3, '0')}`
    usedKeys.add(fallback)
    return fallback
  }

  private buildRolePools(
    seededUsers: Record<string, User>,
    userRoles: Map<string, RoleName[]>
  ): Map<RoleName, User[]> {
    const pools = new Map<RoleName, User[]>()
    for (const [username, user] of Object.entries(seededUsers)) {
      const roles = userRoles.get(username) ?? []
      for (const role of roles) {
        const current = pools.get(role) ?? []
        current.push(user)
        pools.set(role, current)
      }
    }
    return pools
  }

  private addMembersFromPool(
    members: Map<string, ProjectMembershipRole>,
    pools: Map<RoleName, User[]>,
    sourceRole: RoleName,
    membershipRole: ProjectMembershipRole,
    range: { min: number; max: number },
    excludedUserId?: string
  ): void {
    const pool = pools.get(sourceRole) ?? []
    const available = pool.filter(
      (user) => !members.has(user.id) && (!excludedUserId || user.id !== excludedUserId)
    )
    if (!available.length) {
      return
    }

    const max = Math.min(range.max, available.length)
    const min = Math.min(range.min, max)
    if (max === 0) {
      return
    }

    const count = min === max ? max : this.random.number.int({ min, max })
    const selected = this.random.helpers.arrayElements(available, count)
    for (const user of selected) {
      members.set(user.id, membershipRole)
    }
  }

  /**
   * Produces project/task blueprints by combining role pools, weighted
   * priorities and random dates to keep the generated data varied yet coherent.
   */
  private generateProjectSeeds(
    seededUsers: Record<string, User>,
    userRoles: Map<string, RoleName[]>,
    adminUser: User
  ): ProjectSeedDefinition[] {
    const seeds: ProjectSeedDefinition[] = []
    const pools = this.buildRolePools(seededUsers, userRoles)
    const usedKeys = new Set<string>()
    const projectCount = this.random.number.int({ min: MIN_PROJECTS, max: MAX_PROJECTS })

    for (let index = 0; index < projectCount; index += 1) {
      const key = this.createUniqueProjectKey(usedKeys)
      const maintainers = (pools.get('Maintainer') ?? []).filter(
        (user) => user.id !== adminUser.id
      )
      const primaryOwner =
        maintainers.length > 0 ? this.random.helpers.arrayElement(maintainers) : adminUser

      const members = new Map<string, ProjectMembershipRole>()
      members.set(adminUser.id, 'admin')
      members.set(primaryOwner.id, 'admin')

      this.addMembersFromPool(members, pools, 'Maintainer', 'admin', { min: 0, max: 1 }, adminUser.id)
      this.addMembersFromPool(members, pools, 'Contributor', 'edit', { min: 2, max: 5 })
      this.addMembersFromPool(members, pools, 'Viewer', 'view', { min: 1, max: 3 })

      const tags = Array.from(
        new Set(
          this.random.helpers.arrayElements(
            TAG_CATALOG,
            this.random.number.int({ min: 2, max: 5 })
          )
        )
      )

      const assigneeCandidates = Array.from(members.entries())
        .filter(([, role]) => role !== 'view')
        .map(([userId]) => userId)

      const taskCount = this.random.number.int({
        min: MIN_TASKS_PER_PROJECT,
        max: MAX_TASKS_PER_PROJECT
      })
      const tasks: TaskSeedDefinition[] = []

      for (let taskIndex = 0; taskIndex < taskCount; taskIndex += 1) {
        const status = this.pickWeighted(STATUS_WEIGHTS)
        const priority = this.pickWeighted(PRIORITY_WEIGHTS)
        const dueDate = this.random.helpers.maybe(
          () => this.formatDate(this.random.date.soon({ days: 120 })),
          { probability: 0.7 }
        )

        const assigneeId =
          assigneeCandidates.length > 0
            ? (
                this.random.helpers.maybe(
                  () => this.random.helpers.arrayElement(assigneeCandidates),
                  {
                    probability: 0.85
                  }
                ) ?? null
              )
            : null

        tasks.push({
          title: this.buildTaskTitle(),
          description: this.buildTaskDescription(),
          status,
          priority,
          dueDate: dueDate ?? null,
          assigneeId
        })
      }

      seeds.push({
        key,
        name: this.random.company.catchPhrase(),
        description: this.random.lorem.paragraphs({ min: 1, max: 2 }, '\n\n'),
        createdBy: primaryOwner.id,
        members: Array.from(members.entries()).map(([userId, role]) => ({
          userId,
          role
        })),
        tags,
        tasks
      })
    }

    return seeds
  }
  private buildTaskTitle(): string {
    const verb = this.capitalize(this.random.hacker.verb())
    const noun = this.random.hacker.noun().replace(/_/g, ' ')
    const suffix = this.random.helpers.maybe(() => ` (${this.random.hacker.abbreviation()})`, {
      probability: 0.2
    })
    const title = `${verb} ${noun}${suffix ?? ''}`
    return title.slice(0, 160)
  }

  private buildTaskDescription(): string {
    const overview = this.random.lorem.paragraphs({ min: 1, max: 2 }, '\n\n')
    const checklist = this.random.helpers
      .multiple(() => `- ${this.random.hacker.phrase()}`, { count: 3 })
      .join('\n')
    const acceptance = this.random.lorem.sentences({ min: 2, max: 3 })

    return `${overview}\n\n${checklist}\n\n**Acceptance Criteria**\n${acceptance}`
  }
  private async upsertUser(transaction: Transaction, seed: UserSeedDefinition) {
    const existing = await User.findOne({ where: { username: seed.username }, transaction })
    if (existing) {
      logger.debug(`User ${seed.username} already present`, 'Seed')
      return { user: existing, created: false }
    }

    const hashed = await hashPassword(this.options.passwordSeed)
    const user = await User.create(
      {
        id: randomUUID(),
        username: seed.username,
        displayName: seed.displayName,
        passwordHash: hashed,
        isActive: true
      },
      { transaction }
    )

    const dbRoles = await Role.findAll({
      where: {
        name: {
          [Op.in]: seed.roles
        }
      },
      transaction
    })

    await Promise.all(
      dbRoles.map((role) =>
        UserRole.create(
          {
            userId: user.id,
            roleId: role.id,
            createdAt: new Date()
          },
          { transaction }
        )
      )
    )

    logger.debug(`Seeded user ${seed.username} (${seed.roles.join(', ')})`, 'Seed')
    return { user, created: true }
  }

  private async upsertProject(transaction: Transaction, seed: ProjectSeedDefinition) {
    const existing = await Project.findOne({ where: { key: seed.key }, transaction })
    if (existing) {
      logger.debug(`Project ${seed.key} already present, skipping`, 'Seed')
      return null
    }

    const project = await Project.create(
      {
        id: randomUUID(),
        key: seed.key,
        name: seed.name,
        description: seed.description,
        createdBy: seed.createdBy
      },
      { transaction }
    )

    await Promise.all(
      seed.members.map((member) =>
        ProjectMember.create(
          {
            projectId: project.id,
            userId: member.userId,
            role: member.role,
            createdAt: new Date()
          },
          { transaction }
        )
      )
    )

    await ProjectTag.destroy({ where: { projectId: project.id }, transaction })

    await Promise.all(
      seed.tags.map((tag) =>
        ProjectTag.create(
          {
            id: randomUUID(),
            projectId: project.id,
            tag,
            createdAt: new Date()
          },
          { transaction }
        )
      )
    )

    let taskIndex = 1
    for (const taskSeed of seed.tasks) {
      await Task.create(
        {
          id: randomUUID(),
          projectId: project.id,
          key: `${project.key}-${String(taskIndex).padStart(3, '0')}`,
          parentId: null,
          title: taskSeed.title,
          description: taskSeed.description,
          status: taskSeed.status,
          priority: taskSeed.priority,
          dueDate: taskSeed.dueDate,
          assigneeId: taskSeed.assigneeId,
          ownerUserId: seed.createdBy
        },
        { transaction }
      )
      taskIndex += 1
    }

    logger.debug(
      `Seeded project ${seed.key} with ${seed.members.length} members, ${seed.tags.length} tags and ${seed.tasks.length} tasks`,
      'Seed'
    )
    return project
  }
}
export const seedDevData = async (sequelize: Sequelize): Promise<void> => {
  await new DevelopmentSeeder(sequelize).run()
}

import type { Faker } from '@faker-js/faker'

import type { RoleName } from '../packages/main/src/services/auth/constants'
import type { User } from '../packages/main/src/models/User'
import type {
  ProjectSeedDefinition,
  ProjectMemberSeed,
  TaskSeedDefinition
} from './DevelopmentSeeder.types'
import { capitalize, formatIsoDate, pickWeighted, type WeightedValue } from './seed.helpers'

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

const MIN_PROJECTS = 9
const MAX_PROJECTS = 14
const MIN_TASKS_PER_PROJECT = 12
const MAX_TASKS_PER_PROJECT = 28

const STATUS_WEIGHTS: ReadonlyArray<WeightedValue<TaskSeedDefinition['status']>> = [
  { value: 'todo', weight: 5 },
  { value: 'in_progress', weight: 4 },
  { value: 'blocked', weight: 1 },
  { value: 'done', weight: 3 }
] as const

const PRIORITY_WEIGHTS: ReadonlyArray<WeightedValue<TaskSeedDefinition['priority']>> = [
  { value: 'low', weight: 2 },
  { value: 'medium', weight: 5 },
  { value: 'high', weight: 3 },
  { value: 'critical', weight: 1 }
] as const

export class ProjectSeedFactory {
  constructor(private readonly random: Faker) {}

  createSeeds(
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

      const members = new Map<string, ProjectMemberSeed['role']>()
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
        const status = pickWeighted(this.random, STATUS_WEIGHTS)
        const priority = pickWeighted(this.random, PRIORITY_WEIGHTS)
        const dueDate = this.random.helpers.maybe(
          () => formatIsoDate(this.random.date.soon({ days: 120 })),
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
        members: Array.from(members.entries()).map(([userId, role]) => ({ userId, role })),
        tags,
        tasks
      })
    }

    return seeds
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

  private addMembersFromPool(
    members: Map<string, ProjectMemberSeed['role']>,
    pools: Map<RoleName, User[]>,
    sourceRole: RoleName,
    membershipRole: ProjectMemberSeed['role'],
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

  private buildTaskTitle(): string {
    const verb = capitalize(this.random.hacker.verb())
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
}

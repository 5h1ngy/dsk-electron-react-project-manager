import { faker } from '@faker-js/faker'
import type { Sequelize } from 'sequelize-typescript'
import type { Transaction } from 'sequelize'

import { logger } from '../packages/main/src/config/logger'
import { Project } from '../packages/main/src/models/Project'
import { User } from '../packages/main/src/models/User'

import type {
  DevelopmentSeederOptions,
  ProjectSeedDefinition,
  SeederState
} from './DevelopmentSeeder.types'
import { ProjectSeeder } from './ProjectSeeder'
import { ProjectSeedFactory } from './ProjectSeedFactory'
import { UserSeedFactory } from './UserSeedFactory'
import { UserSeeder } from './UserSeeder'
import { loadSeedConfig, type SeedConfig } from './seedConfig'

const DEFAULT_OPTIONS: Required<DevelopmentSeederOptions> = {
  fakerSeed: 20251018,
  passwordSeed: 'changeme!'
}

export class DevelopmentSeeder {
  private readonly random = faker
  private readonly options: Required<DevelopmentSeederOptions>
  private readonly config: SeedConfig
  private readonly userFactory: UserSeedFactory
  private readonly projectFactory: ProjectSeedFactory
  private readonly userSeeder: UserSeeder
  private readonly projectSeeder: ProjectSeeder

  constructor(private readonly sequelize: Sequelize, options: DevelopmentSeederOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
    this.config = loadSeedConfig()
    this.userFactory = new UserSeedFactory(this.random, this.config.users)
    this.projectFactory = new ProjectSeedFactory(
      this.random,
      this.config.projects,
      this.config.comments
    )
    this.userSeeder = new UserSeeder(this.options.passwordSeed, this.random)
    this.projectSeeder = new ProjectSeeder()
  }

  async run(): Promise<void> {
    this.random.seed(this.options.fakerSeed)

    await this.sequelize.transaction(async (transaction) => {
      const state = await this.buildState(transaction)
      const existingProjects = await Project.count({ transaction })
      if (existingProjects > 0) {
        logger.info(
          `Skipping development data seeding: already ${existingProjects} projects in storage`,
          'Seed'
        )
        return
      }

      logger.info('Seeding development data...', 'Seed')

      const userSeeds = this.userFactory.createSeeds()
      logger.debug(`Configured ${userSeeds.length} user seeds`, 'Seed')

      let createdUsers = 0
      for (const seed of userSeeds) {
        const result = await this.userSeeder.upsert(transaction, seed)
        state.seededUsers[seed.username] = result.user
        state.userRoles.set(seed.username, seed.roles)
        if (result.created) {
          createdUsers += 1
        }
      }

      logger.debug(`Upserted ${createdUsers} new users`, 'Seed')

      const projectSeeds = this.projectFactory.createSeeds(
        state.seededUsers,
        state.userRoles,
        state.adminUser
      )
      logger.debug(`Configured ${projectSeeds.length} project seeds`, 'Seed')

      await this.persistProjects(transaction, projectSeeds)
    })
  }

  private async buildState(transaction: Transaction): Promise<SeederState> {
    const adminUser = await User.findOne({ where: { username: 'admin' }, transaction })
    if (!adminUser) {
      throw new Error('Default admin user not found; cannot seed data')
    }

    return {
      adminUser,
      seededUsers: { [adminUser.username]: adminUser },
      userRoles: new Map([['admin', ['Admin']]])
    }
  }

  private async persistProjects(
    transaction: Transaction,
    seeds: ProjectSeedDefinition[]
  ): Promise<void> {
    let createdProjects = 0
    let taskTotal = 0
    let commentTotal = 0

    for (const seed of seeds) {
      const result = await this.projectSeeder.upsert(transaction, seed)
      taskTotal += result.taskCount
      commentTotal += result.commentCount
      if (result.project) {
        createdProjects += 1
      }
    }

    logger.success(
      `Seed complete: ${createdProjects} projects, ${taskTotal} tasks, ${commentTotal} comments`,
      'Seed'
    )
  }
}

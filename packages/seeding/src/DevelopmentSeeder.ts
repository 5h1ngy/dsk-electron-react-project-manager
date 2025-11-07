import { faker } from '@faker-js/faker'
import { randomInt } from 'node:crypto'
import type { Sequelize } from 'sequelize-typescript'
import type { Transaction } from 'sequelize'

import { logger } from '@services/config/logger'
import { Project } from '@services/models/Project'
import { User } from '@services/models/User'

import type {
  DevelopmentSeederOptions,
  ProjectSeedDefinition,
  SeederState
} from '../DevelopmentSeeder.types'
import { ProjectSeeder } from '../ProjectSeeder'
import { ProjectSeedFactory } from '../ProjectSeedFactory'
import { UserSeedFactory } from '../UserSeedFactory'
import { UserSeeder } from '../UserSeeder'
import { loadSeedConfig, type SeedConfig } from '../seedConfig'

const DEFAULT_PASSWORD_SEED = 'changeme!'

export class DevelopmentSeeder {
  private readonly random = faker
  private readonly options: Required<DevelopmentSeederOptions>
  private readonly config: SeedConfig
  private readonly userFactory: UserSeedFactory
  private readonly projectFactory: ProjectSeedFactory
  private readonly userSeeder: UserSeeder
  private readonly projectSeeder: ProjectSeeder

  constructor(
    private readonly sequelize: Sequelize,
    options: DevelopmentSeederOptions = {}
  ) {
    const fakerSeed = options.fakerSeed ?? randomInt(1, 2 ** 31) // faker expects a positive 32-bit integer
    const passwordSeed = options.passwordSeed ?? DEFAULT_PASSWORD_SEED

    this.options = {
      fakerSeed,
      passwordSeed
    }
    this.config = loadSeedConfig()
    this.userFactory = new UserSeedFactory(this.random, this.config.users)
    this.projectFactory = new ProjectSeedFactory(
      this.random,
      this.config.projects,
      this.config.comments,
      this.config.notes,
      this.config.wiki,
      this.config.sprints
    )
    this.userSeeder = new UserSeeder(this.options.passwordSeed, this.random)
    this.projectSeeder = new ProjectSeeder()
  }

  async run(): Promise<void> {
    this.random.seed(this.options.fakerSeed)
    logger.info(`Using faker seed: ${this.options.fakerSeed}`, 'Seed')

    await this.sequelize.transaction(async (transaction) => {
      const state = await this.buildState(transaction)
      const existingProjects = await Project.count({ transaction })
      if (existingProjects > 0) {
        logger.info(
          `Detected ${existingProjects} existing projects; topping up missing seed data where necessary`,
          'Seed'
        )
      } else {
        logger.info('Seeding development data...', 'Seed')
      }

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
    let sprintTotal = 0
    let taskTotal = 0
    let commentTotal = 0
    let noteTotal = 0
    let wikiPageTotal = 0
    let wikiRevisionTotal = 0
    for (const seed of seeds) {
      const result = await this.projectSeeder.upsert(transaction, seed)
      sprintTotal += result.sprintCount ?? 0
      taskTotal += result.taskCount
      commentTotal += result.commentCount
      noteTotal += result.noteCount
      wikiPageTotal += result.wikiPageCount
      wikiRevisionTotal += result.wikiRevisionCount
      if (result.project) {
        createdProjects += 1
      }
    }

    logger.success(
      `Seed complete: ${createdProjects} projects, ${sprintTotal} sprints, ${taskTotal} tasks, ${commentTotal} comments, ${noteTotal} notes, ${wikiPageTotal} wiki pages, ${wikiRevisionTotal} wiki revisions`,
      'Seed'
    )
  }
}

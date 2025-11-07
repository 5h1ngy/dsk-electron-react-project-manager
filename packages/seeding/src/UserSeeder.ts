import { randomUUID } from 'node:crypto'
import { Op, type Transaction } from 'sequelize'

import type { Faker } from '@faker-js/faker'

import { hashPassword } from '@services/services/auth/password'
import { Role } from '@services/models/Role'
import { User } from '@services/models/User'
import { UserRole } from '@services/models/UserRole'
import { logger } from '@services/config/logger'

import type { UserSeedDefinition } from './DevelopmentSeeder.types'

export class UserSeeder {
  constructor(
    private readonly passwordSeed: string,
    private readonly random: Faker
  ) {}

  async upsert(transaction: Transaction, seed: UserSeedDefinition) {
    const existing = await User.findOne({ where: { username: seed.username }, transaction })
    if (existing) {
      logger.debug(`User ${seed.username} already present`, 'Seed')
      return { user: existing, created: false }
    }

    const hashed = await hashPassword(this.passwordSeed)
    const lastLoginAt =
      this.random.helpers.maybe(() => this.random.date.recent({ days: 120 }), {
        probability: 0.7
      }) ?? null

    const user = await User.create(
      {
        id: randomUUID(),
        username: seed.username,
        displayName: seed.displayName,
        passwordHash: hashed,
        isActive: true,
        lastLoginAt
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
}

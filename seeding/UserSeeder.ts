import { randomUUID } from 'node:crypto'
import { Op, type Transaction } from 'sequelize'

import { hashPassword } from '../packages/main/src/services/auth/password'
import { Role } from '../packages/main/src/models/Role'
import { User } from '../packages/main/src/models/User'
import { UserRole } from '../packages/main/src/models/UserRole'
import { logger } from '../packages/main/src/config/logger'

import type { UserSeedDefinition } from './DevelopmentSeeder.types'

export class UserSeeder {
  constructor(private readonly passwordSeed: string) {}

  async upsert(transaction: Transaction, seed: UserSeedDefinition) {
    const existing = await User.findOne({ where: { username: seed.username }, transaction })
    if (existing) {
      logger.debug(`User ${seed.username} already present`, 'Seed')
      return { user: existing, created: false }
    }

    const hashed = await hashPassword(this.passwordSeed)
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
}

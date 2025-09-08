import type { Sequelize } from 'sequelize-typescript'

import { DatabaseManager } from '../packages/main/src/config/database'
import { resolveAppStoragePath } from '../packages/main/src/config/storagePath'
import { DevelopmentSeeder } from './DevelopmentSeeder'
import type { DevelopmentSeederOptions } from './DevelopmentSeeder.types'

export const seedDevData = async (
  sequelize: Sequelize,
  options?: DevelopmentSeederOptions
): Promise<void> => {
  await new DevelopmentSeeder(sequelize, options).run()
}

class SeedCommand {
  async execute(): Promise<void> {
    const storagePath = resolveAppStoragePath({
      overridePath: process.env.DB_STORAGE_PATH?.trim() ?? null
    })
    console.log(`Using database at: ${storagePath}`)

    const manager = new DatabaseManager({
      resolveStoragePath: () => storagePath,
      logging: true
    })

    const sequelize = await manager.initialize()

    try {
      await seedDevData(sequelize)
      console.log('Database seeding completed successfully')
    } finally {
      await sequelize.close()
    }
  }
}

new SeedCommand()
  .execute()
  .catch((error) => {
    console.error('Database seeding failed', error)
    process.exit(1)
  })

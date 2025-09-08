import type { Sequelize } from 'sequelize-typescript'

import { DevelopmentSeeder } from './DevelopmentSeeder'

export const seedDevData = async (sequelize: Sequelize): Promise<void> => {
  await new DevelopmentSeeder(sequelize).run()
}

export { DevelopmentSeeder } from './DevelopmentSeeder'

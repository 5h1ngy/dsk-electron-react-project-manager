import { join } from 'node:path'

import { createSequelizeInstance, runMigrations } from '@main/db/database'

const resolveStoragePath = (): string => {
  const customPath = process.env.DB_STORAGE_PATH?.trim()
  return customPath && customPath.length > 0
    ? customPath
    : join(process.cwd(), 'storage', 'app.sqlite')
}

const bootstrap = async (): Promise<void> => {
  const sequelize = createSequelizeInstance({
    resolveStoragePath,
    logging: true
  })

  try {
    await sequelize.authenticate()
    await sequelize.query('PRAGMA foreign_keys = ON;')
    await runMigrations(sequelize)
    console.log('Database migrations completed successfully')
  } finally {
    await sequelize.close()
  }
}

bootstrap().catch((error) => {
  console.error('Database migration failed', error)
  process.exit(1)
})

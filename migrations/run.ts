import { createSequelizeInstance, runMigrations } from '../packages/main/src/db/database'
import { resolveAppStoragePath } from '../packages/main/src/db/storagePath'

const bootstrap = async (): Promise<void> => {
  const storagePath = resolveAppStoragePath({ overridePath: process.env.DB_STORAGE_PATH?.trim() ?? null })
  console.log(`Using database at: ${storagePath}`)

  const sequelize = createSequelizeInstance({
    resolveStoragePath: () => storagePath,
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

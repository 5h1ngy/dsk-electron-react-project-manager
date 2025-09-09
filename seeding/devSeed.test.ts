import { mkdtemp, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import { DatabaseManager } from '../packages/main/src/config/database'
import { DevelopmentSeeder } from './DevelopmentSeeder'
import { Project } from '../packages/main/src/models/Project'
import { Task } from '../packages/main/src/models/Task'

const createTestDatabase = async () => {
  const directory = await mkdtemp(join(tmpdir(), 'dev-seeder-'))
  const storagePath = join(directory, 'seed.sqlite')
  const manager = new DatabaseManager({
    resolveStoragePath: () => storagePath,
    logging: false
  })
  const sequelize = await manager.initialize()

  const cleanup = async () => {
    await sequelize.close()
    await rm(directory, { recursive: true, force: true })
  }

  return { sequelize, cleanup }
}

describe('DevelopmentSeeder', () => {
  it('populates demo data once and becomes idempotent', async () => {
    const { sequelize, cleanup } = await createTestDatabase()
    const seeder = new DevelopmentSeeder(sequelize, { fakerSeed: 123 })

    try {
      await seeder.run()
      const initialProjects = await Project.count()
      const initialTasks = await Task.count()

      expect(initialProjects).toBeGreaterThan(0)
      expect(initialTasks).toBeGreaterThan(0)

      await seeder.run()

      expect(await Project.count()).toBe(initialProjects)
      expect(await Task.count()).toBe(initialTasks)
    } finally {
      await cleanup()
    }
  })
})

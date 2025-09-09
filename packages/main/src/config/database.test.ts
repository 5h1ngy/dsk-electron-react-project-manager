import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { mkdtemp, rm } from 'node:fs/promises'
import { initializeDatabase } from './database'
import { Role } from '../models/Role'
import { User } from '../models/User'

describe('database initialization', () => {
  it('creates sqlite database schema and seeds base data', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'dsk-db-'))
    const storagePath = join(directory, 'data.sqlite')

    const sequelize = await initializeDatabase({
      resolveStoragePath: () => storagePath,
      logging: false
    })

    try {
      const tables = await sequelize.getQueryInterface().showAllTables()
      const normalized = tables.map((table) => table.toString())

      expect(normalized).toEqual(
        expect.arrayContaining([
          'system_settings',
          'roles',
          'users',
          'user_roles',
          'audit_logs',
          'projects',
          'project_members',
          'tasks',
          'project_tags',
          'comments'
        ])
      )

      const roleCount = await Role.count()
      expect(roleCount).toBe(4)

      const admin = await User.findOne({ where: { username: 'admin' } })
      expect(admin).not.toBeNull()
      expect(admin?.isActive).toBe(true)
    } finally {
      await sequelize.close()
      await rm(directory, { recursive: true, force: true })
    }
  })
})


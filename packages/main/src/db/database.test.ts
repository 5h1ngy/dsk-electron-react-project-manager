import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { mkdtemp, rm } from 'node:fs/promises'
import { QueryTypes } from 'sequelize'
import { initializeDatabase, MIGRATIONS_TABLE } from './database'
import { Role } from './models/Role'
import { User } from './models/User'

describe('database initialization', () => {
  it('creates sqlite database and runs migrations', async () => {
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
          MIGRATIONS_TABLE
        ])
      )

      const executedMigrations = (await sequelize.query(`SELECT name FROM ${MIGRATIONS_TABLE}`, {
        type: QueryTypes.SELECT
      })) as Array<{ name: string }>

      const migrationNames = executedMigrations.map((row) => row.name)
      expect(migrationNames).toEqual(
        expect.arrayContaining(['0001-create-system-settings', '0002-create-auth-tables'])
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

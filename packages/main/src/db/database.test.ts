import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { mkdtemp, rm } from 'node:fs/promises'
import { QueryTypes } from 'sequelize'
import { initializeDatabase, MIGRATIONS_TABLE } from './database'

describe('database initialization', () => {
  it('creates sqlite database and runs migrations', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'dsk-db-'))
    const storagePath = join(directory, 'data.sqlite')

    const sequelize = await initializeDatabase({
      resolveStoragePath: () => storagePath,
      logging: false
    })

    const tables = await sequelize.getQueryInterface().showAllTables()
    const normalized = tables.map((table) => table.toString())

    expect(normalized).toEqual(expect.arrayContaining(['system_settings', MIGRATIONS_TABLE]))

    const executedMigrations = (await sequelize.query(
      `SELECT name FROM ${MIGRATIONS_TABLE}`,
      { type: QueryTypes.SELECT }
    )) as Array<{ name: string }>

    expect(executedMigrations.some((row) => row.name === '0001-create-system-settings')).toBe(true)

    await sequelize.close()
    await rm(directory, { recursive: true, force: true })
  })
})

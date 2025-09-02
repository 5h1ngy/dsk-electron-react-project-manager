import type { MigrationFn } from 'umzug'
import type { QueryInterface } from 'sequelize'
import * as createSystemSettings from './0001-create-system-settings'
import * as createAuthTables from './0002-create-auth-tables'

interface NamedMigration {
  name: string
  up: MigrationFn<QueryInterface>
  down?: MigrationFn<QueryInterface>
}

export const migrations: NamedMigration[] = [
  {
    name: createSystemSettings.name,
    up: createSystemSettings.up,
    down: createSystemSettings.down
  },
  {
    name: createAuthTables.name,
    up: createAuthTables.up,
    down: createAuthTables.down
  }
]

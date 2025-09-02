import type { Migration } from 'umzug'
import type { QueryInterface } from 'sequelize'
import * as createSystemSettings from './0001-create-system-settings'

export const migrations: Array<Migration<QueryInterface>> = [
  {
    name: createSystemSettings.name,
    up: createSystemSettings.up,
    down: createSystemSettings.down
  }
]

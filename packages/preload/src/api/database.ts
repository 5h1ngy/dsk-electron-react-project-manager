import type {
  DatabaseExportResult,
  DatabaseImportResult
} from '@main/services/databaseMaintenance/types'
import { invokeIpc } from '@preload/api/shared'

const CHANNELS = {
  export: 'database:export',
  import: 'database:import',
  restart: 'database:restart'
} as const

export const databaseApi = {
  export: async (token: string, password: string) =>
    await invokeIpc<DatabaseExportResult>(CHANNELS.export, token, password),
  import: async (token: string, password: string) =>
    await invokeIpc<DatabaseImportResult>(CHANNELS.import, token, password),
  restart: async (token: string) =>
    await invokeIpc<DatabaseRestartResult>(CHANNELS.restart, token)
}

import { ipcRenderer } from 'electron'
import type {
  DatabaseExportResult,
  DatabaseImportResult,
  DatabaseProgressUpdate,
  DatabaseRestartResult
} from '@services/services/databaseMaintenance/types'
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
  restart: async (token: string) => await invokeIpc<DatabaseRestartResult>(CHANNELS.restart, token),
  onExportProgress: (handler: (update: DatabaseProgressUpdate) => void) => {
    const listener = (_event: unknown, update: DatabaseProgressUpdate) => {
      handler(update)
    }
    ipcRenderer.on('database:export-progress', listener)
    return () => {
      ipcRenderer.removeListener('database:export-progress', listener)
    }
  },
  onImportProgress: (handler: (update: DatabaseProgressUpdate) => void) => {
    const listener = (_event: unknown, update: DatabaseProgressUpdate) => {
      handler(update)
    }
    ipcRenderer.on('database:import-progress', listener)
    return () => {
      ipcRenderer.removeListener('database:import-progress', listener)
    }
  }
}

import { BrowserWindow, dialog } from 'electron'

import type { DatabaseMaintenanceService } from '@main/services/databaseMaintenance'
import type { IpcChannelRegistrar } from '@main/ipc/utils'
import type { DatabaseExportResult, DatabaseImportResult } from '@main/services/databaseMaintenance/types'
import { AppError } from '@main/config/appError'

const EXPORT_FILTERS = [
  {
    name: 'Encrypted Database',
    extensions: ['dskdb']
  }
]

const IMPORT_FILTERS = EXPORT_FILTERS

const DEFAULT_EXPORT_NAME = 'dsk-project-manager.dskdb'

type DialogWindowProvider = () => BrowserWindow | null | undefined

export interface DatabaseIpcDependencies {
  service: DatabaseMaintenanceService
  registrar: IpcChannelRegistrar
  windowProvider?: DialogWindowProvider
}

const resolveWindow = (provider?: DialogWindowProvider): BrowserWindow | undefined => {
  if (!provider) {
    return BrowserWindow.getFocusedWindow() ?? undefined
  }
  return provider() ?? undefined
}

const ensureExtension = (filePath: string): string => {
  if (filePath.toLowerCase().endsWith('.dskdb')) {
    return filePath
  }
  return `${filePath}.dskdb`
}

export class DatabaseIpcRegistrar {
  private readonly service: DatabaseMaintenanceService
  private readonly registrar: IpcChannelRegistrar
  private readonly windowProvider?: DialogWindowProvider

  constructor(dependencies: DatabaseIpcDependencies) {
    this.service = dependencies.service
    this.registrar = dependencies.registrar
    this.windowProvider = dependencies.windowProvider
  }

  register(): void {
    this.registrar.register(
      'database:export',
      async (token: string, password: string): Promise<DatabaseExportResult> => {
        const browserWindow = resolveWindow(this.windowProvider)
        const { canceled, filePath } = await dialog.showSaveDialog(browserWindow, {
          title: 'Esporta database cifrato',
          defaultPath: DEFAULT_EXPORT_NAME,
          filters: EXPORT_FILTERS,
          properties: ['showOverwriteConfirmation']
        })

        if (canceled || !filePath) {
          return { canceled: true }
        }

        const targetPath = ensureExtension(filePath)
        await this.service.exportEncryptedDatabase(token, password, targetPath)
        return { canceled: false, filePath: targetPath }
      }
    )

    this.registrar.register(
      'database:import',
      async (token: string, password: string): Promise<DatabaseImportResult> => {
        const browserWindow = resolveWindow(this.windowProvider)
        const { canceled, filePaths } = await dialog.showOpenDialog(browserWindow, {
          title: 'Importa database cifrato',
          filters: IMPORT_FILTERS,
          properties: ['openFile']
        })

        if (canceled || !filePaths || filePaths.length === 0) {
          return { canceled: true }
        }

        const [sourcePath] = filePaths
        if (!sourcePath) {
          throw new AppError('ERR_VALIDATION', 'Percorso file non valido')
        }

        await this.service.importEncryptedDatabase(token, password, sourcePath)
        return { canceled: false, restartScheduled: true }
      }
    )
  }
}

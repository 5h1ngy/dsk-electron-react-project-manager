import { randomUUID } from 'node:crypto'
import { BrowserWindow, dialog } from 'electron'
import type { OpenDialogOptions, SaveDialogOptions } from 'electron'

import type { DatabaseMaintenanceService } from '@services/services/databaseMaintenance'
import type { IpcChannelRegistrar } from '@main/ipc/utils'
import type {
  DatabaseExportResult,
  DatabaseImportResult,
  DatabaseProgressUpdate,
  DatabaseRestartResult
} from '@services/services/databaseMaintenance/types'
import { AppError } from '@services/config/appError'

const EXPORT_FILTERS = [
  {
    name: 'Encrypted Database',
    extensions: ['dskdb']
  }
]

const IMPORT_FILTERS = EXPORT_FILTERS

const buildDefaultExportName = (): string => {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  const year = now.getFullYear()
  const month = pad(now.getMonth() + 1)
  const day = pad(now.getDate())
  const hours = pad(now.getHours())
  const minutes = pad(now.getMinutes())
  const seconds = pad(now.getSeconds())
  return `${year}${month}${day}-${hours}${minutes}${seconds}.dskdb`
}

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

  private getTargetWindow(hint?: BrowserWindow | null | undefined): BrowserWindow | undefined {
    return (
      hint ??
      resolveWindow(this.windowProvider) ??
      BrowserWindow.getFocusedWindow() ??
      BrowserWindow.getAllWindows()[0]
    )
  }

  private dispatchProgress(
    channel: 'database:export-progress' | 'database:import-progress',
    update: DatabaseProgressUpdate,
    hint?: BrowserWindow | null | undefined
  ): void {
    const target = this.getTargetWindow(hint)
    target?.webContents.send(channel, update)
  }

  register(): void {
    this.registrar.register(
      'database:export',
      async (token: string, password: string): Promise<DatabaseExportResult> => {
        const browserWindow = resolveWindow(this.windowProvider)
        const saveDialogOptions: SaveDialogOptions = {
          title: 'Esporta database cifrato',
          defaultPath: buildDefaultExportName(),
          filters: EXPORT_FILTERS,
          properties: ['showOverwriteConfirmation']
        }

        const { canceled, filePath } = browserWindow
          ? await dialog.showSaveDialog(browserWindow, saveDialogOptions)
          : await dialog.showSaveDialog(saveDialogOptions)

        if (canceled || !filePath) {
          return { canceled: true }
        }

        const targetPath = ensureExtension(filePath)
        const operationId = randomUUID()
        await this.service.exportEncryptedDatabase(token, password, targetPath, {
          operationId,
          onProgress: (update) =>
            this.dispatchProgress('database:export-progress', update, browserWindow)
        })
        return { canceled: false, filePath: targetPath, operationId }
      }
    )

    this.registrar.register(
      'database:import',
      async (token: string, password: string): Promise<DatabaseImportResult> => {
        const browserWindow = resolveWindow(this.windowProvider)
        const openDialogOptions: OpenDialogOptions = {
          title: 'Importa database cifrato',
          filters: IMPORT_FILTERS,
          properties: ['openFile']
        }

        const { canceled, filePaths } = browserWindow
          ? await dialog.showOpenDialog(browserWindow, openDialogOptions)
          : await dialog.showOpenDialog(openDialogOptions)

        if (canceled || !filePaths || filePaths.length === 0) {
          return { canceled: true }
        }

        const [sourcePath] = filePaths
        if (!sourcePath) {
          throw new AppError('ERR_VALIDATION', 'Percorso file non valido')
        }

        const operationId = randomUUID()
        await this.service.importEncryptedDatabase(token, password, sourcePath, {
          operationId,
          onProgress: (update) =>
            this.dispatchProgress('database:import-progress', update, browserWindow)
        })
        return {
          canceled: false,
          restartRequired: this.service.hasPendingRestart(),
          operationId
        }
      }
    )

    this.registrar.register(
      'database:restart',
      async (token: string): Promise<DatabaseRestartResult> => {
        await this.service.restartApplication(token)
        return { success: true }
      }
    )
  }
}


import 'reflect-metadata'
import { app, BrowserWindow } from 'electron'
import { join } from 'node:path'
import { createMainWindow } from './windows/mainWindow'
import { registerSecurityHooks } from './security/hardening'
import { initializeDatabase } from './db/database'
import { registerHealthIpc } from './ipc/health'
import { registerAuthIpc } from './ipc/auth'
import { logger } from './utils/logger'

let mainWindow: BrowserWindow | null = null

const gotLock = app.requestSingleInstanceLock()

if (!gotLock) {
  logger.warn('Second application instance detected. Quitting current launch.', 'Bootstrap')
  app.quit()
  process.exit(0)
}

app.disableHardwareAcceleration()
logger.debug('Hardware acceleration disabled', 'Bootstrap')

app.on('second-instance', () => {
  logger.warn('Second instance requested focus', 'Bootstrap')
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      logger.info('Restoring minimized window', 'Bootstrap')
      mainWindow.restore()
    }
    mainWindow.focus()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    logger.info('All windows closed. Quitting application.', 'Lifecycle')
    app.quit()
  }
})

app
  .whenReady()
  .then(async () => {
    logger.info('Application ready. Applying security hardening.', 'Bootstrap')
    registerSecurityHooks()

    const database = await initializeDatabase({
      resolveStoragePath() {
        const userData = app.getPath('userData')
        return join(userData, 'storage', 'app.sqlite')
      }
    })
    logger.success('Database connection established', 'Database')

    registerHealthIpc(database)
    logger.debug('Health IPC channel registered', 'IPC')
    registerAuthIpc()
    logger.debug('Auth IPC channels registered', 'IPC')

    mainWindow = await createMainWindow()
    logger.success('Main window created', 'Window')

    mainWindow.on('closed', () => {
      logger.info('Main window closed', 'Window')
      mainWindow = null
    })
  })
  .catch((error) => {
    logger.error('Failed to start application', 'Bootstrap', error)
    app.quit()
  })

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', 'Process', error)
})

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', 'Process', reason)
})

import 'reflect-metadata'
import { app, BrowserWindow } from 'electron'
import { createMainWindow } from './windows/mainWindow'
import { registerSecurityHooks } from './security/hardening'
import { initializeDatabase } from './config/database'
import { resolveAppStoragePath } from './config/storagePath'
import { registerHealthIpc } from './ipc/health'
import { registerAuthIpc } from './ipc/auth'
import { registerProjectIpc } from './ipc/project'
import { registerTaskIpc } from './ipc/task'
import { logger } from './utils/logger'
import { SystemSetting } from './db/models/SystemSetting'
import { SESSION_TIMEOUT_MINUTES } from './auth/constants'
import { appContext } from './appContext'

let mainWindow: BrowserWindow | null = null
let cleanupTimer: NodeJS.Timeout | null = null

const SESSION_TIMEOUT_SETTING_KEY = 'auth.sessionTimeoutMinutes'
const SESSION_CLEANUP_INTERVAL_MS = 5 * 60 * 1000

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

const configureSessionTimeout = async () => {
  const fallback = Number(process.env.SESSION_TIMEOUT_MINUTES ?? SESSION_TIMEOUT_MINUTES)
  let timeout = Number.isFinite(fallback) && fallback > 0 ? fallback : SESSION_TIMEOUT_MINUTES

  try {
    const setting = await SystemSetting.findByPk(SESSION_TIMEOUT_SETTING_KEY)
    if (setting?.value) {
      const parsed = Number(setting.value)
      if (Number.isFinite(parsed) && parsed > 0) {
        timeout = parsed
      } else {
        logger.warn(
          `Session timeout setting value invalid (${setting.value}); using ${timeout} minutes`,
          'Auth'
        )
      }
    }
  } catch (error) {
    logger.warn('Failed to load session timeout setting; using default value', 'Auth', error)
  }

  appContext.sessionManager.setTimeoutMinutes(timeout)
  logger.info(`Session timeout configured to ${timeout} minutes`, 'Auth')
}

const scheduleSessionCleanup = () => {
  cleanupTimer = setInterval(() => {
    const removed = appContext.sessionManager.cleanupExpired()
    if (removed > 0) {
      logger.debug(`Expired sessions cleaned: ${removed}`, 'Auth')
    }
  }, SESSION_CLEANUP_INTERVAL_MS)
  cleanupTimer.unref()
}

app
  .whenReady()
  .then(async () => {
    logger.info('Application ready. Applying security hardening.', 'Bootstrap')
    registerSecurityHooks()

    const storagePath = resolveAppStoragePath({ userDataDir: app.getPath('userData') })

    const database = await initializeDatabase({
      resolveStoragePath() {
        return storagePath
      }
    })
    logger.success('Database connection established', 'Database')

    appContext.setDatabase(database)
    logger.debug('Application context initialized', 'Bootstrap')

    registerHealthIpc(database)
    logger.debug('Health IPC channel registered', 'IPC')
    registerAuthIpc()
    registerProjectIpc()
    registerTaskIpc()
    logger.debug('Auth, Project and Task IPC channels registered', 'IPC')

    await configureSessionTimeout()
    scheduleSessionCleanup()

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

app.on('before-quit', () => {
  if (cleanupTimer) {
    clearInterval(cleanupTimer)
    cleanupTimer = null
  }
})

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', 'Process', error)
})

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', 'Process', reason)
})

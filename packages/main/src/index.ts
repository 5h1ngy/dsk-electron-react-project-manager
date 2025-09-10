import 'reflect-metadata'
import type { Sequelize } from 'sequelize-typescript'
import { app, BrowserWindow } from 'electron'

import { registerSecurityHooks } from './services/security/hardening'
import { initializeDatabase } from './config/database'
import { resolveAppStoragePath } from './config/storagePath'
import { logger } from './config/logger'
import { SystemSetting } from './models/SystemSetting'
import { SESSION_TIMEOUT_MINUTES } from './services/auth/constants'
import { appContext, mainWindowManager, MainWindowManager } from './appContext'
import { AuthIpcRegistrar } from './ipc/auth'
import { ProjectIpcRegistrar } from './ipc/project'
import { TaskIpcRegistrar } from './ipc/task'
import { HealthIpcRegistrar } from './ipc/health'
import { IpcChannelRegistrar, ipcChannelRegistrar } from './ipc/utils'

const SESSION_TIMEOUT_SETTING_KEY = 'auth.sessionTimeoutMinutes'
const SESSION_CLEANUP_INTERVAL_MS = 5 * 60 * 1000

interface SessionLifecycleOptions {
  sessionManager: typeof appContext.sessionManager
  logger: Pick<typeof logger, 'info' | 'warn' | 'debug'>
  systemSettingModel: typeof SystemSetting
  env?: NodeJS.ProcessEnv
  settingKey: string
  defaultTimeoutMinutes: number
  cleanupIntervalMs: number
}

class SessionLifecycleManager {
  private cleanupTimer: NodeJS.Timeout | null = null
  private readonly env: NodeJS.ProcessEnv

  constructor(private readonly options: SessionLifecycleOptions) {
    this.env = options.env ?? process.env
  }

  async configure(): Promise<void> {
    const fallback = Number(this.env.SESSION_TIMEOUT_MINUTES ?? this.options.defaultTimeoutMinutes)
    let timeout =
      Number.isFinite(fallback) && fallback > 0 ? fallback : this.options.defaultTimeoutMinutes

    try {
      const setting = await this.options.systemSettingModel.findByPk(this.options.settingKey)
      if (setting?.value) {
        const parsed = Number(setting.value)
        if (Number.isFinite(parsed) && parsed > 0) {
          timeout = parsed
        } else {
          this.options.logger.warn(
            `Session timeout setting value invalid (${setting.value}); using ${timeout} minutes`,
            'Auth'
          )
        }
      }
    } catch (error) {
      this.options.logger.warn('Failed to load session timeout setting; using default value', 'Auth', error)
    }

    this.options.sessionManager.setTimeoutMinutes(timeout)
    this.options.logger.info(`Session timeout configured to ${timeout} minutes`, 'Auth')
  }

  start(): void {
    if (this.cleanupTimer) {
      return
    }

    this.cleanupTimer = setInterval(() => {
      const removed = this.options.sessionManager.cleanupExpired()
      if (removed > 0) {
        this.options.logger.debug(`Expired sessions cleaned: ${removed}`, 'Auth')
      }
    }, this.options.cleanupIntervalMs)
    this.cleanupTimer.unref?.()
  }

  stop(): void {
    if (!this.cleanupTimer) {
      return
    }
    clearInterval(this.cleanupTimer)
    this.cleanupTimer = null
  }
}

interface MainProcessDependencies {
  app: typeof app
  logger: typeof logger
  windowManager: MainWindowManager
  context: typeof appContext
  resolveStoragePath: typeof resolveAppStoragePath
  initializeDatabase: typeof initializeDatabase
  registerSecurityHooks: () => void
  sessionLifecycle: SessionLifecycleManager
  ipcRegistrar: IpcChannelRegistrar
}

class MainProcessApplication {
  private mainWindow: BrowserWindow | null = null

  constructor(private readonly deps: MainProcessDependencies) {}

  bootstrap(): void {
    this.enforceSingleInstance()
    this.registerAppEvents()
    this.registerProcessEvents()
  }

  private enforceSingleInstance(): void {
    const gotLock = this.deps.app.requestSingleInstanceLock()
    if (gotLock) {
      return
    }
    this.deps.logger.warn('Second application instance detected. Quitting current launch.', 'Bootstrap')
    this.deps.app.quit()
    process.exit(0)
  }

  private registerAppEvents(): void {
    this.deps.app.disableHardwareAcceleration()
    this.deps.logger.debug('Hardware acceleration disabled', 'Bootstrap')

    this.deps.app.on('second-instance', () => this.focusExistingWindow())
    this.deps.app.on('window-all-closed', () => this.handleAllWindowsClosed())
    this.deps.app.on('before-quit', () => this.deps.sessionLifecycle.stop())

    this.deps.app
      .whenReady()
      .then(() => this.onReady())
      .catch((error) => {
        this.deps.logger.error('Failed to start application', 'Bootstrap', error)
        this.deps.app.quit()
      })
  }

  private registerProcessEvents(): void {
    process.on('uncaughtException', (error) => {
      this.deps.logger.error('Uncaught exception', 'Process', error)
    })

    process.on('unhandledRejection', (reason) => {
      this.deps.logger.error('Unhandled promise rejection', 'Process', reason)
    })
  }

  private focusExistingWindow(): void {
    this.deps.logger.warn('Second instance requested focus', 'Bootstrap')
    if (!this.mainWindow) {
      return
    }
    if (this.mainWindow.isMinimized()) {
      this.deps.logger.info('Restoring minimized window', 'Bootstrap')
      this.mainWindow.restore()
    }
    this.mainWindow.focus()
  }

  private handleAllWindowsClosed(): void {
    if (process.platform !== 'darwin') {
      this.deps.logger.info('All windows closed. Quitting application.', 'Lifecycle')
      this.deps.app.quit()
    }
  }

  private async onReady(): Promise<void> {
    this.deps.logger.info('Application ready. Applying security hardening.', 'Bootstrap')
    this.deps.registerSecurityHooks()

    const storagePath = this.deps.resolveStoragePath({
      userDataDir: this.deps.app.getPath('userData')
    })

    const database = await this.deps.initializeDatabase({
      resolveStoragePath: () => storagePath
    })
    this.deps.logger.success('Database connection established', 'Database')

    this.deps.context.setDatabase(database)
    this.deps.logger.debug('Application context initialized', 'Bootstrap')

    this.registerIpcChannels(database)

    await this.deps.sessionLifecycle.configure()
    this.deps.sessionLifecycle.start()

    this.mainWindow = await this.deps.windowManager.createMainWindow()
    this.deps.logger.success('Main window created', 'Window')

    this.mainWindow.on('closed', () => {
      this.deps.logger.info('Main window closed', 'Window')
      this.mainWindow = null
    })
  }

  private registerIpcChannels(database: Sequelize): void {
    new HealthIpcRegistrar({
      sequelize: database,
      appRef: this.deps.app,
      registrar: this.deps.ipcRegistrar
    }).register()
    this.deps.logger.debug('Health IPC channel registered', 'IPC')

    new AuthIpcRegistrar({
      authService: this.deps.context.authService,
      registrar: this.deps.ipcRegistrar
    }).register()

    const { projectService, taskService } = this.deps.context
    if (!projectService || !taskService) {
      throw new Error('Project and Task services must be initialized before registering IPC')
    }

    new ProjectIpcRegistrar({
      authService: this.deps.context.authService,
      projectService,
      registrar: this.deps.ipcRegistrar
    }).register()

    new TaskIpcRegistrar({
      authService: this.deps.context.authService,
      taskService,
      registrar: this.deps.ipcRegistrar
    }).register()
    this.deps.logger.debug('Auth, Project and Task IPC channels registered', 'IPC')
  }
}

const sessionLifecycle = new SessionLifecycleManager({
  sessionManager: appContext.sessionManager,
  logger,
  systemSettingModel: SystemSetting,
  env: process.env,
  settingKey: SESSION_TIMEOUT_SETTING_KEY,
  defaultTimeoutMinutes: SESSION_TIMEOUT_MINUTES,
  cleanupIntervalMs: SESSION_CLEANUP_INTERVAL_MS
})

const application = new MainProcessApplication({
  app,
  logger,
  windowManager: mainWindowManager,
  context: appContext,
  resolveStoragePath: resolveAppStoragePath,
  initializeDatabase,
  registerSecurityHooks,
  sessionLifecycle,
  ipcRegistrar: ipcChannelRegistrar
})

application.bootstrap()

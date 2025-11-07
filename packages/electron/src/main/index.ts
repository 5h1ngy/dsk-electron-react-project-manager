import 'reflect-metadata'

import type { Sequelize } from 'sequelize-typescript'
import { app, BrowserWindow } from 'electron'

import { registerSecurityHooks } from '@main/services/security'
import { appContext, mainWindowManager, MainWindowManager } from '@main/appContext'
import { AuthIpcRegistrar } from '@main/ipc/auth'
import { DatabaseIpcRegistrar } from '@main/ipc/database'
import { HealthIpcRegistrar } from '@main/ipc/health'
import { IpcChannelRegistrar, ipcChannelRegistrar } from '@main/ipc/utils'
import { NoteIpcRegistrar } from '@main/ipc/note'
import { ProjectIpcRegistrar } from '@main/ipc/project'
import { RoleIpcRegistrar } from '@main/ipc/role'
import { TaskIpcRegistrar } from '@main/ipc/task'
import { TaskStatusIpcRegistrar } from '@main/ipc/taskStatus'
import { ViewIpcRegistrar } from '@main/ipc/view'
import { SprintIpcRegistrar } from '@main/ipc/sprint'
import { WikiIpcRegistrar } from '@main/ipc/wiki'
import { initializeDatabase } from '@services/config/database'
import { resolveAppStoragePath } from '@services/config/storagePath'
import { env } from '@services/config/env'
import { logger } from '@services/config/logger'
import { SystemSetting } from '@services/models/SystemSetting'
import { SESSION_TIMEOUT_MINUTES } from '@services/services/auth/constants'
import { DatabaseMaintenanceService } from '@services/services/databaseMaintenance'

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
      this.options.logger.warn(
        'Failed to load session timeout setting; using default value',
        'Auth'
      )
      const detail = error instanceof Error ? (error.stack ?? error.message) : String(error)
      this.options.logger.debug(`Session timeout lookup failed: ${detail}`, 'Auth')
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
  appVersion: string
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

    this.deps.logger.warn('Another instance is already running. Exiting current instance.', 'Main')
    this.deps.app.quit()
  }

  private registerAppEvents(): void {
    this.deps.app.on('second-instance', () => {
      if (this.mainWindow) {
        if (this.mainWindow.isMinimized()) {
          this.mainWindow.restore()
        }
        this.mainWindow.focus()
      }
    })

    this.deps.app.on('ready', async () => {
      try {
        await this.initialize()
      } catch (error) {
        const message = error instanceof Error ? (error.stack ?? error.message) : String(error)
        this.deps.logger.error(`Fatal error during bootstrap: ${message}`, 'Main', error)
        this.deps.app.quit()
      }
    })

    this.deps.app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        this.deps.app.quit()
      }
    })

    this.deps.app.on('activate', async () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        await this.initializeWindow()
      }
    })
  }

  private registerProcessEvents(): void {
    process.on('uncaughtException', (error) => {
      this.deps.logger.error('Uncaught exception in main process', 'Main', error)
    })
    process.on('unhandledRejection', (reason) => {
      this.deps.logger.error(
        `Unhandled promise rejection: ${reason instanceof Error ? (reason.stack ?? reason.message) : String(reason)}`,
        'Main'
      )
    })
  }

  private async initialize(): Promise<void> {
    this.deps.registerSecurityHooks()
    await this.initializeDatabase()
    await this.initializeWindow()
  }

  private async initializeDatabase(): Promise<void> {
    const storagePath = this.deps.resolveStoragePath()
    const database = await this.deps.initializeDatabase({
      resolveStoragePath: () => storagePath
    })
    appContext.setDatabase(database, storagePath)
    this.deps.logger.success('Database initialized', 'Database')
    this.registerIpcChannels(database)
  }

  private async initializeWindow(): Promise<void> {
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
      registrar: this.deps.ipcRegistrar,
      version: this.deps.appVersion
    }).register()
    this.deps.logger.debug('Health IPC channel registered', 'IPC')

    new AuthIpcRegistrar({
      authService: this.deps.context.authService,
      registrar: this.deps.ipcRegistrar
    }).register()

    const {
      projectService,
      taskService,
      taskStatusService,
      noteService,
      viewService,
      roleService,
      sprintService,
      wikiService
    } = this.deps.context
    if (
      !projectService ||
      !taskService ||
      !taskStatusService ||
      !noteService ||
      !viewService ||
      !roleService ||
      !sprintService ||
      !wikiService
    ) {
      throw new Error(
        'Project, Task, TaskStatus, Note, View, Role, Sprint and Wiki services must be initialized before registering IPC'
      )
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

    new TaskStatusIpcRegistrar({
      authService: this.deps.context.authService,
      taskStatusService,
      registrar: this.deps.ipcRegistrar
    }).register()

    new NoteIpcRegistrar({
      authService: this.deps.context.authService,
      noteService,
      registrar: this.deps.ipcRegistrar
    }).register()

    new ViewIpcRegistrar({
      authService: this.deps.context.authService,
      viewService,
      registrar: this.deps.ipcRegistrar
    }).register()

    new RoleIpcRegistrar({
      authService: this.deps.context.authService,
      roleService,
      registrar: this.deps.ipcRegistrar
    }).register()

    new SprintIpcRegistrar({
      authService: this.deps.context.authService,
      sprintService,
      registrar: this.deps.ipcRegistrar
    }).register()

    new WikiIpcRegistrar({
      authService: this.deps.context.authService,
      wikiService,
      registrar: this.deps.ipcRegistrar
    }).register()

    const databaseService = new DatabaseMaintenanceService({
      authService: this.deps.context.authService,
      auditService: this.deps.context.auditService,
      app: this.deps.app,
      storage: {
        getDatabasePath: () => this.deps.context.getDatabasePath(),
        teardownDatabase: () => this.deps.context.teardownDatabase()
      },
      log: this.deps.logger
    })

    new DatabaseIpcRegistrar({
      service: databaseService,
      registrar: this.deps.ipcRegistrar,
      windowProvider: () => this.mainWindow ?? BrowserWindow.getFocusedWindow() ?? undefined
    }).register()

    this.deps.logger.debug(
      'IPC channels registered (health, auth, project, task, task-status, note, view, role, sprint, wiki, database)',
      'IPC'
    )
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
  ipcRegistrar: ipcChannelRegistrar,
  appVersion: env.appVersion
})

application.bootstrap()

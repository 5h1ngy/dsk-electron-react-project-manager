import { app, BrowserWindow } from 'electron'
import { join } from 'node:path'
import type { Sequelize } from 'sequelize-typescript'

import { logger, shouldSuppressDevtoolsMessage } from '@services/config/logger'
import { SessionManager } from '@services/services/auth/sessionManager'
import { AuditService } from '@services/services/audit'
import { AuthService } from '@services/services/auth'
import { ProjectService } from '@services/services/project'
import { TaskService } from '@services/services/task'
import { TaskStatusService } from '@services/services/taskStatus'
import { NoteService } from '@services/services/note'
import { ViewService } from '@services/services/view'
import { RoleService } from '@services/services/roles'
import { SprintService } from '@services/services/sprint'
import { WikiService } from '@services/services/wiki'

export const MAIN_WINDOW_OPTIONS: Electron.BrowserWindowConstructorOptions = {
  width: 1280,
  height: 800,
  show: false,
  autoHideMenuBar: true,
  title: 'DSK Project Manager',
  webPreferences: {
    preload: join(__dirname, '../preload/index.cjs'),
    sandbox: true,
    contextIsolation: true,
    nodeIntegration: false,
    spellcheck: false
  }
}

type WindowLogger = Pick<
  typeof logger,
  'info' | 'warn' | 'error' | 'success' | 'debug' | 'renderer'
>

export interface MainWindowManagerOptions {
  browserWindowCtor?: typeof BrowserWindow
  logger?: WindowLogger
  isDev?: () => boolean
  env?: NodeJS.ProcessEnv
  shouldSuppress?: typeof shouldSuppressDevtoolsMessage
}

export class MainWindowManager {
  private readonly BrowserWindowCtor: typeof BrowserWindow
  private readonly logger: WindowLogger
  private readonly isDev: () => boolean
  private readonly env: NodeJS.ProcessEnv
  private readonly shouldSuppress: typeof shouldSuppressDevtoolsMessage
  private readonly devtoolsToggle: boolean | null

  constructor(options: MainWindowManagerOptions = {}) {
    this.BrowserWindowCtor = options.browserWindowCtor ?? BrowserWindow
    this.logger = options.logger ?? logger
    this.isDev = options.isDev ?? (() => process.env.NODE_ENV !== 'production')
    this.env = options.env ?? process.env
    this.shouldSuppress = options.shouldSuppress ?? shouldSuppressDevtoolsMessage
    this.devtoolsToggle = this.parseDevtoolsToggle(this.env.ENABLE_DEVTOOLS)
  }

  async createMainWindow(): Promise<BrowserWindow> {
    const window = new this.BrowserWindowCtor({
      ...MAIN_WINDOW_OPTIONS,
      icon: this.resolveIconPath()
    })
    this.logger.info('Main window instantiated', 'Window')
    this.registerReadyHandler(window)
    this.registerDevtoolsHooks(window)
    this.registerConsoleForwarding(window)
    this.registerLifecycleHooks(window)
    this.loadWindowContent(window)
    return window
  }

  private resolveIconPath(): string {
    if (app.isPackaged) {
      return join(process.resourcesPath, 'icon.png')
    }
    return join(__dirname, '../../resources/icon.png')
  }

  private registerReadyHandler(window: BrowserWindow): void {
    window.on('ready-to-show', () => {
      this.logger.debug('Main window ready to show', 'Window')
      window.show()
    })

    window.webContents.on('did-finish-load', () => {
      this.logger.success('Renderer finished loading', 'Window')
    })
  }

  private registerDevtoolsHooks(window: BrowserWindow): void {
    const allowDevtools = this.shouldAllowDevtools()

    if (!allowDevtools) {
      this.logger.info('DevTools disabled via configuration toggle', 'Window')
      window.webContents.on('before-input-event', (event, input) => {
        const isToggleShortcut =
          (input.control || input.meta) && input.shift && input.key.toLowerCase() === 'i'
        const isF12 = input.key.toLowerCase() === 'f12'
        if (isToggleShortcut || isF12) {
          event.preventDefault()
        }
      })

      window.webContents.on('devtools-opened', () => {
        this.logger.warn('DevTools requested but disabled via configuration', 'Window')
        window.webContents.closeDevTools()
      })

      return
    }

    const shouldAutoOpen = this.shouldAutoOpenDevtools()

    if (!shouldAutoOpen) {
      return
    }

    window.webContents.once('dom-ready', () => {
      if (!window.webContents.isDevToolsOpened()) {
        this.logger.debug('Opening docked DevTools per configuration', 'Window')
        window.webContents.openDevTools({ mode: 'right' })
      }
    })
  }

  private registerConsoleForwarding(window: BrowserWindow): void {
    window.webContents.on('console-message', (event, level, message, line, sourceId) => {
      if (this.shouldSuppress(sourceId, message)) {
        event.preventDefault()
        return
      }
      this.logger.renderer(level, message, sourceId, line)
    })
  }

  private registerLifecycleHooks(window: BrowserWindow): void {
    window.on('closed', () => {
      this.logger.debug('Destroying BrowserWindow instance', 'Window')
      window.destroy()
    })
  }

  private loadWindowContent(window: BrowserWindow): void {
    const devUrl = this.env.ELECTRON_RENDERER_URL

    if (this.isDev() && devUrl) {
      this.logger.debug('Loading renderer from dev server URL', 'Window')
      void window.loadURL(devUrl)
      return
    }

    this.logger.debug('Loading renderer from bundled HTML', 'Window')
    void window.loadFile(join(__dirname, '../renderer/index.html'))
  }

  private parseDevtoolsToggle(value: string | undefined): boolean | null {
    if (!value) {
      return null
    }
    const normalized = value.trim().toLowerCase()
    if (['1', 'true', 'yes', 'on'].includes(normalized)) {
      return true
    }
    if (['0', 'false', 'no', 'off'].includes(normalized)) {
      return false
    }
    this.logger.warn(
      `Invalid ENABLE_DEVTOOLS value "${value}". Falling back to environment defaults.`,
      'Window'
    )
    return null
  }

  private shouldAllowDevtools(): boolean {
    if (this.devtoolsToggle !== null) {
      return this.devtoolsToggle
    }
    return this.isDev()
  }

  private shouldAutoOpenDevtools(): boolean {
    if (this.devtoolsToggle === true) {
      return true
    }
    return this.devtoolsToggle === null && this.isDev()
  }
}

class AppContext {
  readonly sessionManager = new SessionManager()
  readonly auditService = new AuditService()
  readonly authService = new AuthService(this.sessionManager, this.auditService)

  sequelize?: Sequelize
  projectService?: ProjectService
  taskService?: TaskService
  taskStatusService?: TaskStatusService
  noteService?: NoteService
  viewService?: ViewService
  roleService?: RoleService
  sprintService?: SprintService
  wikiService?: WikiService
  private databasePath?: string

  setDatabase(sequelize: Sequelize, storagePath: string): void {
    this.sequelize = sequelize
    this.databasePath = storagePath
    this.projectService = new ProjectService(sequelize, this.auditService)
    this.taskStatusService = new TaskStatusService(sequelize, this.auditService)
    this.taskService = new TaskService(sequelize, this.auditService)
    this.noteService = new NoteService(sequelize, this.auditService)
    this.viewService = new ViewService(sequelize, this.auditService)
    this.roleService = new RoleService(sequelize, this.auditService)
    this.sprintService = new SprintService(sequelize, this.auditService)
    this.wikiService = new WikiService(sequelize, this.auditService)
  }

  getDatabasePath(): string | null {
    return this.databasePath ?? null
  }

  async teardownDatabase(): Promise<void> {
    if (this.sequelize) {
      await this.sequelize.close()
    }
    this.sequelize = undefined
    this.projectService = undefined
    this.taskStatusService = undefined
    this.taskService = undefined
    this.noteService = undefined
    this.viewService = undefined
    this.roleService = undefined
    this.sprintService = undefined
    this.wikiService = undefined
  }
}

export const appContext = new AppContext()
export const mainWindowManager = new MainWindowManager()

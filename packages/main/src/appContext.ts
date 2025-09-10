import { BrowserWindow } from 'electron'
import { join } from 'node:path'
import type { Sequelize } from 'sequelize-typescript'

import { logger, shouldSuppressDevtoolsMessage } from './config/logger'
import { SessionManager } from './services/auth/sessionManager'
import { AuditService } from './services/audit/auditService'
import { AuthService } from './services/auth/authService'
import { ProjectService } from './services/project'
import { TaskService } from './services/task'

export const MAIN_WINDOW_OPTIONS: Electron.BrowserWindowConstructorOptions = {
  width: 1280,
  height: 800,
  show: false,
  autoHideMenuBar: true,
  title: 'DSK Project Manager',
  webPreferences: {
    preload: join(__dirname, '../preload/index.js'),
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

  constructor(options: MainWindowManagerOptions = {}) {
    this.BrowserWindowCtor = options.browserWindowCtor ?? BrowserWindow
    this.logger = options.logger ?? logger
    this.isDev = options.isDev ?? (() => process.env.NODE_ENV !== 'production')
    this.env = options.env ?? process.env
    this.shouldSuppress = options.shouldSuppress ?? shouldSuppressDevtoolsMessage
  }

  async createMainWindow(): Promise<BrowserWindow> {
    const window = new this.BrowserWindowCtor(MAIN_WINDOW_OPTIONS)
    this.logger.info('Main window instantiated', 'Window')
    this.registerReadyHandler(window)
    this.registerDevtoolsHooks(window)
    this.registerConsoleForwarding(window)
    this.registerLifecycleHooks(window)
    this.loadWindowContent(window)
    return window
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
    if (!this.isDev()) {
      return
    }

    window.webContents.once('dom-ready', () => {
      if (!window.webContents.isDevToolsOpened()) {
        this.logger.debug('Opening detached DevTools in development mode', 'Window')
        window.webContents.openDevTools({ mode: 'detach' })
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
}

class AppContext {
  readonly sessionManager = new SessionManager()
  readonly auditService = new AuditService()
  readonly authService = new AuthService(this.sessionManager, this.auditService)

  sequelize?: Sequelize
  projectService?: ProjectService
  taskService?: TaskService

  setDatabase(sequelize: Sequelize): void {
    this.sequelize = sequelize
    this.projectService = new ProjectService(sequelize, this.auditService)
    this.taskService = new TaskService(sequelize, this.auditService)
  }
}

export const appContext = new AppContext()
export const mainWindowManager = new MainWindowManager()

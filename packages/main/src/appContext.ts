import { app, BrowserWindow } from 'electron'
import type { Session, WebContents } from 'electron'
import { join } from 'node:path'
import { existsSync } from 'node:fs'
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
import { WikiService } from '@services/services/wiki'
import { SprintService } from '@services/services/sprint'
import {
  createDomainContext,
  teardownDomainContext,
  type DomainContext
} from '@services/runtime/domainContext'

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
  private readonly devtoolsToggle: boolean | null
  private reduxDevtoolsInstalled = false
  private reduxInstallPromise: Promise<void> | null = null
  private readonly reduxFocusTargets = new WeakSet<WebContents>()
  private readonly devtoolsConsoleFilters = new WeakSet<WebContents>()

  constructor(options: MainWindowManagerOptions = {}) {
    this.BrowserWindowCtor = options.browserWindowCtor ?? BrowserWindow
    this.logger = options.logger ?? logger
    this.isDev = options.isDev ?? (() => process.env.NODE_ENV !== 'production')
    this.env = options.env ?? process.env
    this.shouldSuppress = options.shouldSuppress ?? shouldSuppressDevtoolsMessage
    this.devtoolsToggle = this.parseDevtoolsToggle(this.env.ENABLE_DEVTOOLS)
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
      if (!window.isMaximized()) {
        window.maximize()
      }
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

    const installPromise = this.ensureReduxDevtools(window.webContents)
    void installPromise

    this.registerReduxPanelFocus(window)

    const shouldAutoOpen = this.shouldAutoOpenDevtools()

    if (!shouldAutoOpen) {
      return
    }

    window.webContents.once('dom-ready', () => {
      const openDevtools = () => {
        if (!window.webContents.isDevToolsOpened()) {
          this.logger.debug('Opening docked DevTools per configuration', 'Window')
          window.webContents.openDevTools({ mode: 'right' })
        }
      }

      void installPromise.finally(openDevtools)
    })
  }

  private async ensureReduxDevtools(webContents: WebContents): Promise<void> {
    if (!this.shouldAllowDevtools() || this.reduxDevtoolsInstalled) {
      return
    }

    if (this.reduxInstallPromise) {
      await this.reduxInstallPromise
      return
    }

    this.reduxInstallPromise = this.installReduxDevtools(webContents.session)

    try {
      await this.reduxInstallPromise
    } finally {
      this.reduxInstallPromise = null
    }
  }

  private async installReduxDevtools(session: Session): Promise<void> {
    const localExtensionPath = join(app.getAppPath(), 'extensions/redux-devtools')

    if (existsSync(localExtensionPath)) {
      try {
        const extension = await session.loadExtension(localExtensionPath, {
          allowFileAccess: true
        })
        this.reduxDevtoolsInstalled = true
        this.logger.info(`Redux DevTools extension ready (${extension.name}) [local]`, 'DevTools')
        return
      } catch (error) {
        this.logger.warn('Unable to load local Redux DevTools extension', 'DevTools')
        this.logger.debug(this.describeError(error), 'DevTools')
      }
    } else {
      this.logger.debug(
        `Local Redux DevTools extension missing at: ${localExtensionPath}`,
        'DevTools'
      )
    }

    try {
      const { default: installExtension, REDUX_DEVTOOLS } = await import(
        'electron-devtools-installer'
      )
      const extension = await installExtension(REDUX_DEVTOOLS, {
        session,
        loadExtensionOptions: { allowFileAccess: true },
        forceDownload: false
      })
      this.reduxDevtoolsInstalled = true
      this.logger.info(
        `Redux DevTools extension ready (${extension.name}) [downloaded]`,
        'DevTools'
      )
    } catch (error) {
      this.logger.warn('Unable to install Redux DevTools extension', 'DevTools')
      this.logger.debug(this.describeError(error), 'DevTools')
    }
  }

  private registerReduxPanelFocus(window: BrowserWindow): void {
    const contents = window.webContents
    if (this.reduxFocusTargets.has(contents)) {
      return
    }
    this.reduxFocusTargets.add(contents)

    contents.on('devtools-opened', () => {
      const devtools = contents.devToolsWebContents
      if (!devtools) {
        return
      }

      if (this.devtoolsConsoleFilters.has(devtools)) {
        return
      }

      this.devtoolsConsoleFilters.add(devtools)
      devtools.on('console-message', (event, _level, message, _line, sourceId) => {
        const normalizedMessage = String(message ?? '').toLowerCase()
        const normalizedSource = String(sourceId ?? '').toLowerCase()
        if (
          normalizedMessage.includes('sandboxed_renderer.bundle.js script failed') ||
          normalizedMessage.includes('autofill.enable failed') ||
          normalizedMessage.includes('autofill.setaddresses failed') ||
          normalizedSource.includes('sandbox_bundle')
        ) {
          event.preventDefault()
        }
      })
    })
  }

  private describeError(error: unknown): string {
    if (error instanceof Error) {
      return error.stack ?? error.message
    }
    return String(error)
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
  authService = new AuthService(this.sessionManager, this.auditService)

  sequelize?: Sequelize
  projectService?: ProjectService
  taskService?: TaskService
  taskStatusService?: TaskStatusService
  noteService?: NoteService
  viewService?: ViewService
  roleService?: RoleService
  wikiService?: WikiService
  sprintService?: SprintService
  private databasePath?: string
  private domainContext: DomainContext | null = null

  setDatabase(sequelize: Sequelize, storagePath: string): void {
    this.sequelize = sequelize
    this.databasePath = storagePath

    const domain = createDomainContext({
      sequelize,
      auditService: this.auditService,
      sessionManager: this.sessionManager,
      authService: this.authService
    })

    this.domainContext = domain
    this.authService = domain.authService
    this.projectService = domain.projectService
    this.taskStatusService = domain.taskStatusService
    this.taskService = domain.taskService
    this.noteService = domain.noteService
    this.viewService = domain.viewService
    this.roleService = domain.roleService
    this.wikiService = domain.wikiService
    this.sprintService = domain.sprintService
  }

  getDatabasePath(): string | null {
    return this.databasePath ?? null
  }

  async teardownDatabase(): Promise<void> {
    if (this.domainContext) {
      await teardownDomainContext(this.domainContext)
    }
    this.domainContext = null
    this.sequelize = undefined
    this.projectService = undefined
    this.taskStatusService = undefined
    this.taskService = undefined
    this.noteService = undefined
    this.viewService = undefined
    this.roleService = undefined
    this.wikiService = undefined
    this.sprintService = undefined
  }
}

export const appContext = new AppContext()
export const mainWindowManager = new MainWindowManager()


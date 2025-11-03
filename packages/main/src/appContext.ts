import { app, BrowserWindow } from 'electron'
import type { Session, WebContents } from 'electron'
import { join } from 'node:path'
import { existsSync } from 'node:fs'
import type { Sequelize } from 'sequelize-typescript'

import { logger, shouldSuppressDevtoolsMessage } from '@main/config/logger'
import { SessionManager } from '@main/services/auth/sessionManager'
import { AuditService } from '@main/services/audit'
import { AuthService } from '@main/services/auth'
import { ProjectService } from '@main/services/project'
import { TaskService } from '@main/services/task'
import { TaskStatusService } from '@main/services/taskStatus'
import { NoteService } from '@main/services/note'
import { ViewService } from '@main/services/view'
import { RoleService } from '@main/services/roles'

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

const FOCUS_REDUX_PANEL_SCRIPT = String.raw`
  (() => {
    const PANEL_LABELS = new Set(['Redux', 'Redux DevTools'])

    const clickNode = (node) => {
      if (!node) {
        return false
      }
      const isSelected = node.getAttribute && node.getAttribute('aria-selected') === 'true'
      if (isSelected) {
        return true
      }
      const eventInit = { bubbles: true, cancelable: true, composed: true }
      node.dispatchEvent?.(new MouseEvent('pointerdown', eventInit))
      node.dispatchEvent?.(new MouseEvent('pointerup', eventInit))
      node.dispatchEvent?.(new MouseEvent('mousedown', eventInit))
      node.dispatchEvent?.(new MouseEvent('mouseup', eventInit))
      node.click?.()
      return true
    }

    const collectShadowRoots = (root) => {
      const results = []
      if (!root || !root.querySelectorAll) {
        return results
      }
      const elements = root.querySelectorAll('*')
      for (const el of elements) {
        const shadow = el.shadowRoot
        if (shadow) {
          results.push(shadow)
        }
      }
      return results
    }

    const findReduxTab = () => {
      const visited = new Set()
      const queue = []

      if (document) {
        queue.push(document)
      }
      if (document.documentElement?.shadowRoot) {
        queue.push(document.documentElement.shadowRoot)
      }

      while (queue.length > 0) {
        const current = queue.shift()
        if (!current || visited.has(current) || !current.querySelectorAll) {
          continue
        }
        visited.add(current)

        const candidates = current.querySelectorAll('[role="tab"], .tabbed-pane-header')
        for (const node of candidates) {
          const label = (node.textContent ?? '').trim()
          if (!label) {
            continue
          }
          if (PANEL_LABELS.has(label)) {
            return node
          }
        }

        const shadowRoots = collectShadowRoots(current)
        for (const shadow of shadowRoots) {
          if (!visited.has(shadow)) {
            queue.push(shadow)
          }
        }
      }

      return null
    }

    const repositionTab = (tab) => {
      const parent = tab.parentElement
      if (!parent) {
        return
      }
      const firstElement = parent.firstElementChild
      if (!firstElement || firstElement === tab) {
        return
      }
      parent.insertBefore(tab, firstElement)
    }

    const showReduxPanelViaAPI = () => {
      const inspectorView = globalThis.UI?.InspectorView?.instance?.()
      const panels = globalThis.UI?.panels
      if (!inspectorView || !panels) {
        return false
      }

      const matchingPanels =
        panels && typeof panels === 'object'
          ? Object.values(panels).filter((panel) => {
              try {
                if (!panel || typeof panel !== 'object') {
                  return false
                }
                const identifiers = new Set()
                if (typeof panel._name === 'string') {
                  identifiers.add(panel._name)
                }
                if (typeof panel.getName === 'function') {
                  identifiers.add(panel.getName())
                }
                if (typeof panel.name === 'function') {
                  identifiers.add(panel.name())
                }
                if (typeof panel.name === 'string') {
                  identifiers.add(panel.name)
                }
                if (typeof panel.title === 'function') {
                  identifiers.add(panel.title())
                }
                for (const id of identifiers) {
                  if (typeof id === 'string' && PANEL_LABELS.has(id.trim())) {
                    return true
                  }
                }
                return false
              } catch {
                return false
              }
            })
          : []

      for (const panel of matchingPanels) {
        try {
          if (typeof inspectorView.setCurrentPanel === 'function') {
            inspectorView.setCurrentPanel(panel)
            return true
          }
        } catch {
          continue
        }
        try {
          const identifiers = []
          if (typeof panel._name === 'string') {
            identifiers.push(panel._name)
          }
          if (typeof panel.getName === 'function') {
            identifiers.push(panel.getName())
          }
          if (typeof panel.name === 'function') {
            identifiers.push(panel.name())
          }
          if (typeof panel.name === 'string') {
            identifiers.push(panel.name)
          }
          if (typeof panel.title === 'function') {
            identifiers.push(panel.title())
          }
          for (const id of identifiers) {
            if (typeof id === 'string' && typeof inspectorView.showPanel === 'function') {
              inspectorView.showPanel(id)
              return true
            }
          }
        } catch {
          continue
        }
      }
      return false
    }

    const attemptSelection = () => {
      if (showReduxPanelViaAPI()) {
        return true
      }

      const tab = findReduxTab()
      if (!tab) {
        return false
      }
      repositionTab(tab)
      clickNode(tab)
      return true
    }

    let resolved = attemptSelection()

    if (resolved) {
      return true
    }

    const observer = new MutationObserver(() => {
      if (attemptSelection()) {
        resolved = true
        observer.disconnect()
        if (intervalId) {
          clearInterval(intervalId)
        }
      }
    })

    const root = document.body || document.documentElement
    let intervalId = null

    if (root) {
      observer.observe(root, { childList: true, subtree: true })
      intervalId = window.setInterval(() => {
        if (resolved) {
          return
        }
        if (attemptSelection()) {
          resolved = true
          observer.disconnect()
          if (intervalId) {
            clearInterval(intervalId)
          }
        }
      }, 250)
      window.setTimeout(() => {
        observer.disconnect()
        if (intervalId) {
          clearInterval(intervalId)
        }
      }, 15000)
    }

    return resolved
  })();
`

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

      const focusReduxPanel = () => {
        if (devtools.isDestroyed()) {
          return
        }
        void devtools.executeJavaScript(FOCUS_REDUX_PANEL_SCRIPT, true).catch((error) => {
          this.logger.debug(
            `Redux DevTools auto-focus script failed: ${this.describeError(error)}`,
            'DevTools'
          )
        })
      }

      if (devtools.isLoadingMainFrame()) {
        devtools.once('did-finish-load', focusReduxPanel)
        return
      }

      focusReduxPanel()
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
  readonly authService = new AuthService(this.sessionManager, this.auditService)

  sequelize?: Sequelize
  projectService?: ProjectService
  taskService?: TaskService
  taskStatusService?: TaskStatusService
  noteService?: NoteService
  viewService?: ViewService
  roleService?: RoleService
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
  }
}

export const appContext = new AppContext()
export const mainWindowManager = new MainWindowManager()

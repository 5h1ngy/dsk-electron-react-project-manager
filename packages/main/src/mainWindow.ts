import { BrowserWindow } from 'electron'
import { join } from 'node:path'
import { is } from '@electron-toolkit/utils'
import { logger, shouldSuppressDevtoolsMessage } from './config/logger'

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

const loadWindowContent = (window: BrowserWindow): void => {
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    logger.debug('Loading renderer from dev server URL', 'Window')
    void window.loadURL(process.env['ELECTRON_RENDERER_URL'])
    return
  }

  logger.debug('Loading renderer from bundled HTML', 'Window')
  void window.loadFile(join(__dirname, '../renderer/index.html'))
}

export const createMainWindow = async (): Promise<BrowserWindow> => {
  const window = new BrowserWindow(MAIN_WINDOW_OPTIONS)
  logger.info('Main window instantiated', 'Window')

  window.on('ready-to-show', () => {
    logger.debug('Main window ready to show', 'Window')
    window.show()
  })

  if (is.dev) {
    window.webContents.once('dom-ready', () => {
      if (!window.webContents.isDevToolsOpened()) {
        logger.debug('Opening detached DevTools in development mode', 'Window')
        window.webContents.openDevTools({ mode: 'detach' })
      }
    })
  }

  window.webContents.on('console-message', (event, level, message, line, sourceId) => {
    if (shouldSuppressDevtoolsMessage(sourceId, message)) {
      event.preventDefault()
      return
    }
    logger.renderer(level, message, sourceId, line)
  })

  window.webContents.on('did-finish-load', () => {
    logger.success('Renderer finished loading', 'Window')
  })

  window.on('closed', () => {
    logger.debug('Destroying BrowserWindow instance', 'Window')
    window.destroy()
  })

  loadWindowContent(window)

  return window
}

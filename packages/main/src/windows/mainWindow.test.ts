let devFlag = false

const isObject: Record<string, unknown> = {}
Object.defineProperty(isObject, 'dev', {
  get: () => devFlag
})

const domReadyHandlers: Array<() => void> = []
const consoleMessageHandlers: Array<
  (event: any, level: number, message: string, line: number, sourceId: string) => void
> = []
const openDevToolsMock = jest.fn()
const isDevToolsOpenedMock = jest.fn()
const onceMock = jest.fn()
const windowOnMock = jest.fn()
const showMock = jest.fn()
const destroyMock = jest.fn()
const loadURLMock = jest.fn()
const loadFileMock = jest.fn()
const webContentsOnMock = jest.fn()

const infoMock = jest.fn()
const warnMock = jest.fn()
const errorMock = jest.fn()
const successMock = jest.fn()
const debugMock = jest.fn()
const rendererMock = jest.fn()
const suppressMock = jest.fn().mockReturnValue(false)

jest.mock('../utils/logger', () => ({
  logger: {
    info: infoMock,
    warn: warnMock,
    error: errorMock,
    success: successMock,
    debug: debugMock,
    renderer: rendererMock
  },
  shouldSuppressDevtoolsMessage: suppressMock
}))

const browserWindowInstance = {
  webContents: {
    once: onceMock,
    isDevToolsOpened: isDevToolsOpenedMock,
    openDevTools: openDevToolsMock,
    on: webContentsOnMock
  },
  on: windowOnMock,
  show: showMock,
  destroy: destroyMock,
  loadURL: loadURLMock,
  loadFile: loadFileMock
}

const browserWindowConstructor = jest.fn(() => browserWindowInstance)

jest.mock('electron', () => ({
  BrowserWindow: browserWindowConstructor
}))

jest.mock('@electron-toolkit/utils', () => ({
  is: isObject
}))

import { MAIN_WINDOW_OPTIONS, createMainWindow } from './mainWindow'

const runDomReadyHandlers = () => {
  domReadyHandlers.splice(0).forEach((handler) => handler())
}

beforeEach(() => {
  devFlag = false
  domReadyHandlers.length = 0
  consoleMessageHandlers.length = 0
  openDevToolsMock.mockClear()
  isDevToolsOpenedMock.mockReset().mockReturnValue(false)
  onceMock.mockReset().mockImplementation((event: string, handler: () => void) => {
    if (event === 'dom-ready') {
      domReadyHandlers.push(handler)
    }
  })
  windowOnMock.mockReset()
  webContentsOnMock.mockReset().mockImplementation((event: string, handler: (...args: any[]) => void) => {
    if (event === 'console-message') {
      consoleMessageHandlers.push(handler as any)
    }
  })
  showMock.mockReset()
  destroyMock.mockReset()
  loadURLMock.mockResolvedValue(undefined)
  loadFileMock.mockResolvedValue(undefined)
  browserWindowConstructor.mockClear()
  delete process.env['ELECTRON_RENDERER_URL']
  infoMock.mockClear()
  warnMock.mockClear()
  errorMock.mockClear()
  successMock.mockClear()
  debugMock.mockClear()
  rendererMock.mockClear()
  suppressMock.mockReset().mockReturnValue(false)
})

describe('main window configuration', () => {
  it('enables hardened web preferences', () => {
    const prefs = MAIN_WINDOW_OPTIONS.webPreferences
    expect(prefs?.sandbox).toBe(true)
    expect(prefs?.contextIsolation).toBe(true)
    expect(prefs?.nodeIntegration).toBe(false)
    expect(prefs?.enableRemoteModule).toBe(false)
  })

  it('sets application window defaults', () => {
    expect(MAIN_WINDOW_OPTIONS.autoHideMenuBar).toBe(true)
    expect(MAIN_WINDOW_OPTIONS.show).toBe(false)
    expect(MAIN_WINDOW_OPTIONS.width).toBeGreaterThan(0)
    expect(MAIN_WINDOW_OPTIONS.height).toBeGreaterThan(0)
  })
})

describe('createMainWindow', () => {
  it('does not open devtools in production mode', async () => {
    devFlag = false
    await createMainWindow()

    expect(onceMock).not.toHaveBeenCalledWith('dom-ready', expect.any(Function))
    expect(openDevToolsMock).not.toHaveBeenCalled()
  })

  it('opens devtools automatically in development mode', async () => {
    devFlag = true
    await createMainWindow()

    expect(onceMock).toHaveBeenCalledWith('dom-ready', expect.any(Function))

    runDomReadyHandlers()

    expect(openDevToolsMock).toHaveBeenCalledWith({ mode: 'detach' })
  })

  it('skips opening devtools if already visible', async () => {
    devFlag = true
    isDevToolsOpenedMock.mockReturnValue(true)

    await createMainWindow()

    runDomReadyHandlers()

    expect(openDevToolsMock).not.toHaveBeenCalled()
  })

  it('forwards renderer console messages', async () => {
    devFlag = true
    await createMainWindow()

    expect(consoleMessageHandlers).toHaveLength(1)

    const handler = consoleMessageHandlers[0]
    const event = { preventDefault: jest.fn() } as any
    handler(event, 2, 'Renderer error', 10, 'app://index.tsx')

    expect(event.preventDefault).not.toHaveBeenCalled()
    expect(rendererMock).toHaveBeenCalledWith(2, 'Renderer error', 'app://index.tsx', 10)
  })

  it('suppresses known devtools autofill noise', async () => {
    devFlag = true
    suppressMock.mockReturnValue(true)

    await createMainWindow()

    const handler = consoleMessageHandlers[0]
    const event = { preventDefault: jest.fn() } as any
    handler(event, 2, 'Request Autofill.enable failed', 1, 'devtools://foo')

    expect(event.preventDefault).toHaveBeenCalled()
    expect(rendererMock).not.toHaveBeenCalled()
  })
})


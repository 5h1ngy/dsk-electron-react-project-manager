import { MAIN_WINDOW_OPTIONS, MainWindowManager } from './appContext'

type ConsoleHandler = (
  event: { preventDefault: jest.Mock },
  level: number,
  message: string,
  line: number,
  sourceId: string
) => void

interface WindowDouble {
  domReadyHandlers: Array<() => void>
  consoleHandlers: Array<ConsoleHandler>
  readyHandlers: Array<() => void>
  closedHandlers: Array<() => void>
  window: any
  browserWindowCtor: jest.Mock
  loadURLMock: jest.Mock
  loadFileMock: jest.Mock
  openDevToolsMock: jest.Mock
  isDevToolsOpenedMock: jest.Mock
  showMock: jest.Mock
  destroyMock: jest.Mock
}

const createWindowDouble = (): WindowDouble => {
  const domReadyHandlers: Array<() => void> = []
  const consoleHandlers: Array<ConsoleHandler> = []
  const readyHandlers: Array<() => void> = []
  const closedHandlers: Array<() => void> = []
  const didFinishLoadHandlers: Array<() => void> = []

  const openDevToolsMock = jest.fn()
  const isDevToolsOpenedMock = jest.fn().mockReturnValue(false)
  const loadURLMock = jest.fn()
  const loadFileMock = jest.fn()
  const showMock = jest.fn()
  const destroyMock = jest.fn()

  const window = {
    webContents: {
      once: jest.fn((event: string, handler: () => void) => {
        if (event === 'dom-ready') {
          domReadyHandlers.push(handler)
        }
      }),
      on: jest.fn((event: string, handler: (...args: any[]) => void) => {
        if (event === 'console-message') {
          consoleHandlers.push(handler as ConsoleHandler)
        }
        if (event === 'did-finish-load') {
          didFinishLoadHandlers.push(handler)
        }
      }),
      isDevToolsOpened: isDevToolsOpenedMock,
      openDevTools: openDevToolsMock
    },
    on: jest.fn((event: string, handler: () => void) => {
      if (event === 'ready-to-show') {
        readyHandlers.push(handler)
      }
      if (event === 'closed') {
        closedHandlers.push(handler)
      }
    }),
    show: showMock,
    destroy: destroyMock,
    loadURL: loadURLMock,
    loadFile: loadFileMock
  }

  const browserWindowCtor = jest.fn(() => window)

  return {
    domReadyHandlers,
    consoleHandlers,
    readyHandlers,
    closedHandlers,
    window,
    browserWindowCtor,
    loadURLMock,
    loadFileMock,
    openDevToolsMock,
    isDevToolsOpenedMock,
    showMock,
    destroyMock
  }
}

const createLoggerMock = () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  success: jest.fn(),
  debug: jest.fn(),
  renderer: jest.fn()
})

describe('MainWindowManager', () => {
  let devMode: boolean
  let env: NodeJS.ProcessEnv
  let suppressMock: jest.Mock
  let loggerMock: ReturnType<typeof createLoggerMock>
  let windowDouble: WindowDouble
  let manager: MainWindowManager

  const createManager = () =>
    new MainWindowManager({
      browserWindowCtor: windowDouble.browserWindowCtor as any,
      env,
      isDev: () => devMode,
      logger: loggerMock,
      shouldSuppress: suppressMock
    })

  beforeEach(() => {
    devMode = false
    env = {}
    suppressMock = jest.fn().mockReturnValue(false)
    loggerMock = createLoggerMock()
    windowDouble = createWindowDouble()
    manager = createManager()
  })

  it('configures the window with hardened preferences', () => {
    const prefs = MAIN_WINDOW_OPTIONS.webPreferences
    expect(prefs?.sandbox).toBe(true)
    expect(prefs?.contextIsolation).toBe(true)
    expect(prefs?.nodeIntegration).toBe(false)
  })

  it('opens devtools automatically in development mode', async () => {
    devMode = true
    manager = createManager()

    await manager.createMainWindow()

    expect(windowDouble.domReadyHandlers).toHaveLength(1)
    windowDouble.domReadyHandlers[0]()

    expect(windowDouble.openDevToolsMock).toHaveBeenCalledWith({ mode: 'detach' })
  })

  it('skips opening devtools when already visible', async () => {
    devMode = true
    windowDouble.isDevToolsOpenedMock.mockReturnValue(true)
    manager = createManager()

    await manager.createMainWindow()
    windowDouble.domReadyHandlers[0]()

    expect(windowDouble.openDevToolsMock).not.toHaveBeenCalled()
  })

  it('loads the dev server URL when configured', async () => {
    devMode = true
    env = { ELECTRON_RENDERER_URL: 'http://localhost:5173' } as NodeJS.ProcessEnv
    manager = createManager()

    await manager.createMainWindow()

    expect(windowDouble.loadURLMock).toHaveBeenCalledWith('http://localhost:5173')
    expect(windowDouble.loadFileMock).not.toHaveBeenCalled()
  })

  it('loads the bundled HTML when dev server URL is unavailable', async () => {
    await manager.createMainWindow()

    expect(windowDouble.loadFileMock).toHaveBeenCalledWith(
      expect.stringMatching(/renderer[\\/]+index\.html$/)
    )
    expect(windowDouble.loadURLMock).not.toHaveBeenCalled()
  })

  it('forwards renderer console messages', async () => {
    devMode = true
    manager = createManager()

    await manager.createMainWindow()

    const handler = windowDouble.consoleHandlers[0]
    const event = { preventDefault: jest.fn() }
    handler(event, 2, 'Renderer error', 42, 'app://index.tsx')

    expect(event.preventDefault).not.toHaveBeenCalled()
    expect(loggerMock.renderer).toHaveBeenCalledWith(2, 'Renderer error', 'app://index.tsx', 42)
  })

  it('suppresses known devtools noise', async () => {
    suppressMock.mockReturnValue(true)
    manager = createManager()

    await manager.createMainWindow()

    const handler = windowDouble.consoleHandlers[0]
    const event = { preventDefault: jest.fn() }
    handler(event as any, 1, 'noise', 0, 'devtools://foo')

    expect(event.preventDefault).toHaveBeenCalled()
    expect(loggerMock.renderer).not.toHaveBeenCalled()
  })

  it('shows the window when ready', async () => {
    await manager.createMainWindow()
    expect(windowDouble.readyHandlers).toHaveLength(1)

    windowDouble.readyHandlers[0]()

    expect(windowDouble.showMock).toHaveBeenCalled()
  })
})

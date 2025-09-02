
const exposeMock = jest.fn()

jest.mock('electron', () => ({
  contextBridge: {
    exposeInMainWorld: exposeMock
  }
}))

describe('preload entry point', () => {
  afterEach(() => {
    exposeMock.mockClear()
    jest.resetModules()
  })

  it('exposes the preload api when context isolation is enabled', async () => {
    ;(process as any).contextIsolated = true
    await import('./index')
    expect(exposeMock).toHaveBeenCalledWith('api', expect.any(Object))
  })

  it('assigns api on window when context isolation is disabled', async () => {
    ;(process as any).contextIsolated = false
    const originalWindow = (global as any).window
    try {
      ;(global as any).window = {} as Record<string, unknown>
      await import('./index')
      expect((global as any).window.api).toBeDefined()
    } finally {
      ;(global as any).window = originalWindow
    }
  })
})

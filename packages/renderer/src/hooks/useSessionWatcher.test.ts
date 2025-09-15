import { act, renderHook } from '@testing-library/react'

import { useSessionWatcher } from '@renderer/hooks/useSessionWatcher'
import { forceLogout } from '@renderer/store/slices/auth'
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import {
  handleResponse,
  isSessionExpiredError,
  persistToken
} from '@renderer/store/slices/auth/helpers'

jest.mock('@renderer/store/hooks', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn()
}))

jest.mock('@renderer/store/slices/auth', () => ({
  forceLogout: jest.fn(),
  selectToken: jest.fn()
}))

jest.mock('@renderer/store/slices/auth/helpers', () => ({
  handleResponse: jest.fn(),
  isSessionExpiredError: jest.fn(),
  persistToken: jest.fn()
}))

describe('useSessionWatcher', () => {
  const dispatch = jest.fn()
  const forceLogoutAction: ReturnType<typeof forceLogout> = {
    type: 'auth/forceLogout',
    payload: undefined
  }
  const sessionSpy = jest.fn()
  const mockedUseAppDispatch = useAppDispatch as jest.MockedFunction<typeof useAppDispatch>
  const mockedUseAppSelector = useAppSelector as jest.MockedFunction<typeof useAppSelector>
  const mockedForceLogout = forceLogout as jest.MockedFunction<typeof forceLogout>

  const flushEffects = async () => {
    await act(async () => {
      await Promise.resolve()
    })
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    mockedUseAppDispatch.mockReturnValue(dispatch)
    mockedUseAppSelector.mockReturnValue('token-123')
    mockedForceLogout.mockReturnValue(forceLogoutAction)
    sessionSpy.mockResolvedValue({ ok: true })
    ;(handleResponse as jest.Mock).mockImplementation(async () => ({ token: 'token-123' }))
    ;(isSessionExpiredError as jest.Mock).mockReturnValue(false)
    ;(persistToken as jest.Mock).mockImplementation(() => {})
    window.api = {
      auth: {
        session: sessionSpy
      }
    } as unknown as typeof window.api
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('does nothing when there is no session token', async () => {
    mockedUseAppSelector.mockReturnValue(null)

    renderHook(() => useSessionWatcher())
    await flushEffects()

    expect(window.api.auth.session).not.toHaveBeenCalled()
    expect(handleResponse).not.toHaveBeenCalled()
  })

  it('clears session and dispatches logout when the backend returns no session', async () => {
    ;(handleResponse as jest.Mock).mockResolvedValueOnce(null)

    renderHook(() => useSessionWatcher())
    await flushEffects()

    expect(persistToken).toHaveBeenCalledWith(null)
    expect(forceLogout).toHaveBeenCalledTimes(1)
    expect(dispatch).toHaveBeenCalledWith(forceLogoutAction)
  })

  it('handles session expiration errors', async () => {
    const error = new Error('Sessione scaduta')
    ;(handleResponse as jest.Mock).mockRejectedValueOnce(error)
    ;(isSessionExpiredError as jest.Mock).mockReturnValueOnce(true)

    renderHook(() => useSessionWatcher())
    await flushEffects()

    expect(isSessionExpiredError).toHaveBeenCalledWith(error)
    expect(persistToken).toHaveBeenCalledWith(null)
    expect(dispatch).toHaveBeenCalledWith(forceLogoutAction)
  })

  it('cleans up the polling interval when unmounted', async () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval')
    const { unmount } = renderHook(() => useSessionWatcher())

    await flushEffects()
    unmount()

    expect(clearIntervalSpy).toHaveBeenCalled()
    clearIntervalSpy.mockRestore()
  })
})

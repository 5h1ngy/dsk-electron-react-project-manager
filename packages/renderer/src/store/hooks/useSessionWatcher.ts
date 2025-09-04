import { useEffect } from 'react'

import { handleResponse, isSessionExpiredError, persistToken } from '@renderer/store/slices/auth/helpers'
import { forceLogout, selectToken } from '@renderer/store/slices/auth'
import { useAppDispatch, useAppSelector } from '../hooks'

const POLL_INTERVAL_MS = 60_000

export const useSessionWatcher = (): void => {
  const dispatch = useAppDispatch()
  const token = useAppSelector(selectToken)

  useEffect(() => {
    if (!token) {
      return
    }

    let cancelled = false

    const checkSession = async () => {
      try {
        const session = await handleResponse(window.api.auth.session(token))
        if (!session && !cancelled) {
          persistToken(null)
          dispatch(forceLogout())
        }
      } catch (error) {
        if (!cancelled && isSessionExpiredError(error)) {
          persistToken(null)
          dispatch(forceLogout())
        }
      }
    }

    const intervalId = setInterval(checkSession, POLL_INTERVAL_MS)
    void checkSession()

    return () => {
      cancelled = true
      clearInterval(intervalId)
    }
  }, [dispatch, token])
}

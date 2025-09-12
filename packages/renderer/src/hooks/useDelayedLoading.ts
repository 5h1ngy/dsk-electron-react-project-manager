import { useEffect, useRef, useState } from 'react'

export interface UseDelayedLoadingOptions {
  delayMs?: number
}

const DEFAULT_DELAY = 1300

/**
 * Ensures a loading skeleton stays visible for at least the configured delay.
 * Useful to prevent flickering when content loads very quickly.
 */
export const useDelayedLoading = (
  loading: boolean,
  options?: UseDelayedLoadingOptions
): boolean => {
  const delay = options?.delayMs ?? DEFAULT_DELAY
  const [isVisible, setVisible] = useState<boolean>(loading)
  const startedAtRef = useRef<number | null>(loading ? Date.now() : null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (loading) {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      startedAtRef.current = Date.now()
      setVisible(true)
      return
    }

    if (startedAtRef.current === null) {
      setVisible(false)
      return
    }

    const elapsed = Date.now() - startedAtRef.current
    if (elapsed >= delay) {
      startedAtRef.current = null
      setVisible(false)
      return
    }

    timerRef.current = setTimeout(() => {
      startedAtRef.current = null
      setVisible(false)
      timerRef.current = null
    }, delay - elapsed)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [delay, loading])

  useEffect(
    () => () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    },
    []
  )

  return isVisible
}


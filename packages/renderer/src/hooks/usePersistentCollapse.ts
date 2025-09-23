import { useCallback, useEffect, useState } from 'react'

const isBrowser = typeof window !== 'undefined'

const readStoredKeys = (storageKey: string, fallback: string[]): string[] => {
  if (!isBrowser) {
    return fallback
  }
  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) {
      return fallback
    }
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
      return parsed
    }
  } catch {
    // ignore parse errors and fall back to default
  }
  return fallback
}

export const usePersistentCollapse = (
  storageKey: string,
  defaultKeys: string[] = []
): [string[], (keys: string | string[]) => void] => {
  const [activeKeys, setActiveKeys] = useState<string[]>(() => readStoredKeys(storageKey, defaultKeys))

  useEffect(() => {
    if (!isBrowser) {
      return
    }
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(activeKeys))
    } catch {
      // ignore write errors
    }
  }, [activeKeys, storageKey])

  const handleChange = useCallback((keys: string | string[]) => {
    if (Array.isArray(keys)) {
      setActiveKeys(keys)
    } else {
      setActiveKeys(keys ? [keys] : [])
    }
  }, [])

  return [activeKeys, handleChange]
}

export default usePersistentCollapse


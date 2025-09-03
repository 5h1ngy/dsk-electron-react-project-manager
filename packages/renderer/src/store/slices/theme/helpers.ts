import { THEME_STORAGE_KEY } from './constants'
import type { ThemeMode } from './types'

export const readInitialMode = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return 'light'
  }
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  return stored === 'dark' ? 'dark' : 'light'
}

export const persistMode = (mode: ThemeMode): void => {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(THEME_STORAGE_KEY, mode)
}

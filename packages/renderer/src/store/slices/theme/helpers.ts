import {
  DEFAULT_ACCENT_COLOR,
  THEME_ACCENT_STORAGE_KEY,
  THEME_STORAGE_KEY
} from '@renderer/store/slices/theme/constants'
import type { ThemeMode } from '@renderer/store/slices/theme/types'

export const readInitialMode = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return 'dark'
  }
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') {
    return stored
  }
  return 'dark'
}

export const persistMode = (mode: ThemeMode): void => {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(THEME_STORAGE_KEY, mode)
}

export const readInitialAccentColor = (): string => {
  if (typeof window === 'undefined') {
    return DEFAULT_ACCENT_COLOR
  }
  const storedAccent = window.localStorage.getItem(THEME_ACCENT_STORAGE_KEY)
  return storedAccent ?? DEFAULT_ACCENT_COLOR
}

export const persistAccentColor = (color: string): void => {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(THEME_ACCENT_STORAGE_KEY, color)
}

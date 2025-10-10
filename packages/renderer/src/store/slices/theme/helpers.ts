import {
  DEFAULT_ACCENT_COLOR,
  THEME_ACCENT_STORAGE_KEY,
  THEME_STORAGE_KEY
} from '@renderer/store/slices/theme/constants'
import { ACCENT_PRESETS } from '@renderer/theme/foundations/brand'
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
  const fallback = DEFAULT_ACCENT_COLOR
  if (typeof window === 'undefined') {
    return fallback
  }

  const storedAccent = window.localStorage.getItem(THEME_ACCENT_STORAGE_KEY)

  if (
    storedAccent &&
    ACCENT_PRESETS.includes(
      storedAccent as (typeof ACCENT_PRESETS)[number]
    )
  ) {
    return storedAccent
  }

  return fallback
}

export const persistAccentColor = (color: string): void => {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(THEME_ACCENT_STORAGE_KEY, color)
}

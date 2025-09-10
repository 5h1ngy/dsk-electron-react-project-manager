import { i18n } from '@renderer/i18n/config'

import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, SUPPORTED_LOCALES } from '@renderer/store/slices/locale/constants'
import type { SupportedLocale } from '@renderer/store/slices/locale/types'

export const coerceLocale = (value: string | null | undefined): SupportedLocale => {
  if (!value) {
    return DEFAULT_LOCALE
  }
  if ((SUPPORTED_LOCALES as readonly string[]).includes(value)) {
    return value as SupportedLocale
  }
  const normalized = value.split('-')[0]
  if ((SUPPORTED_LOCALES as readonly string[]).includes(normalized)) {
    return normalized as SupportedLocale
  }
  return DEFAULT_LOCALE
}

export const readInitialLocale = (): SupportedLocale => {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE
  }
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
  return coerceLocale(stored ?? i18n.language)
}

export const persistLocale = (locale: SupportedLocale): void => {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
}

import type { SupportedLocale } from './types'

export const SUPPORTED_LOCALES: readonly SupportedLocale[] = ['it', 'en', 'de', 'fr'] as const
export const DEFAULT_LOCALE: SupportedLocale = 'it'
export const LOCALE_STORAGE_KEY = 'locale'

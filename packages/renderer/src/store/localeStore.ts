import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { i18n } from '@renderer/i18n/config'

const supportedLocales = ['it', 'en', 'de', 'fr'] as const

export type SupportedLocale = (typeof supportedLocales)[number]

const defaultLocale: SupportedLocale = 'it'

const coerceLocale = (value: string | null | undefined): SupportedLocale => {
  if (!value) {
    return defaultLocale
  }
  if ((supportedLocales as readonly string[]).includes(value)) {
    return value as SupportedLocale
  }
  const normalized = value.split('-')[0]
  if ((supportedLocales as readonly string[]).includes(normalized)) {
    return normalized as SupportedLocale
  }
  return defaultLocale
}

interface LocaleState {
  locale: SupportedLocale
  setLocale: (locale: SupportedLocale) => void
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: coerceLocale(i18n.language),
      setLocale: (locale) => {
        void i18n.changeLanguage(locale)
        set({ locale })
      }
    }),
    {
      name: 'locale-store',
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state?.locale) {
          void i18n.changeLanguage(state.locale)
        }
      }
    }
  )
)

export const supportedLocaleOptions: readonly SupportedLocale[] = supportedLocales

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { i18n } from '@renderer/i18n/config'

import type { AppThunk, RootState } from '../index'

export type SupportedLocale = 'it' | 'en' | 'de' | 'fr'

const STORAGE_KEY = 'locale'

const supportedLocales: SupportedLocale[] = ['it', 'en', 'de', 'fr']

const coerceLocale = (value: string | null | undefined): SupportedLocale => {
  if (!value) {
    return 'it'
  }
  if (supportedLocales.includes(value as SupportedLocale)) {
    return value as SupportedLocale
  }
  const normalized = value.split('-')[0]
  return supportedLocales.includes(normalized as SupportedLocale) ? (normalized as SupportedLocale) : 'it'
}

const readInitialLocale = (): SupportedLocale => {
  if (typeof window === 'undefined') {
    return 'it'
  }
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return coerceLocale(stored ?? i18n.language)
}

interface LocaleState {
  locale: SupportedLocale
}

const initialState: LocaleState = {
  locale: readInitialLocale()
}

void i18n.changeLanguage(initialState.locale)

const localeSlice = createSlice({
  name: 'locale',
  initialState,
  reducers: {
    setLocale: (state, action: PayloadAction<SupportedLocale>) => {
      state.locale = action.payload
      window.localStorage.setItem(STORAGE_KEY, action.payload)
    }
  }
})

export const localeReducer = localeSlice.reducer
export const { setLocale } = localeSlice.actions

export const selectLocale = (state: RootState): SupportedLocale => state.locale.locale

export const selectSupportedLocales = (): readonly SupportedLocale[] => supportedLocales

export const changeLocale =
  (locale: SupportedLocale): AppThunk =>
  (dispatch) => {
    void i18n.changeLanguage(locale)
    dispatch(setLocale(locale))
  }

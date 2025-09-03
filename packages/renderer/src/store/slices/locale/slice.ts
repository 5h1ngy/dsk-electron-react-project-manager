import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { i18n } from '@renderer/i18n/config'

import { persistLocale, readInitialLocale } from './helpers'
import type { LocaleState, SupportedLocale } from './types'

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
      persistLocale(action.payload)
    }
  }
})

export const localeReducer = localeSlice.reducer
export const { setLocale } = localeSlice.actions

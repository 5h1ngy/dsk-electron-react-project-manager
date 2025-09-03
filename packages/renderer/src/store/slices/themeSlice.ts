import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '../index'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'theme-mode'

const readInitialMode = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return 'light'
  }
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === 'dark' ? 'dark' : 'light'
}

interface ThemeState {
  mode: ThemeMode
}

const initialState: ThemeState = {
  mode: readInitialMode()
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setMode: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload
      window.localStorage.setItem(STORAGE_KEY, action.payload)
    },
    toggleMode: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light'
      window.localStorage.setItem(STORAGE_KEY, state.mode)
    }
  }
})

export const themeReducer = themeSlice.reducer
export const { setMode, toggleMode } = themeSlice.actions

export const selectThemeMode = (state: RootState): ThemeMode => state.theme.mode

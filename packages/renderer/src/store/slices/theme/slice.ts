import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { persistAccentColor, persistMode, readInitialAccentColor, readInitialMode } from './helpers'
import type { ThemeMode, ThemeState } from './types'

const initialState: ThemeState = {
  mode: readInitialMode(),
  accentColor: readInitialAccentColor()
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setMode: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload
      persistMode(action.payload)
    },
    toggleMode: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light'
      persistMode(state.mode)
    },
    setAccentColor: (state, action: PayloadAction<string>) => {
      state.accentColor = action.payload
      persistAccentColor(action.payload)
    }
  }
})

export const themeReducer = themeSlice.reducer
export const { setMode, toggleMode, setAccentColor } = themeSlice.actions

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { persistMode, readInitialMode } from './helpers'
import type { ThemeMode, ThemeState } from './types'

const initialState: ThemeState = {
  mode: readInitialMode()
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
    }
  }
})

export const themeReducer = themeSlice.reducer
export const { setMode, toggleMode } = themeSlice.actions

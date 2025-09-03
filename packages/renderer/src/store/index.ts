import { configureStore } from '@reduxjs/toolkit'

import { authReducer } from './slices/authSlice'
import { localeReducer } from './slices/localeSlice'
import { themeReducer } from './slices/themeSlice'

const createStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      locale: localeReducer,
      theme: themeReducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false
      })
  })

export const store = createStore()

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppThunk<ReturnType = void> = (dispatch: AppDispatch, getState: () => RootState) => ReturnType

export const createAppStore = createStore

import { configureStore } from '@reduxjs/toolkit'

import { authReducer } from './slices/auth'
import { localeReducer } from './slices/locale'
import { themeReducer } from './slices/theme'

export const setupStore = () =>
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

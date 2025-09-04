import { configureStore } from '@reduxjs/toolkit'

import { authReducer } from './slices/auth'
import { localeReducer } from './slices/locale'
import { themeReducer } from './slices/theme'
import { projectsReducer } from './slices/projects'
import { tasksReducer } from './slices/tasks'

export const setupStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      locale: localeReducer,
      theme: themeReducer,
      projects: projectsReducer,
      tasks: tasksReducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false
      })
  })

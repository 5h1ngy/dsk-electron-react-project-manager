import { configureStore } from '@reduxjs/toolkit'

import { authReducer } from '@renderer/store/slices/auth'
import { localeReducer } from '@renderer/store/slices/locale'
import { themeReducer } from '@renderer/store/slices/theme'
import { projectsReducer } from '@renderer/store/slices/projects'
import { tasksReducer } from '@renderer/store/slices/tasks'

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

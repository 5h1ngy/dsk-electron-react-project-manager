import { configureStore } from '@reduxjs/toolkit'
import { devToolsEnhancer } from '@redux-devtools/extension'

import { authReducer } from '@renderer/store/slices/auth'
import { localeReducer } from '@renderer/store/slices/locale'
import { themeReducer } from '@renderer/store/slices/theme'
import { projectsReducer } from '@renderer/store/slices/projects'
import { tasksReducer } from '@renderer/store/slices/tasks'
import { notesReducer } from '@renderer/store/slices/notes'
import { wikiReducer } from '@renderer/store/slices/wiki'
import { viewsReducer } from '@renderer/store/slices/views'
import { taskStatusesReducer } from '@renderer/store/slices/taskStatuses'
import { sprintsReducer } from '@renderer/store/slices/sprints'
const resolveDevtoolsEnabled = (): boolean => {
  if (typeof window === 'undefined') {
    return false
  }

  if (typeof window.devtoolsConfig?.enabled === 'boolean') {
    return window.devtoolsConfig.enabled
  }

  // Fallback for tests and non-preload contexts
  return Boolean(import.meta.env.DEV)
}

export const setupStore = () => {
  const devtoolsEnabled = resolveDevtoolsEnabled()

  return configureStore({
    reducer: {
      auth: authReducer,
      locale: localeReducer,
      theme: themeReducer,
      projects: projectsReducer,
      tasks: tasksReducer,
      notes: notesReducer,
      wiki: wikiReducer,
      views: viewsReducer,
      taskStatuses: taskStatusesReducer,
      sprints: sprintsReducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false
      }),
    devTools: false,
    enhancers: (getDefaultEnhancers) => {
      const baseEnhancers = getDefaultEnhancers()

      if (!devtoolsEnabled) {
        return baseEnhancers
      }

      return baseEnhancers.concat(
        devToolsEnhancer({
          name: 'DSK Project Manager',
          trace: true
        })
      )
    }
  })
}

import { contextBridge } from 'electron'
import { healthApi } from '@preload/api/health'
import { authApi } from '@preload/api/auth'
import { projectApi } from '@preload/api/project'
import { taskApi } from '@preload/api/task'
import { taskStatusApi } from '@preload/api/taskStatus'
import { noteApi } from '@preload/api/note'
import { wikiApi } from '@preload/api/wiki'
import { viewApi } from '@preload/api/view'
import { roleApi } from '@preload/api/role'
import { databaseApi } from '@preload/api/database'
import type { PreloadApi } from '@preload/types'

const parseDevtoolsToggle = (value: string | undefined): boolean | null => {
  if (!value) {
    return null
  }

  const normalized = value.trim().toLowerCase()
  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true
  }

  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false
  }

  return null
}

const shouldEnableDevtools = (): boolean => {
  const toggle = parseDevtoolsToggle(process.env.ENABLE_DEVTOOLS)
  if (toggle !== null) {
    return toggle
  }
  return process.env.NODE_ENV !== 'production'
}

const api: PreloadApi = Object.freeze({
  health: healthApi,
  auth: authApi,
  project: projectApi,
  task: taskApi,
  taskStatus: taskStatusApi,
  note: noteApi,
  wiki: wikiApi,
  view: viewApi,
  role: roleApi,
  database: databaseApi
})

const devtoolsConfig = Object.freeze({
  enabled: shouldEnableDevtools()
})

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('devtoolsConfig', devtoolsConfig)
  } catch (error) {
    console.error('Failed to expose preload API', error)
  }
} else {
  ;(window as unknown as { api: PreloadApi }).api = api
  ;(window as unknown as { devtoolsConfig: typeof devtoolsConfig }).devtoolsConfig = devtoolsConfig
}


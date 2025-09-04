import { contextBridge } from 'electron'
import { healthApi } from './api/health'
import { authApi } from './api/auth'
import { projectApi } from './api/project'
import { taskApi } from './api/task'
import type { PreloadApi } from './types'

const api: PreloadApi = Object.freeze({
  health: healthApi,
  auth: authApi,
  project: projectApi,
  task: taskApi
})

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error('Failed to expose preload API', error)
  }
} else {
  ;(window as unknown as { api: PreloadApi }).api = api
}

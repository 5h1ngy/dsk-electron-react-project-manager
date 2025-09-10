import { contextBridge } from 'electron'
import { healthApi } from '@preload/api/health'
import { authApi } from '@preload/api/auth'
import { projectApi } from '@preload/api/project'
import { taskApi } from '@preload/api/task'
import type { PreloadApi } from '@preload/types'

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

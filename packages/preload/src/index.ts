import { contextBridge } from 'electron'
import { healthApi } from './api/health'
import type { PreloadApi } from './types'

const api: PreloadApi = Object.freeze({
  health: healthApi
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

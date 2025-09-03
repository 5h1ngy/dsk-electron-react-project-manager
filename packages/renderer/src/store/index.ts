import { setupStore } from './setupStore'
export * from './types'

export const createAppStore = setupStore
export const store = setupStore()

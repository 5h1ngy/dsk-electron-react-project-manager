import { setupStore } from '@renderer/store/setupStore'
export * from '@renderer/store/types'

export const createAppStore = setupStore
export const store = setupStore()

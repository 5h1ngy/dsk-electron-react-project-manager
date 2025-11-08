import type { PreloadApi } from '@preload/types'

interface DevtoolsConfig {
  enabled: boolean
}

declare global {
  interface Window {
    api: PreloadApi
    devtoolsConfig?: DevtoolsConfig
  }
}

export {}

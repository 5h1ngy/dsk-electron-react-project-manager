/// <reference types="vite/client" />
/// <reference types='@testing-library/jest-dom' />

import type { PreloadApi } from '@preload/types'

interface DevtoolsConfig {
  enabled: boolean
}

declare global {
  interface ImportMetaEnv {
    readonly VITE_APP_RUNTIME?: 'desktop' | 'webapp'
    readonly VITE_API_BASE_URL?: string
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }

  interface Window {
    api: PreloadApi
    devtoolsConfig?: DevtoolsConfig
  }
}

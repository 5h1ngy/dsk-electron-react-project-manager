/// <reference types="vite/client" />

import type { PreloadApi } from '@preload/types'

declare global {
  interface Window {
    api: PreloadApi
  }
}

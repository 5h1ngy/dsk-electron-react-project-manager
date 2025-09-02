/// <reference types="vite/client" />
/// <reference types='@testing-library/jest-dom' />

import type { PreloadApi } from '@preload/types'

declare global {
  interface Window {
    api: PreloadApi
  }
}

import type { HealthResponse } from '@main/ipc/health'

export interface HealthApi {
  check: () => Promise<HealthResponse>
}

export interface PreloadApi {
  health: HealthApi
}

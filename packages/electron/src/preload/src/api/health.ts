import { ipcRenderer } from 'electron'
import type { HealthResponse } from '@main/ipc/health'

const CHANNEL = 'system:health'

const isValidHealthResponse = (payload: unknown): payload is HealthResponse => {
  if (typeof payload !== 'object' || payload === null) {
    return false
  }

  const record = payload as Record<string, unknown>

  if (typeof record.ok !== 'boolean') {
    return false
  }

  if (record.ok) {
    const data = record.data as Record<string, unknown> | undefined
    return (
      typeof data?.status === 'string' &&
      typeof data?.version === 'string' &&
      typeof data?.timestamp === 'string' &&
      typeof data?.uptimeSeconds === 'number'
    )
  }

  return typeof record.code === 'string' && typeof record.message === 'string'
}

export const healthApi = {
  async check(): Promise<HealthResponse> {
    const response = await ipcRenderer.invoke(CHANNEL)

    if (!isValidHealthResponse(response)) {
      throw new Error('ERR_INVALID_HEALTH_RESPONSE')
    }

    return response
  }
}

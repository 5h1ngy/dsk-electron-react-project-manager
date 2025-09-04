import { ipcRenderer } from 'electron'
import type { IpcResponse } from '../types'

const isIpcResponse = <T>(value: unknown): value is IpcResponse<T> => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const record = value as Record<string, unknown>

  if (record.ok === true) {
    return record.data !== undefined
  }

  if (record.ok === false) {
    return typeof record.code === 'string' && typeof record.message === 'string'
  }

  return false
}

export const invokeIpc = async <T>(
  channel: string,
  ...args: unknown[]
): Promise<IpcResponse<T>> => {
  const response = await ipcRenderer.invoke(channel, ...args)
  if (!isIpcResponse<T>(response)) {
    throw new Error(`ERR_INVALID_IPC_RESPONSE:${channel}`)
  }
  return response
}

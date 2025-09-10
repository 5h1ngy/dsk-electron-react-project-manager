import type { SessionPayload } from '@main/services/auth'
import type { IpcResponse } from '@renderer/types'

import { TOKEN_STORAGE_KEY } from './constants'

export const handleResponse = async <T>(responsePromise: Promise<IpcResponse<T>>): Promise<T> => {
  const response = await responsePromise
  if (response.ok) {
    return response.data
  }
  const error = new Error(`${response.code}:${response.message}`)
  ;(error as { code?: string }).code = response.code
  throw error
}

export const extractErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    const [, message] = error.message.split(':')
    return (message ?? error.message).trim()
  }
  return 'Operazione non riuscita'
}

export const isSessionExpiredError = (error: unknown): boolean => {
  const code = (error as { code?: string })?.code
  if (code === 'ERR_SESSION') {
    return true
  }
  if (code === 'ERR_PERMISSION') {
    const message = error instanceof Error ? error.message : ''
    return /Sessione (non valida|scaduta)/i.test(message)
  }
  return false
}

export const persistToken = (payload: SessionPayload | null | string | undefined): void => {
  if (typeof payload === 'string') {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, payload)
    return
  }
  if (!payload) {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY)
    return
  }
  sessionStorage.setItem(TOKEN_STORAGE_KEY, payload.token)
}

export const getStoredToken = (): string | null => sessionStorage.getItem(TOKEN_STORAGE_KEY)

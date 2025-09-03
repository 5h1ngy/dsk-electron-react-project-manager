import type { SessionPayload } from '@main/auth/authService'
import type { IpcResponse } from '@renderer/types'

import { TOKEN_STORAGE_KEY } from './constants'

export const handleResponse = async <T>(responsePromise: Promise<IpcResponse<T>>): Promise<T> => {
  const response = await responsePromise
  if (response.ok) {
    return response.data
  }
  throw new Error(`${response.code}:${response.message}`)
}

export const extractErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    const [code, message] = error.message.split(':')
    return message ?? code
  }
  return 'Operazione non riuscita'
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

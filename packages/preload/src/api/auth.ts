import { ipcRenderer } from 'electron'
import type { SessionPayload, UserDTO } from '@main/auth/authService'
import type { CreateUserInput, UpdateUserInput, LoginInput, RegisterUserInput } from '@main/auth/validation'
import type { IpcResponse } from '../types'

const CHANNELS = {
  login: 'auth:login',
  register: 'auth:register',
  logout: 'auth:logout',
  session: 'auth:session',
  listUsers: 'auth:list-users',
  createUser: 'auth:create-user',
  updateUser: 'auth:update-user'
} as const

const isIpcResponse = <T>(value: unknown): value is IpcResponse<T> => {
  if (!value || typeof value !== 'object') {
    return false
  }
  const record = value as Record<string, unknown>
  if (record.ok === true) {
    return 'data' in record
  }
  if (record.ok === false) {
    return typeof record.code === 'string' && typeof record.message === 'string'
  }
  return false
}

const invoke = async <T>(channel: string, ...args: unknown[]): Promise<IpcResponse<T>> => {
  const response = await ipcRenderer.invoke(channel, ...args)
  if (!isIpcResponse<T>(response)) {
    throw new Error('ERR_INVALID_AUTH_RESPONSE')
  }
  return response
}

export const authApi = {
  login: async (payload: LoginInput) => await invoke<SessionPayload>(CHANNELS.login, payload),
  register: async (payload: RegisterUserInput) => await invoke<SessionPayload>(CHANNELS.register, payload),
  logout: async (token: string) => await invoke<{ success: boolean }>(CHANNELS.logout, token),
  session: async (token: string) => await invoke<UserDTO | null>(CHANNELS.session, token),
  listUsers: async (token: string) => await invoke<UserDTO[]>(CHANNELS.listUsers, token),
  createUser: async (token: string, payload: CreateUserInput) =>
    await invoke<UserDTO>(CHANNELS.createUser, token, payload),
  updateUser: async (token: string, userId: string, payload: UpdateUserInput) =>
    await invoke<UserDTO>(CHANNELS.updateUser, token, userId, payload)
}

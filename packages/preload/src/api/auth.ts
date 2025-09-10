import type { SessionPayload, UserDTO } from '@main/services/auth'
import type {
  CreateUserInput,
  UpdateUserInput,
  LoginInput,
  RegisterUserInput
} from '@main/services/auth/schemas'
import type { IpcResponse } from '../types'
import { invokeIpc } from './shared'

const CHANNELS = {
  login: 'auth:login',
  register: 'auth:register',
  logout: 'auth:logout',
  session: 'auth:session',
  listUsers: 'auth:list-users',
  createUser: 'auth:create-user',
  updateUser: 'auth:update-user'
} as const

export const authApi = {
  login: async (payload: LoginInput) =>
    await invokeIpc<SessionPayload>(CHANNELS.login, payload),
  register: async (payload: RegisterUserInput) =>
    await invokeIpc<SessionPayload>(CHANNELS.register, payload),
  logout: async (token: string) =>
    await invokeIpc<{ success: boolean }>(CHANNELS.logout, token),
  session: async (token: string) => await invokeIpc<UserDTO | null>(CHANNELS.session, token),
  listUsers: async (token: string) => await invokeIpc<UserDTO[]>(CHANNELS.listUsers, token),
  createUser: async (token: string, payload: CreateUserInput) =>
    await invokeIpc<UserDTO>(CHANNELS.createUser, token, payload),
  updateUser: async (token: string, userId: string, payload: UpdateUserInput) =>
    await invokeIpc<UserDTO>(CHANNELS.updateUser, token, userId, payload)
}

import type { HealthResponse } from '@main/ipc/health'
import type { SessionPayload, UserDTO } from '@main/auth/authService'
import type { CreateUserInput, UpdateUserInput, LoginInput } from '@main/auth/validation'

export interface IpcSuccess<T> {
  ok: true
  data: T
}

export interface IpcError {
  ok: false
  code: string
  message: string
}

export type IpcResponse<T> = IpcSuccess<T> | IpcError

export interface HealthApi {
  check: () => Promise<HealthResponse>
}

export interface AuthApi {
  login: (payload: LoginInput) => Promise<IpcResponse<SessionPayload>>
  logout: (token: string) => Promise<IpcResponse<{ success: boolean }>>
  session: (token: string) => Promise<IpcResponse<UserDTO | null>>
  listUsers: (token: string) => Promise<IpcResponse<UserDTO[]>>
  createUser: (token: string, payload: CreateUserInput) => Promise<IpcResponse<UserDTO>>
  updateUser: (token: string, userId: string, payload: UpdateUserInput) => Promise<IpcResponse<UserDTO>>
}

export interface PreloadApi {
  health: HealthApi
  auth: AuthApi
}

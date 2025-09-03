import type { UserDTO } from '@main/auth/authService'

export type AuthStatus = 'idle' | 'loading'

export interface AuthState {
  token: string | null
  currentUser: UserDTO | null
  users: UserDTO[]
  status: AuthStatus
  error?: string
}

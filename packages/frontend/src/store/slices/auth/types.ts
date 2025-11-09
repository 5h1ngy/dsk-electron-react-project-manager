import type { UserDTO } from '@services/services/auth'

export type AuthStatus = 'idle' | 'loading'

export interface AuthState {
  token: string | null
  currentUser: UserDTO | null
  users: UserDTO[]
  status: AuthStatus
  error?: string
}

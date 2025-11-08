import type { RootState } from '@renderer/store/types'
import type { AuthState } from '@renderer/store/slices/auth/types'

export const selectAuthState = (state: RootState): AuthState => state.auth
export const selectAuthStatus = (state: RootState): AuthState['status'] => state.auth.status
export const selectAuthError = (state: RootState): string | undefined => state.auth.error
export const selectCurrentUser = (state: RootState) => state.auth.currentUser
export const selectUsers = (state: RootState) => state.auth.users
export const selectToken = (state: RootState) => state.auth.token
export const selectIsAuthenticated = (state: RootState): boolean =>
  Boolean(state.auth.token && state.auth.currentUser)

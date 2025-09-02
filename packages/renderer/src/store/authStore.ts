import { create } from 'zustand'
import type { SessionPayload, UserDTO } from '@main/auth/authService'
import type { CreateUserInput, UpdateUserInput, LoginInput } from '@main/auth/validation'
import type { IpcResponse } from '../types'

interface AuthState {
  token: string | null
  currentUser: UserDTO | null
  users: UserDTO[]
  status: 'idle' | 'loading'
  error?: string
  login: (input: LoginInput) => Promise<boolean>
  logout: () => Promise<void>
  restoreSession: () => Promise<void>
  loadUsers: () => Promise<void>
  createUser: (input: CreateUserInput) => Promise<void>
  updateUser: (userId: string, input: UpdateUserInput) => Promise<void>
  clearError: () => void
}

const TOKEN_KEY = 'dsk-auth-token'

const handleResponse = async <T>(responsePromise: Promise<IpcResponse<T>>): Promise<T> => {
  const response = await responsePromise
  if (response.ok) {
    return response.data
  }
  throw new Error(`${response.code}:${response.message}`)
}

const extractErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    const [code, message] = error.message.split(':')
    return message ?? code
  }
  return 'Operazione non riuscita'
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  currentUser: null,
  users: [],
  status: 'idle',
  login: async (input) => {
    set({ status: 'loading', error: undefined })
    try {
      const payload = await handleResponse(window.api.auth.login(input))
      persistToken(payload)
      set({
        token: payload.token,
        currentUser: payload.user,
        status: 'idle'
      })
      await get().loadUsers()
      return true
    } catch (error) {
      set({ status: 'idle', error: extractErrorMessage(error) })
      return false
    }
  },
  logout: async () => {
    const token = get().token
    if (token) {
      try {
        await handleResponse(window.api.auth.logout(token))
      } catch {
        // ignore logout errors
      }
    }
    persistToken(null)
    set({ token: null, currentUser: null, users: [], status: 'idle', error: undefined })
  },
  restoreSession: async () => {
    const storedToken = sessionStorage.getItem(TOKEN_KEY)
    if (!storedToken) {
      return
    }
    try {
      const user = await handleResponse(window.api.auth.session(storedToken))
      if (!user) {
        persistToken(null)
        return
      }
      set({ token: storedToken, currentUser: user, error: undefined })
      await get().loadUsers()
    } catch {
      persistToken(null)
    }
  },
  loadUsers: async () => {
    const token = get().token
    if (!token) {
      return
    }
    try {
      const users = await handleResponse(window.api.auth.listUsers(token))
      set({ users, error: undefined })
    } catch (error) {
      set({ error: extractErrorMessage(error) })
    }
  },
  createUser: async (input) => {
    const token = get().token
    if (!token) {
      throw new Error('Sessione non valida')
    }
    const user = await handleResponse(window.api.auth.createUser(token, input))
    set((state) => ({ users: [...state.users, user] }))
  },
  updateUser: async (userId, input) => {
    const token = get().token
    if (!token) {
      throw new Error('Sessione non valida')
    }
    const updated = await handleResponse(window.api.auth.updateUser(token, userId, input))
    set((state) => ({
      users: state.users.map((user) => (user.id === updated.id ? updated : user)),
      currentUser: state.currentUser && state.currentUser.id === updated.id ? updated : state.currentUser
    }))
  },
  clearError: () => set({ error: undefined })
}))

const persistToken = (payload: SessionPayload | null | string | undefined): void => {
  if (typeof payload === 'string') {
    sessionStorage.setItem(TOKEN_KEY, payload)
    return
  }
  if (!payload) {
    sessionStorage.removeItem(TOKEN_KEY)
    return
  }
  sessionStorage.setItem(TOKEN_KEY, payload.token)
}

import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { SessionPayload, UserDTO } from '@main/auth/authService'
import type { CreateUserInput, UpdateUserInput, LoginInput } from '@main/auth/validation'
import type { IpcResponse } from '@renderer/types'

import type { AppThunk, RootState } from '../index'

interface AuthState {
  token: string | null
  currentUser: UserDTO | null
  users: UserDTO[]
  status: 'idle' | 'loading'
  error?: string
}

const TOKEN_KEY = 'dsk-auth-token'

const initialState: AuthState = {
  token: null,
  currentUser: null,
  users: [],
  status: 'idle',
  error: undefined
}

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

export const fetchUsers = createAsyncThunk<UserDTO[], string, { rejectValue: string }>(
  'auth/fetchUsers',
  async (token, { rejectWithValue }) => {
    try {
      return await handleResponse(window.api.auth.listUsers(token))
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error))
    }
  }
)

export const login = createAsyncThunk<
  { token: string; user: UserDTO },
  LoginInput,
  { rejectValue: string }
>('auth/login', async (input, { dispatch, rejectWithValue }) => {
  try {
    const payload = await handleResponse(window.api.auth.login(input))
    persistToken(payload)
    await dispatch(fetchUsers(payload.token))
    return { token: payload.token, user: payload.user }
  } catch (error) {
    const message = extractErrorMessage(error)
    return rejectWithValue(message)
  }
})

export const logout = createAsyncThunk<void, void, { state: RootState }>(
  'auth/logout',
  async (_arg, { getState }) => {
    const token = getState().auth.token
    if (token) {
      try {
        await handleResponse(window.api.auth.logout(token))
      } catch {
        // ignore logout errors
      }
    }
    persistToken(null)
  }
)

export const restoreSession = createAsyncThunk<
  { token: string; user: UserDTO } | null,
  void,
  { rejectValue: void }
>('auth/restoreSession', async (_arg, { dispatch, rejectWithValue }) => {
  const storedToken = sessionStorage.getItem(TOKEN_KEY)
  if (!storedToken) {
    return null
  }
  try {
    const user = await handleResponse(window.api.auth.session(storedToken))
    if (!user) {
      persistToken(null)
      return null
    }
    persistToken(storedToken)
    await dispatch(fetchUsers(storedToken))
    return { token: storedToken, user }
  } catch {
    persistToken(null)
    return rejectWithValue()
  }
})

export const createUser = createAsyncThunk<
  UserDTO,
  CreateUserInput,
  { state: RootState; rejectValue: string }
>('auth/createUser', async (input, { getState, rejectWithValue }) => {
  const token = getState().auth.token
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    return await handleResponse(window.api.auth.createUser(token, input))
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error))
  }
})

export const updateUser = createAsyncThunk<
  UserDTO,
  { userId: string; input: UpdateUserInput },
  { state: RootState; rejectValue: string }
>('auth/updateUser', async ({ userId, input }, { getState, rejectWithValue }) => {
  const token = getState().auth.token
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    return await handleResponse(window.api.auth.updateUser(token, userId, input))
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error))
  }
})

export const loadUsers = (): AppThunk => async (dispatch, getState) => {
  const token = getState().auth.token
  if (!token) {
    return
  }
  await dispatch(fetchUsers(token))
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = undefined
    },
    setStatus: (state, action: PayloadAction<AuthState['status']>) => {
      state.status = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'idle'
        state.token = action.payload.token
        state.currentUser = action.payload.user
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'idle'
        state.error = action.payload ?? 'Operazione non riuscita'
      })
      .addCase(logout.fulfilled, (state) => {
        state.token = null
        state.currentUser = null
        state.users = []
        state.status = 'idle'
        state.error = undefined
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        if (action.payload) {
          state.token = action.payload.token
          state.currentUser = action.payload.user
          state.error = undefined
        }
      })
      .addCase(restoreSession.rejected, (state) => {
        state.token = null
        state.currentUser = null
        state.users = []
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload
        state.error = undefined
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.error = action.payload ?? 'Operazione non riuscita'
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload)
        state.error = undefined
      })
      .addCase(createUser.rejected, (state, action) => {
        state.error = action.payload ?? 'Operazione non riuscita'
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.users = state.users.map((user) => (user.id === action.payload.id ? action.payload : user))
        if (state.currentUser && state.currentUser.id === action.payload.id) {
          state.currentUser = action.payload
        }
        state.error = undefined
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.error = action.payload ?? 'Operazione non riuscita'
      })
  }
})

export const authReducer = authSlice.reducer
export const { clearError, setStatus } = authSlice.actions

export const selectAuthState = (state: RootState): AuthState => state.auth
export const selectAuthStatus = (state: RootState): AuthState['status'] => state.auth.status
export const selectAuthError = (state: RootState): string | undefined => state.auth.error
export const selectCurrentUser = (state: RootState): UserDTO | null => state.auth.currentUser
export const selectUsers = (state: RootState): UserDTO[] => state.auth.users
export const selectToken = (state: RootState): string | null => state.auth.token
export const selectIsAuthenticated = (state: RootState): boolean =>
  Boolean(state.auth.token && state.auth.currentUser)

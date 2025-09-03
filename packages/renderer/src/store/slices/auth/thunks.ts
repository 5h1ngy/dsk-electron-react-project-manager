import { createAsyncThunk } from '@reduxjs/toolkit'

import type { UserDTO } from '@main/auth/authService'
import type { CreateUserInput, UpdateUserInput, LoginInput } from '@main/auth/validation'

import type { AppThunk, RootState } from '../../types'
import { extractErrorMessage, getStoredToken, handleResponse, persistToken } from './helpers'

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
    return rejectWithValue(extractErrorMessage(error))
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
  const storedToken = getStoredToken()
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

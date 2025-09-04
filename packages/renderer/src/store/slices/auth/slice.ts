import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { AuthState } from './types'
import {
  createUser,
  fetchUsers,
  login,
  logout,
  register,
  restoreSession,
  updateUser
} from './thunks'

const initialState: AuthState = {
  token: null,
  currentUser: null,
  users: [],
  status: 'idle',
  error: undefined
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
    },
    forceLogout: (state) => {
      state.token = null
      state.currentUser = null
      state.users = []
      state.status = 'idle'
      state.error = undefined
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
      .addCase(register.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'idle'
        state.token = action.payload.token
        state.currentUser = action.payload.user
      })
      .addCase(register.rejected, (state, action) => {
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
        state.users = state.users.map((user) =>
          user.id === action.payload.id ? action.payload : user
        )
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
export const { clearError, setStatus, forceLogout } = authSlice.actions

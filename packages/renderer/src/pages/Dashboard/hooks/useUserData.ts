import { useCallback, useEffect } from 'react'

import type { UserDTO } from '@main/auth/authService'
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import {
  clearError as clearAuthError,
  createUser as createUserThunk,
  loadUsers,
  selectAuthError,
  selectUsers,
  updateUser as updateUserThunk
} from '@renderer/store/slices/auth'

import type { CreateUserValues, UpdateUserValues } from '../schemas/userSchemas'

export interface UserDataState {
  users: UserDTO[]
  error?: string
  refreshUsers: () => void
  clearError: () => void
  createUser: (values: CreateUserValues) => Promise<void>
  updateUser: (userId: string, values: UpdateUserValues) => Promise<void>
}

export const useUserData = () => {
  const dispatch = useAppDispatch()
  const users = useAppSelector(selectUsers)
  const error = useAppSelector(selectAuthError)

  useEffect(() => {
    void dispatch(loadUsers())
  }, [dispatch])

  const refreshUsers = useCallback(() => {
    void dispatch(loadUsers())
  }, [dispatch])

  const clearError = useCallback(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  const createUser = useCallback(
    async (values: CreateUserValues) => {
      await dispatch(createUserThunk(values)).unwrap()
    },
    [dispatch]
  )

  const updateUser = useCallback(
    async (userId: string, values: UpdateUserValues) => {
      await dispatch(updateUserThunk({ userId, input: values })).unwrap()
    },
    [dispatch]
  )

  return {
    users,
    error,
    refreshUsers,
    clearError,
    createUser,
    updateUser
  }
}

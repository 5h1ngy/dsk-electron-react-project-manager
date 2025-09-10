import { useCallback, useEffect } from 'react'

import type { UserDTO } from '@main/services/auth.service'
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

export interface UseUserDataOptions {
  enabled: boolean
}

export interface UserDataState {
  users: UserDTO[]
  error?: string
  refreshUsers: () => void
  clearError: () => void
  createUser: (values: CreateUserValues) => Promise<void>
  updateUser: (userId: string, values: UpdateUserValues) => Promise<void>
}

export const useUserData = ({ enabled }: UseUserDataOptions): UserDataState => {
  const dispatch = useAppDispatch()
  const users = useAppSelector(selectUsers)
  const error = useAppSelector(selectAuthError)

  useEffect(() => {
    if (!enabled) {
      return
    }
    void dispatch(loadUsers())
  }, [dispatch, enabled])

  const refreshUsers = useCallback(() => {
    if (!enabled) {
      return
    }
    void dispatch(loadUsers())
  }, [dispatch, enabled])

  const clearError = useCallback(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  const createUser = useCallback(
    async (values: CreateUserValues) => {
      if (!enabled) {
        throw new Error('ERR_PERMISSION:utente non autorizzato')
      }
      await dispatch(createUserThunk(values)).unwrap()
    },
    [dispatch, enabled]
  )

  const updateUser = useCallback(
    async (userId: string, values: UpdateUserValues) => {
      if (!enabled) {
        throw new Error('ERR_PERMISSION:utente non autorizzato')
      }
      await dispatch(updateUserThunk({ userId, input: values })).unwrap()
    },
    [dispatch, enabled]
  )

  return {
    users: enabled ? users : [],
    error,
    refreshUsers,
    clearError,
    createUser,
    updateUser
  }
}

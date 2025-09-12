import { useCallback, useEffect, useRef, useState } from 'react'

import type { UserDTO } from '@main/services/auth'
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import {
  clearError as clearAuthError,
  createUser as createUserThunk,
  deleteUser as deleteUserThunk,
  loadUsers,
  selectAuthError,
  selectUsers,
  updateUser as updateUserThunk
} from '@renderer/store/slices/auth'

import type { CreateUserValues, UpdateUserValues } from '@renderer/pages/Dashboard/schemas/userSchemas'

export interface UseUserDataOptions {
  enabled: boolean
}

export interface UserDataState {
  users: UserDTO[]
  error?: string
  loading: boolean
  hasLoaded: boolean
  refreshUsers: () => void
  clearError: () => void
  createUser: (values: CreateUserValues) => Promise<void>
  updateUser: (userId: string, values: UpdateUserValues) => Promise<void>
  deleteUser: (userId: string) => Promise<void>
}

export const useUserData = ({ enabled }: UseUserDataOptions): UserDataState => {
  const dispatch = useAppDispatch()
  const users = useAppSelector(selectUsers)
  const error = useAppSelector(selectAuthError)
  const [loading, setLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const setLoadingSafe = useCallback((value: boolean) => {
    if (mountedRef.current) {
      setLoading(value)
    }
  }, [])

  const executeLoad = useCallback(async () => {
    if (!enabled) {
      return
    }
    setLoadingSafe(true)
    try {
      await dispatch(loadUsers())
    } finally {
      setHasLoaded(true)
      setLoadingSafe(false)
    }
  }, [dispatch, enabled, setLoadingSafe])

  useEffect(() => {
    if (!enabled) {
      return
    }
    void executeLoad()
  }, [enabled, executeLoad])

  const refreshUsers = useCallback(() => {
    if (!enabled) {
      return
    }
    void executeLoad()
  }, [enabled, executeLoad])

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

  const deleteUser = useCallback(
    async (userId: string) => {
      if (!enabled) {
        throw new Error('ERR_PERMISSION:utente non autorizzato')
      }
      await dispatch(deleteUserThunk(userId)).unwrap()
    },
    [dispatch, enabled]
  )

  return {
    users: enabled ? users : [],
    error,
    loading,
    hasLoaded,
    refreshUsers,
    clearError,
    createUser,
    updateUser,
    deleteUser
  }
}

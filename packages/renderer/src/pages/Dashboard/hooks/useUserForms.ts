import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  createUserSchema,
  updateUserSchema,
  type CreateUserValues,
  type UpdateUserValues
} from '@renderer/pages/Dashboard/schemas/userSchemas'

export interface UserForms {
  createForm: ReturnType<typeof useForm<CreateUserValues>>
  updateForm: ReturnType<typeof useForm<UpdateUserValues>>
  resetCreateForm: () => void
  resetUpdateForm: (values: UpdateUserValues) => void
}

export const useUserForms = (): UserForms => {
  const createForm = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: '',
      displayName: '',
      password: '',
      roles: ['Viewer'],
      isActive: true
    }
  })

  const updateForm = useForm<UpdateUserValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      displayName: '',
      roles: ['Viewer'],
      isActive: true,
      password: undefined
    }
  })

  const resetCreateForm = useCallback(() => {
    createForm.reset()
  }, [createForm])

  const resetUpdateForm = useCallback(
    (values: UpdateUserValues) => {
      updateForm.reset(values)
    },
    [updateForm]
  )

  return {
    createForm,
    updateForm,
    resetCreateForm,
    resetUpdateForm
  }
}

import { useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'

import {
  buildCreateUserSchema,
  buildUpdateUserSchema,
  type CreateUserValues,
  type UpdateUserValues,
  defaultCreateUserMessages,
  defaultUpdateUserMessages,
  type CreateUserValidationMessages,
  type UpdateUserValidationMessages
} from '@renderer/pages/Dashboard/schemas/userSchemas'
import { useAppSelector } from '@renderer/store/hooks'
import { selectLocale } from '@renderer/store/slices/locale'

export interface UserForms {
  createForm: ReturnType<typeof useForm<CreateUserValues>>
  updateForm: ReturnType<typeof useForm<UpdateUserValues>>
  resetCreateForm: () => void
  resetUpdateForm: (values: UpdateUserValues) => void
}

export const useUserForms = (): UserForms => {
  const { t } = useTranslation('dashboard')
  const locale = useAppSelector(selectLocale)

  const validationMessages = useMemo(() => {
    const raw = t('dashboard:validation', { returnObjects: true }) as Partial<{
      createUser: Partial<CreateUserValidationMessages>
      updateUser: Partial<UpdateUserValidationMessages>
    }>

    return {
      createUser: { ...defaultCreateUserMessages, ...(raw?.createUser ?? {}) },
      updateUser: { ...defaultUpdateUserMessages, ...(raw?.updateUser ?? {}) }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, locale])

  const createSchema = useMemo(
    () => buildCreateUserSchema(validationMessages.createUser),
    [validationMessages]
  )

  const updateSchema = useMemo(
    () => buildUpdateUserSchema(validationMessages.updateUser),
    [validationMessages]
  )

  const defaultCreateValues = useMemo<CreateUserValues>(
    () => ({
      username: '',
      displayName: '',
      password: '',
      roles: ['Viewer'],
      isActive: true
    }),
    []
  )

  const defaultUpdateValues = useMemo<UpdateUserValues>(
    () => ({
      displayName: '',
      roles: ['Viewer'],
      isActive: true,
      password: undefined
    }),
    []
  )

  const createResolver = useMemo(
    () => zodResolver(createSchema) as unknown as Resolver<CreateUserValues>,
    [createSchema]
  )

  const updateResolver = useMemo(
    () => zodResolver(updateSchema) as unknown as Resolver<UpdateUserValues>,
    [updateSchema]
  )

  const createForm = useForm<CreateUserValues>({
    resolver: createResolver,
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: defaultCreateValues
  })

  const updateForm = useForm<UpdateUserValues>({
    resolver: updateResolver,
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: defaultUpdateValues
  })

  const resetCreateForm = useCallback(() => {
    createForm.reset(defaultCreateValues, {
      keepErrors: false,
      keepDirty: false,
      keepTouched: false,
      keepIsSubmitted: false
    })
  }, [createForm, defaultCreateValues])

  const resetUpdateForm = useCallback(
    (values: UpdateUserValues) => {
      updateForm.reset(values, {
        keepErrors: false,
        keepDirty: false,
        keepTouched: false,
        keepIsSubmitted: false
      })
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

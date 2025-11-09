import { useCallback, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import {
  clearError,
  register as registerThunk,
  selectAuthError,
  selectAuthStatus
} from '@renderer/store/slices/auth'
import { selectLocale } from '@renderer/store/slices/locale'

interface RegisterValidationMessages {
  usernameRequired: string
  usernameMin: string
  usernameMax: string
  usernamePattern: string
  displayNameRequired: string
  displayNameMax: string
  passwordRequired: string
  passwordMin: string
  confirmPasswordRequired: string
  confirmPasswordMatch: string
}

const createRegisterSchema = (messages: RegisterValidationMessages) =>
  z
    .object({
      displayName: z
        .string({ required_error: messages.displayNameRequired })
        .min(1, { message: messages.displayNameRequired })
        .max(64, { message: messages.displayNameMax }),
      username: z
        .string({ required_error: messages.usernameRequired })
        .min(3, { message: messages.usernameMin })
        .max(32, { message: messages.usernameMax })
        .regex(/^[a-zA-Z0-9_.-]+$/, messages.usernamePattern),
      password: z
        .string({ required_error: messages.passwordRequired })
        .min(8, { message: messages.passwordMin }),
      confirmPassword: z
        .string({ required_error: messages.confirmPasswordRequired })
        .min(8, { message: messages.passwordMin })
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ['confirmPassword'],
      message: messages.confirmPasswordMatch
    })

export type RegisterFormValues = z.infer<ReturnType<typeof createRegisterSchema>>

export const useRegisterForm = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const locale = useAppSelector(selectLocale)
  const status = useAppSelector(selectAuthStatus)
  const error = useAppSelector(selectAuthError)
  const { t } = useTranslation(['register'])

  const validationMessages = useMemo(
    () => t('register:validation', { returnObjects: true }) as RegisterValidationMessages,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, locale]
  )

  const schema = useMemo(() => createRegisterSchema(validationMessages), [validationMessages])
  const resolver = useMemo(() => zodResolver(schema), [schema])

  const {
    control,
    handleSubmit,
    formState: { errors },
    setFocus
  } = useForm<RegisterFormValues>({
    resolver,
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      displayName: '',
      username: '',
      password: '',
      confirmPassword: ''
    }
  })

  useEffect(() => {
    setFocus('displayName')
  }, [setFocus])

  const onSubmit = useCallback(
    async (values: RegisterFormValues) => {
      try {
        await dispatch(
          registerThunk({
            displayName: values.displayName,
            username: values.username,
            password: values.password
          })
        ).unwrap()
        navigate('/', { replace: true })
      } catch {
        // errors handled by slice state
      }
    },
    [dispatch, navigate]
  )

  const handleClearError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  return {
    t,
    status,
    error,
    clearError: handleClearError,
    control,
    errors,
    handleSubmit,
    onSubmit
  }
}

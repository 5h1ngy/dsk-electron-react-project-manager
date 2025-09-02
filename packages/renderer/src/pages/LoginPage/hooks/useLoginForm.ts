import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'

import { useAuthStore } from '@renderer/store/authStore'
import { useLocaleStore } from '@renderer/store/localeStore'

interface LoginValidationMessages {
  usernameRequired: string
  usernameMin: string
  usernameMax: string
  usernamePattern: string
  passwordRequired: string
  passwordMin: string
  passwordMax: string
}

const createLoginSchema = (messages: LoginValidationMessages) =>
  z.object({
    username: z
      .string({ required_error: messages.usernameRequired })
      .trim()
      .min(3, { message: messages.usernameMin })
      .max(32, { message: messages.usernameMax })
      .regex(/^[a-zA-Z0-9_.-]+$/, messages.usernamePattern),
    password: z
      .string({ required_error: messages.passwordRequired })
      .min(8, { message: messages.passwordMin })
      .max(128, { message: messages.passwordMax })
  })

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>

export const useLoginForm = () => {
  const locale = useLocaleStore((state) => state.locale)
  const login = useAuthStore((state) => state.login)
  const status = useAuthStore((state) => state.status)
  const error = useAuthStore((state) => state.error)
  const clearError = useAuthStore((state) => state.clearError)
  const { t } = useTranslation(['login', 'common'])

  const validationMessages = useMemo(
    () => t('login:validation', { returnObjects: true }) as LoginValidationMessages,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, locale]
  )

  const loginSchema = useMemo(() => createLoginSchema(validationMessages), [validationMessages])
  const resolver = useMemo(() => zodResolver(loginSchema), [loginSchema])

  const {
    control,
    handleSubmit,
    formState: { errors },
    setFocus,
    trigger
  } = useForm<LoginFormValues>({
    resolver,
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: { username: '', password: '' }
  })

  useEffect(() => {
    setFocus('username')
  }, [setFocus])

  const hasMountedRef = useRef(false)

  useEffect(() => {
    if (hasMountedRef.current) {
      trigger()
    } else {
      hasMountedRef.current = true
    }
  }, [trigger, locale])

  const onSubmit = useCallback(
    async (values: LoginFormValues) => {
      await login(values)
    },
    [login]
  )

  return {
    t,
    status,
    error,
    clearError,
    control,
    errors,
    handleSubmit,
    onSubmit
  }
}

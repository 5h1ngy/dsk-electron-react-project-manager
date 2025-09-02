import { useEffect } from 'react'
import type { JSX } from 'react'
import { Button, Card, Form, Input, Typography, Alert } from 'antd'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '../../../store/authStore'

const loginSchema = z.object({
  username: z
    .string({ required_error: 'Inserisci almeno 3 caratteri' })
    .trim()
    .min(3, { message: 'Inserisci almeno 3 caratteri' })
    .max(32, { message: 'Massimo 32 caratteri' })
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Formato username non valido'),
  password: z
    .string({ required_error: 'La password deve contenere almeno 8 caratteri' })
    .min(7, { message: 'La password deve contenere almeno 8 caratteri' })
    .max(128, { message: 'Massimo 128 caratteri' })
})

type LoginFormValues = z.infer<typeof loginSchema>

export const LoginForm = (): JSX.Element => {
  const login = useAuthStore((state) => state.login)
  const status = useAuthStore((state) => state.status)
  const error = useAuthStore((state) => state.error)
  const clearError = useAuthStore((state) => state.clearError)

  const {
    control,
    handleSubmit,
    formState: { errors },
    setFocus
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: { username: '', password: '' }
  })

  useEffect(() => {
    setFocus('username')
  }, [setFocus])

  const onSubmit = async (values: LoginFormValues) => {
    await login(values)
  }

  return (
    <Card title="Accedi" style={{ maxWidth: 400, margin: '0 auto' }}>
      <form data-testid="login-form" onSubmit={handleSubmit(onSubmit)}>
        <Form.Item
          label="Username"
          validateStatus={errors.username ? 'error' : undefined}
          help={errors.username?.message}
        >
          <Controller
            control={control}
            name="username"
            render={({ field }) => (
              <Input
                {...field}
                value={field.value ?? ''}
                onChange={(event) => field.onChange(event.target.value)}
                autoComplete="username"
                autoFocus
                aria-label="Username"
                placeholder="Inserisci l'username"
              />
            )}
          />
        </Form.Item>
        <Form.Item
          label="Password"
          validateStatus={errors.password ? 'error' : undefined}
          help={errors.password?.message}
        >
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <Input.Password
                {...field}
                value={field.value ?? ''}
                onChange={(event) => field.onChange(event.target.value)}
                autoComplete="current-password"
                aria-label="Password"
                placeholder="Inserisci la password"
              />
            )}
          />
        </Form.Item>
        {error && (
          <Alert
            type="error"
            showIcon
            message="Accesso non riuscito"
            description={error}
            style={{ marginBottom: 16 }}
            closable
            onClose={clearError}
          />
        )}
        <Button type="primary" htmlType="submit" block loading={status === 'loading'}>
          Entra
        </Button>
        <Typography.Paragraph type="secondary" style={{ marginTop: 16, fontSize: 12 }}>
          Usa le credenziali di default dmin / changeme! al primo avvio e modifica la password
          appena possibile.
        </Typography.Paragraph>
      </form>
    </Card>
  )
}

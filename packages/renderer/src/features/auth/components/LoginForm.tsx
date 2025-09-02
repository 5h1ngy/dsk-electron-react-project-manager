import { useEffect } from 'react'
import type { JSX } from 'react'
import { Button, Card, Form, Input, Typography, Alert } from 'antd'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '../../../store/authStore'

const loginSchema = z.object({
  username: z.string().min(3).max(32),
  password: z.string().min(8)
})

type LoginFormValues = z.infer<typeof loginSchema>

export const LoginForm = (): JSX.Element => {
  const login = useAuthStore((state) => state.login)
  const status = useAuthStore((state) => state.status)
  const error = useAuthStore((state) => state.error)
  const clearError = useAuthStore((state) => state.clearError)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
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
          <Input
            {...register('username')}
            autoComplete="username"
            autoFocus
            aria-label="Username"
          />
        </Form.Item>
        <Form.Item
          label="Password"
          validateStatus={errors.password ? 'error' : undefined}
          help={errors.password?.message}
        >
          <Input.Password
            {...register('password')}
            autoComplete="current-password"
            aria-label="Password"
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
          Usa le credenziali di default dmin / changeme! al primo avvio e modifica la password appena possibile.
        </Typography.Paragraph>
      </form>
    </Card>
  )
}

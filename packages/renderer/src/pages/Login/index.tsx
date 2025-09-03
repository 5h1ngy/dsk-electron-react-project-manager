import type { ChangeEvent, JSX } from 'react'
import { Alert, Button, Card, Form, Input, Typography } from 'antd'
import { Controller } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { useLoginForm } from './hooks/useLoginForm'

const Login = (): JSX.Element => {
  const { t, status, error, clearError, control, errors, handleSubmit, onSubmit } = useLoginForm()

  return (
    <Card title={t('login:title')} style={{ maxWidth: 400, width: '100%' }}>
      <Form data-testid="login-form" layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Form.Item
          label={t('login:usernameLabel')}
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
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  field.onChange(event.target.value)
                }
                autoComplete="username"
                autoFocus
                aria-label={t('login:usernameLabel')}
                placeholder={t('login:usernamePlaceholder')}
              />
            )}
          />
        </Form.Item>
        <Form.Item
          label={t('login:passwordLabel')}
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
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  field.onChange(event.target.value)
                }
                autoComplete="current-password"
                aria-label={t('login:passwordLabel')}
                placeholder={t('login:passwordPlaceholder')}
              />
            )}
          />
        </Form.Item>
        {error && (
          <Alert
            type="error"
            showIcon
            message={t('login:errorTitle')}
            description={error}
            style={{ marginBottom: 16 }}
            closable
            onClose={clearError}
          />
        )}
        <Button type="primary" htmlType="submit" block loading={status === 'loading'}>
          {t('login:submitLabel')}
        </Button>
        <Typography.Paragraph type="secondary" style={{ marginTop: 16, fontSize: 12 }}>
          {t('login:defaultCredentials')}
        </Typography.Paragraph>
        <Typography.Paragraph type="secondary" style={{ marginTop: 8, fontSize: 12 }}>
          {t('login:registerPrompt')} <Link to="/register">{t('login:registerLink')}</Link>
        </Typography.Paragraph>
      </Form>
    </Card>
  )
}

export default Login

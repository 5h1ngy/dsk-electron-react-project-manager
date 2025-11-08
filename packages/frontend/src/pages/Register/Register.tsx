import type { ChangeEvent, FC } from 'react'
import { Alert, Button, Card, Form, Input, Typography } from 'antd'
import { Controller } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { REGISTER_CARD_STYLE, INFO_TEXT_STYLE } from '@renderer/pages/Register/Register.helpers'
import type { RegisterProps } from '@renderer/pages/Register/Register.types'
import { useRegisterForm } from '@renderer/pages/Register/hooks/useRegisterForm'

const Register: FC<RegisterProps> = () => {
  const { t, status, error, clearError, control, errors, handleSubmit, onSubmit } =
    useRegisterForm()

  return (
    <Card title={t('register:title')} style={REGISTER_CARD_STYLE}>
      <Form layout="vertical" data-testid="register-form" onFinish={handleSubmit(onSubmit)}>
        <Form.Item
          label={t('register:displayNameLabel')}
          validateStatus={errors.displayName ? 'error' : undefined}
          help={errors.displayName?.message}
        >
          <Controller
            control={control}
            name="displayName"
            render={({ field }) => (
              <Input
                {...field}
                value={field.value ?? ''}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  field.onChange(event.target.value)
                }
                autoCapitalize="words"
                autoFocus
                aria-label={t('register:displayNameLabel')}
                placeholder={t('register:displayNamePlaceholder')}
              />
            )}
          />
        </Form.Item>
        <Form.Item
          label={t('register:usernameLabel')}
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
                aria-label={t('register:usernameLabel')}
                placeholder={t('register:usernamePlaceholder')}
              />
            )}
          />
        </Form.Item>
        <Form.Item
          label={t('register:passwordLabel')}
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
                autoComplete="new-password"
                aria-label={t('register:passwordLabel')}
                placeholder={t('register:passwordPlaceholder')}
              />
            )}
          />
        </Form.Item>
        <Form.Item
          label={t('register:confirmPasswordLabel')}
          validateStatus={errors.confirmPassword ? 'error' : undefined}
          help={errors.confirmPassword?.message}
        >
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <Input.Password
                {...field}
                value={field.value ?? ''}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  field.onChange(event.target.value)
                }
                autoComplete="new-password"
                aria-label={t('register:confirmPasswordLabel')}
                placeholder={t('register:confirmPasswordPlaceholder')}
              />
            )}
          />
        </Form.Item>
        {error && (
          <Alert
            type="error"
            showIcon
            message={t('register:errorTitle')}
            description={error}
            style={{ marginBottom: 16 }}
            closable
            onClose={clearError}
          />
        )}
        <Button type="primary" htmlType="submit" block loading={status === 'loading'}>
          {t('register:submitLabel')}
        </Button>
        <Typography.Paragraph type="secondary" style={INFO_TEXT_STYLE}>
          {t('register:loginPrompt')} <Link to="/login">{t('register:loginLink')}</Link>
        </Typography.Paragraph>
      </Form>
    </Card>
  )
}

Register.displayName = 'Register'

export { Register }
export default Register

import type { ChangeEvent, JSX } from 'react'
import { Alert, Button, Card, Form, Input, Space, Typography, Layout } from 'antd'
import { Controller } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { LanguageSwitcher } from '@renderer/components/LanguageSwitcher'
import { ThemeToggle } from '@renderer/components/ThemeToggle'
import { useRegisterForm } from './hooks/useRegisterForm'

const { Header, Content } = Layout

const Register = (): JSX.Element => {
  const { t, status, error, clearError, control, errors, handleSubmit, onSubmit } =
    useRegisterForm()

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingInline: 24
        }}
      >
        <Typography.Title level={4} style={{ margin: 0, color: '#fff' }}>
          {t('register:header')}
        </Typography.Title>
        <Space align="center" size="middle" style={{ marginLeft: 'auto' }}>
          <LanguageSwitcher />
          <ThemeToggle />
        </Space>
      </Header>
      <Content
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 24 }}
      >
        <Card title={t('register:title')} style={{ maxWidth: 400, width: '100%' }}>
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
            <Typography.Paragraph type="secondary" style={{ marginTop: 16, fontSize: 12 }}>
              {t('register:loginPrompt')} <Link to="/login">{t('register:loginLink')}</Link>
            </Typography.Paragraph>
          </Form>
        </Card>
      </Content>
    </Layout>
  )
}

export default Register

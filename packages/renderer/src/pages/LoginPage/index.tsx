import type { JSX } from 'react'
import { Alert, Button, Card, Form, Input, Space, Typography } from 'antd'
import { Controller } from 'react-hook-form'
import { Layout } from 'antd'

import { LanguageSwitcher } from '@renderer/components/LanguageSwitcher'
import { ThemeToggle } from '@renderer/components/ThemeToggle'
import { useLoginForm } from './hooks/useLoginForm'

const { Header, Content } = Layout

const LoginPage = (): JSX.Element => {
  const { t, status, error, clearError, control, errors, handleSubmit, onSubmit } = useLoginForm()

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
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t('login:header')}
        </Typography.Title>
        <Space
          align="center"
          size="middle"
          style={{ marginLeft: 'auto', justifyItems: 'center', justifyContent: 'center' }}
        >
          <LanguageSwitcher />
          <ThemeToggle />
        </Space>
      </Header>
      <Content style={{ alignContent: 'center', justifyContent: 'center' }}>
        <Card title={t('login:title')} style={{ maxWidth: 400, margin: '0 auto' }}>
          <Form data-testid="login-form" layout={'vertical'} onFinish={handleSubmit(onSubmit)}>
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
                    onChange={(event) => field.onChange(event.target.value)}
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
                    onChange={(event) => field.onChange(event.target.value)}
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
          </Form>
        </Card>
      </Content>
    </Layout>
  )
}

export default LoginPage

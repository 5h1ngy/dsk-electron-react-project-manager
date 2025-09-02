import { JSX, useEffect } from 'react'
import { App as AntdApp, ConfigProvider, Space, theme as antdTheme } from 'antd'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useThemeStore } from './store/themeStore'
import { AppShell } from './layout/AppShell'
import { useAuthStore } from './store/authStore'
import { LoginForm } from './features/auth/components/LoginForm'
import { HealthStatusCard } from './features/health/components/HealthStatusCard'
import { UserManagementPanel } from './features/auth/components/UserManagementPanel'

const { darkAlgorithm, defaultAlgorithm } = antdTheme

const App = (): JSX.Element => {
  const mode = useThemeStore((state) => state.mode)
  const token = useAuthStore((state) => state.token)
  const currentUser = useAuthStore((state) => state.currentUser)
  const restoreSession = useAuthStore((state) => state.restoreSession)
  const logout = useAuthStore((state) => state.logout)

  useEffect(() => {
    document.body.dataset.theme = mode
  }, [mode])

  useEffect(() => {
    void restoreSession()
  }, [restoreSession])

  const themeConfig = {
    algorithm: mode === 'dark' ? [darkAlgorithm] : [defaultAlgorithm],
    token: {
      colorPrimary: '#1677ff'
    }
  }

  const renderAuthenticatedView = () => {
    if (!token || !currentUser) {
      return (
        <div className="auth-screen">
          <Space direction="vertical" size="large" style={{ width: '100%', maxWidth: 480 }}>
            <HealthStatusCard />
            <LoginForm />
          </Space>
        </div>
      )
    }

    return (
      <AppShell currentUser={currentUser} onLogout={logout}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <HealthStatusCard />
          <UserManagementPanel />
        </Space>
      </AppShell>
    )
  }

  return (
    <ErrorBoundary>
      <ConfigProvider theme={themeConfig}>
        <AntdApp>
          {renderAuthenticatedView()}
        </AntdApp>
      </ConfigProvider>
    </ErrorBoundary>
  )
}

export default App

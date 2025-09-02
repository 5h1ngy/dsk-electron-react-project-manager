import { useEffect, useMemo } from 'react'
import { HashRouter } from 'react-router-dom'
import { App as AntdApp, ConfigProvider } from 'antd'

import { useThemeStore } from '@renderer/store/themeStore'
import { useAuthStore } from '@renderer/store/authStore'
import { createThemeConfig } from '@renderer/theme/themeConfig'
import { ErrorBoundary } from '@renderer/components/ErrorBoundary'
import { AppRoutes } from '@renderer/pages/routes'

const App = () => {
  const mode = useThemeStore((state) => state.mode)
  const restoreSession = useAuthStore((state) => state.restoreSession)

  useEffect(() => {
    document.body.dataset.theme = mode
  }, [mode])

  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  const themeConfig = useMemo(() => createThemeConfig(mode), [mode])

  return (
    <ErrorBoundary>
      <ConfigProvider theme={themeConfig}>
        <HashRouter>
          <AntdApp>
            <AppRoutes />
          </AntdApp>
        </HashRouter>
      </ConfigProvider>
    </ErrorBoundary>
  )
}

export default App

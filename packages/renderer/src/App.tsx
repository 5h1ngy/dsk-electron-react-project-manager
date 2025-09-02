import { JSX, useEffect } from 'react'
import { App as AntdApp, ConfigProvider, theme as antdTheme } from 'antd'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useThemeStore } from './store/themeStore'
import { AppShell } from './layout/AppShell'

const { darkAlgorithm, defaultAlgorithm } = antdTheme

const App = (): JSX.Element => {
  const mode = useThemeStore((state) => state.mode)

  useEffect(() => {
    document.body.dataset.theme = mode
  }, [mode])

  return (
    <ErrorBoundary>
      <ConfigProvider
        theme={{
          algorithm: mode === 'dark' ? [darkAlgorithm] : [defaultAlgorithm],
          token: {
            colorPrimary: '#1677ff'
          }
        }}
      >
        <AntdApp>
          <AppShell />
        </AntdApp>
      </ConfigProvider>
    </ErrorBoundary>
  )
}

export default App

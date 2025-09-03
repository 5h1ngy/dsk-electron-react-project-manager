import { useEffect, useMemo } from 'react'
import { HashRouter } from 'react-router-dom'
import { App as AntdApp, ConfigProvider } from 'antd'

import { ErrorBoundary } from '@renderer/components/ErrorBoundary'
import { AppRoutes } from '@renderer/pages/routes'
import { createThemeConfig } from '@renderer/theme/themeConfig'
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import { restoreSession } from '@renderer/store/slices/auth'
import { selectThemeMode } from '@renderer/store/slices/theme'

const App = () => {
  const dispatch = useAppDispatch()
  const mode = useAppSelector(selectThemeMode)

  useEffect(() => {
    document.body.dataset.theme = mode
  }, [mode])

  useEffect(() => {
    dispatch(restoreSession())
  }, [dispatch])

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

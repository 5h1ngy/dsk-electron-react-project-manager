import { useEffect, useMemo } from 'react'
import { HashRouter } from 'react-router-dom'
import { App as AntdApp, ConfigProvider, theme } from 'antd'

import { ErrorBoundary } from '@renderer/components/ErrorBoundary'
import { AppRoutes } from '@renderer/pages/routes'
import { createThemeConfig } from '@renderer/theme'
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import { restoreSession } from '@renderer/store/slices/auth'
import { selectAccentColor, selectThemeMode } from '@renderer/store/slices/theme'
import '@renderer/theme/global.css'

const ThemeVariableUpdater = () => {
  const { token } = theme.useToken()

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--accent-color', token.colorPrimary)
    root.style.setProperty('--app-background-light', token.colorBgLayout)
    root.style.setProperty('--app-background-dark', token.colorBgBase)
    root.style.setProperty('--app-background', token.colorBgLayout)
    root.style.setProperty('--text-color-base', token.colorTextBase)
  }, [token.colorBgBase, token.colorBgLayout, token.colorPrimary, token.colorTextBase])

  return null
}

const App = () => {
  const dispatch = useAppDispatch()
  const mode = useAppSelector(selectThemeMode)
  const accentColor = useAppSelector(selectAccentColor)

  useEffect(() => {
    document.body.dataset.theme = mode
  }, [mode])

  useEffect(() => {
    dispatch(restoreSession())
  }, [dispatch])

  const themeConfig = useMemo(() => createThemeConfig(mode, accentColor), [mode, accentColor])

  return (
    <ErrorBoundary>
      <ConfigProvider theme={themeConfig}>
        <HashRouter>
          <AntdApp>
            <ThemeVariableUpdater />
            <AppRoutes />
          </AntdApp>
        </HashRouter>
      </ConfigProvider>
    </ErrorBoundary>
  )
}

export default App

import { useEffect, useMemo } from 'react'
import { HashRouter } from 'react-router-dom'
import { App as AntdApp, ConfigProvider, theme } from 'antd'

import { ErrorBoundary } from '@renderer/components/ErrorBoundary'
import { AppRoutes } from '@renderer/pages/routes'
import { createThemeConfig } from '@renderer/theme'
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import { restoreSession } from '@renderer/store/slices/auth'
import { selectAccentColor, selectThemeMode } from '@renderer/store/slices/theme'

const BodyStyleSynchronizer = () => {
  const { token } = theme.useToken()

  useEffect(() => {
    const { body, documentElement } = document
    body.style.margin = '0'
    body.style.minHeight = '100vh'
    body.style.backgroundColor = token.colorBgLayout
    body.style.color = token.colorTextBase
    body.style.fontFamily = token.fontFamily
    documentElement.style.backgroundColor = token.colorBgLayout
  }, [token.colorBgLayout, token.colorTextBase, token.fontFamily])

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
            <BodyStyleSynchronizer />
            <AppRoutes />
          </AntdApp>
        </HashRouter>
      </ConfigProvider>
    </ErrorBoundary>
  )
}

export default App

import { useEffect, useMemo } from 'react'
import { HashRouter } from 'react-router-dom'
import { App as AntdApp, ConfigProvider, theme } from 'antd'
import { Helmet } from 'react-helmet'

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

const SCROLLBAR_STYLE_ID = 'app-scrollbar-styles'
const NAVIGATION_STYLE_ID = 'app-navigation-styles'

const ScrollbarStyleSynchronizer = () => {
  const { token } = theme.useToken()

  useEffect(() => {
    let styleTag = document.getElementById(SCROLLBAR_STYLE_ID) as HTMLStyleElement | null
    if (!styleTag) {
      styleTag = document.createElement('style')
      styleTag.id = SCROLLBAR_STYLE_ID
      document.head.appendChild(styleTag)
    }

    const trackColor = token.colorBgElevated ?? token.colorBgContainer ?? '#1f1f1f'
    const thumbColor = token.colorBorderSecondary ?? token.colorPrimary ?? '#6b7280'
    const hoverColor = token.colorPrimary ?? thumbColor
    const borderRadius =
      typeof token.borderRadiusSM === 'number' ? `${token.borderRadiusSM}px` : '6px'
    const thickness = '10px'

    styleTag.textContent = `
      * {
        scrollbar-width: thin;
        scrollbar-color: ${thumbColor} ${trackColor};
      }

      *::-webkit-scrollbar {
        width: ${thickness};
        height: ${thickness};
      }

      *::-webkit-scrollbar-track {
        background: ${trackColor};
        border-radius: ${borderRadius};
      }

      *::-webkit-scrollbar-thumb {
        background-color: ${thumbColor};
        border-radius: ${borderRadius};
        border: 2px solid ${trackColor};
      }

      *::-webkit-scrollbar-thumb:hover {
        background-color: ${hoverColor};
      }

      *::-webkit-scrollbar-corner {
        background: ${trackColor};
      }
    `

    return () => {
      if (styleTag) {
        styleTag.textContent = ''
      }
    }
  }, [
    token.borderRadiusSM,
    token.colorBgContainer,
    token.colorBgElevated,
    token.colorBorderSecondary,
    token.colorPrimary
  ])

  return null
}

const NavigationStyleSynchronizer = () => {
  const { token } = theme.useToken()

  useEffect(() => {
    let styleTag = document.getElementById(NAVIGATION_STYLE_ID) as HTMLStyleElement | null
    if (!styleTag) {
      styleTag = document.createElement('style')
      styleTag.id = NAVIGATION_STYLE_ID
      document.head.appendChild(styleTag)
    }

    const baseColor = token.colorText
    const hoverColor = token.colorPrimary
    const focusOutline = hoverColor

    styleTag.textContent = `
      .${'app-breadcrumb-clickable'} {
        cursor: pointer;
        color: ${baseColor};
        transition: color 0.2s ease, text-decoration-color 0.2s ease;
      }

      .${'app-breadcrumb-clickable'}:hover,
      .${'app-breadcrumb-clickable'}:focus-visible {
        color: ${hoverColor};
        text-decoration: underline;
        text-decoration-color: ${hoverColor};
      }

      .${'app-breadcrumb-clickable'}:focus-visible {
        outline: 2px solid ${focusOutline};
        outline-offset: 2px;
      }
    `

    return () => {
      if (styleTag) {
        styleTag.textContent = ''
      }
    }
  }, [token.colorPrimary, token.colorText])

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

  const faviconHref = `${import.meta.env.BASE_URL ?? '/'}favicon.ico`

  return (
    <>
      <Helmet>
        <title>DSK Project Manager</title>
        <link rel="icon" href={faviconHref} />
      </Helmet>
      <ErrorBoundary>
        <ConfigProvider theme={themeConfig}>
          <HashRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}
          >
            <AntdApp>
              <BodyStyleSynchronizer />
              <ScrollbarStyleSynchronizer />
              <NavigationStyleSynchronizer />
              <AppRoutes />
            </AntdApp>
          </HashRouter>
        </ConfigProvider>
      </ErrorBoundary>
    </>
  )
}

export default App

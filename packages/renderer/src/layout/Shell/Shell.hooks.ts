import { useCallback, useMemo, useState, type CSSProperties } from 'react'
import { theme, type MenuProps } from 'antd'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

import { useAppSelector } from '@renderer/store/hooks'
import { selectThemeMode } from '@renderer/store/slices/theme'
import {
  buildNavigationItems,
  resolveNavigationMeta,
  resolveSelectedKey
} from '@renderer/layout/Shell/Shell.helpers'
import type {
  ShellLayoutParams,
  HeaderViewModel,
  UseShellLayoutResult
} from '@renderer/layout/Shell/Shell.types'

export const useShellLayout = ({ currentUser, onLogout }: ShellLayoutParams): UseShellLayoutResult => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { token } = theme.useToken()

  const [collapsed, setCollapsed] = useState(false)
  const mode = useAppSelector(selectThemeMode)

  const menuTheme: 'light' | 'dark' = useMemo(
    () => (mode === 'dark' ? 'dark' : 'light'),
    [mode]
  )

  const menuItems = useMemo<MenuProps['items']>(() => buildNavigationItems(t), [t])

  const selectedKeys = useMemo(() => {
    const key = resolveSelectedKey(location.pathname)
    return key ? [key] : []
  }, [location.pathname])

  const handleMenuSelect = useCallback<NonNullable<MenuProps['onClick']>>(
    ({ key }) => {
      if (location.pathname !== key) {
        navigate(String(key))
      }
    },
    [navigate, location.pathname]
  )

  const handleToggleCollapse = useCallback(() => {
    setCollapsed((value) => !value)
  }, [])

  const handleCollapseChange = useCallback((value: boolean) => {
    setCollapsed(value)
  }, [])

  const layoutStyle = useMemo<CSSProperties>(() => {
    const background =
      mode === 'dark'
        ? 'radial-gradient(circle at top, rgba(59,130,246,0.15), transparent 60%), radial-gradient(circle at 120% 20%, rgba(59,130,246,0.12), transparent 55%), radial-gradient(circle at -20% 30%, rgba(45,212,191,0.18), transparent 60%), ' +
          token.colorBgLayout
        : 'radial-gradient(circle at top, rgba(64, 111, 255, 0.12), transparent 55%), radial-gradient(circle at 120% 30%, rgba(45, 212, 191, 0.16), transparent 60%), radial-gradient(circle at -20% 40%, rgba(147, 197, 253, 0.14), transparent 60%), ' +
          token.colorBgLayout

    return {
      minHeight: '100vh',
      height: '100vh',
      overflow: 'hidden',
      background
    }
  }, [mode, token])

  const contentStyle = useMemo<CSSProperties>(
    () => ({
      background: 'transparent',
      padding: '32px 24px',
      overflowY: 'auto',
      minHeight: 0,
      flex: '1 1 auto'
    }),
    []
  )

  const labels = useMemo(
    () => ({
      expandSidebar: t('appShell.expandSidebar'),
      collapseSidebar: t('appShell.collapseSidebar'),
      title: t('appShell.title'),
      logout: t('appShell.logout')
    }),
    [t]
  )

  const activeMeta = useMemo(
    () => resolveNavigationMeta(location.pathname),
    [location.pathname]
  )

  const headerProps = useMemo<HeaderViewModel>(
    () => ({
      collapsed,
      onToggleCollapse: handleToggleCollapse,
      expandLabel: labels.expandSidebar,
      collapseLabel: labels.collapseSidebar,
      logoutLabel: labels.logout,
      onLogout,
      displayName: currentUser.displayName,
      username: currentUser.username,
      pageTitle: activeMeta ? t(activeMeta.labelKey) : t('appShell.title')
    }),
    [
      activeMeta,
      collapsed,
      currentUser.displayName,
      currentUser.username,
      handleToggleCollapse,
      labels,
      onLogout,
      t
    ]
  )

  return {
    collapsed,
    menuTheme,
    layoutStyle,
    contentStyle,
    menuItems,
    selectedKeys,
    handleMenuSelect,
    handleToggleCollapse,
    handleCollapseChange,
    labels,
    headerProps
  }
}

import { useCallback, useMemo, useState } from 'react'
import { theme, type MenuProps } from 'antd'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

import { useAppSelector } from '@renderer/store/hooks'
import { selectAccentColor, selectThemeMode } from '@renderer/store/slices/theme'
import { buildNavigationItems, resolveSelectedKey } from '@renderer/layout/Shell/Shell.helpers'
import type {
  ShellLayoutParams,
  ShellRoleBadge,
  UseShellLayoutResult
} from '@renderer/layout/Shell/Shell.types'

export const useShellLayout = ({ currentUser, onLogout }: ShellLayoutParams): UseShellLayoutResult => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { token } = theme.useToken()

  const [collapsed, setCollapsed] = useState(false)
  const accentColor = useAppSelector(selectAccentColor)
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

  const layoutStyle = useMemo(
    () => ({
      minHeight: '100vh',
      height: '100vh',
      overflow: 'hidden',
      background: token.colorBgLayout
    }),
    [token]
  )

  const contentStyle = useMemo(
    () => ({
      background: token.colorBgLayout,
      padding: 24,
      overflowY: 'auto',
      minHeight: 0,
      flex: '1 1 auto'
    }),
    [token]
  )

  const roles = useMemo<ShellRoleBadge[]>(
    () =>
      currentUser.roles.map((role) => ({
        id: role,
        label: t(`roles.${role}`, { defaultValue: role })
      })),
    [currentUser.roles, t]
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

  const footerData = useMemo(
    () => ({
      displayName: currentUser.displayName,
      username: currentUser.username,
      roles,
      accentColor,
      onLogout,
      logoutLabel: labels.logout
    }),
    [accentColor, currentUser.displayName, currentUser.username, labels.logout, onLogout, roles]
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
    footerData,
    labels
  }
}


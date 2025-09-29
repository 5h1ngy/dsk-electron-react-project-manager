import { useCallback, useMemo, useState } from 'react'
import type { MenuProps } from 'antd'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

import { useAppSelector } from '@renderer/store/hooks'
import { selectThemeMode } from '@renderer/store/slices/theme'
import { buildNavigationItems, resolveSelectedKey } from '@renderer/layout/Shell/Shell.helpers'
import type { UseShellLayoutResult } from '@renderer/layout/Shell/Shell.types'
import type { UserDTO } from '@main/services/auth'

export const useShellLayout = (currentUser?: UserDTO): UseShellLayoutResult => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  const [collapsed, setCollapsed] = useState(false)
  const [breakpointCollapsed, setBreakpointCollapsed] = useState(false)
  const mode = useAppSelector(selectThemeMode)

  const menuTheme: 'light' | 'dark' = useMemo(() => (mode === 'dark' ? 'dark' : 'light'), [mode])

  const includeUserManagement = useMemo(
    () => currentUser?.roles?.includes('Admin') ?? false,
    [currentUser?.roles]
  )

  const menuItems = useMemo<MenuProps['items']>(
    () => buildNavigationItems(t, { includeUserManagement }),
    [includeUserManagement, t]
  )

  const selectedKeys = useMemo(() => {
    const key = resolveSelectedKey(location.pathname, { includeUserManagement })
    return key ? [key] : []
  }, [includeUserManagement, location.pathname])

  const handleMenuSelect = useCallback<NonNullable<MenuProps['onClick']>>(
    ({ key }) => {
      if (location.pathname !== key) {
        navigate(String(key))
      }
    },
    [navigate, location.pathname]
  )

  const handleToggleCollapse = useCallback(() => {
    setCollapsed((value) => {
      const next = !value
      if (!next) {
        setBreakpointCollapsed(false)
      }
      return next
    })
  }, [setBreakpointCollapsed])

  const handleCollapseChange = useCallback(
    (value: boolean) => {
      setCollapsed(value)
      if (!value) {
        setBreakpointCollapsed(false)
      }
    },
    [setBreakpointCollapsed]
  )

  const handleBreakpoint = useCallback(
    (broken: boolean) => {
      if (broken) {
        setBreakpointCollapsed(true)
        setCollapsed(true)
      } else if (breakpointCollapsed) {
        setBreakpointCollapsed(false)
        setCollapsed(false)
      }
    },
    [breakpointCollapsed, setBreakpointCollapsed]
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

  return {
    collapsed,
    menuTheme,
    menuItems,
    selectedKeys,
    handleMenuSelect,
    handleToggleCollapse,
    handleCollapseChange,
    handleBreakpoint,
    labels
  }
}

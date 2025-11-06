import { useCallback, useEffect, useMemo, useState } from 'react'
import { Grid } from 'antd'
import type { MenuProps } from 'antd'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

import { useAppSelector } from '@renderer/store/hooks'
import { selectThemeMode } from '@renderer/store/slices/theme'
import { buildNavigationItems, resolveSelectedKey } from '@renderer/layout/Shell/Shell.helpers'
import type { UseShellLayoutResult } from '@renderer/layout/Shell/Shell.types'
import type { UserDTO } from '@services/services/auth'

export const useShellLayout = (currentUser?: UserDTO): UseShellLayoutResult => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  const [collapsed, setCollapsed] = useState(false)
  const [breakpointCollapsed, setBreakpointCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false)
  const mode = useAppSelector(selectThemeMode)
  const screens = Grid.useBreakpoint()

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

  const handleCloseMobileMenu = useCallback(() => {
    setMobileMenuVisible(false)
  }, [])

  const handleMenuSelect = useCallback<NonNullable<MenuProps['onClick']>>(
    ({ key }) => {
      if (location.pathname !== key) {
        navigate(String(key))
      }
      if (isMobile) {
        handleCloseMobileMenu()
      }
    },
    [handleCloseMobileMenu, isMobile, navigate, location.pathname]
  )

  const handleToggleCollapse = useCallback(() => {
    if (isMobile) {
      setMobileMenuVisible((visible) => !visible)
      return
    }
    setCollapsed((value) => {
      const next = !value
      if (!next) {
        setBreakpointCollapsed(false)
      }
      return next
    })
  }, [isMobile, setBreakpointCollapsed])

  const handleCollapseChange = useCallback(
    (value: boolean) => {
      if (isMobile) {
        if (!value) {
          handleCloseMobileMenu()
        }
        return
      }
      setCollapsed(value)
      if (!value) {
        setBreakpointCollapsed(false)
      }
    },
    [handleCloseMobileMenu, isMobile, setBreakpointCollapsed]
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

  useEffect(() => {
    if (screens.lg === undefined) {
      return
    }
    if (!screens.lg) {
      setIsMobile(true)
      setCollapsed(true)
      setBreakpointCollapsed(true)
      handleCloseMobileMenu()
    } else {
      setIsMobile(false)
      setBreakpointCollapsed(false)
      setCollapsed(false)
      handleCloseMobileMenu()
    }
  }, [handleCloseMobileMenu, screens.lg])

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
    isMobile,
    mobileMenuVisible,
    handleCloseMobileMenu,
    labels
  }
}

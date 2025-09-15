import { useCallback, useMemo, useState, type CSSProperties } from 'react'
import { theme, type MenuProps } from 'antd'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

import { useAppSelector } from '@renderer/store/hooks'
import { selectThemeMode } from '@renderer/store/slices/theme'
import { buildNavigationItems, resolveSelectedKey } from '@renderer/layout/Shell/Shell.helpers'
import type { UseShellLayoutResult } from '@renderer/layout/Shell/Shell.types'

export const useShellLayout = (): UseShellLayoutResult => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { token } = theme.useToken()
  const {
    paddingLG,
    paddingMD,
    paddingXL,
    paddingSM,
    marginLG,
    marginXL,
    colorBgLayout
  } = token

  const [collapsed, setCollapsed] = useState(false)
  const [breakpointCollapsed, setBreakpointCollapsed] = useState(false)
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
    setCollapsed((value) => {
      const next = !value
      if (!next) {
        setBreakpointCollapsed(false)
      }
      return next
    })
  }, [setBreakpointCollapsed])

  const handleCollapseChange = useCallback((value: boolean) => {
    setCollapsed(value)
    if (!value) {
      setBreakpointCollapsed(false)
    }
  }, [setBreakpointCollapsed])

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

  const responsiveInlinePadding = useMemo(
    () => `clamp(${paddingMD}px, 5vw, ${paddingXL}px)`,
    [paddingMD, paddingXL]
  )

  const layoutStyle = useMemo<CSSProperties>(() => {
    const background =
      mode === 'dark'
        ? 'radial-gradient(circle at top, rgba(59,130,246,0.15), transparent 60%), radial-gradient(circle at 120% 20%, rgba(59,130,246,0.12), transparent 55%), radial-gradient(circle at -20% 30%, rgba(45,212,191,0.18), transparent 60%), ' +
          colorBgLayout
        : 'radial-gradient(circle at top, rgba(64, 111, 255, 0.12), transparent 55%), radial-gradient(circle at 120% 30%, rgba(45, 212, 191, 0.16), transparent 60%), radial-gradient(circle at -20% 40%, rgba(147, 197, 253, 0.14), transparent 60%), ' +
          colorBgLayout

    return {
      minHeight: '100vh',
      height: '100vh',
      background,
      padding: paddingSM,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'stretch',
      columnGap: marginXL
    }
  }, [mode, colorBgLayout, paddingSM, marginXL])

  const contentStyle = useMemo<CSSProperties>(
    () => ({
      background: 'transparent',
      paddingBlock: `${paddingLG}px`,
      paddingInline: responsiveInlinePadding,
      overflow: 'auto',
      minHeight: 0,
      flex: '1 1 0%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      rowGap: marginLG,
      boxSizing: 'border-box'
    }),
    [paddingLG, responsiveInlinePadding, marginLG]
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
    layoutStyle,
    contentStyle,
    menuItems,
    selectedKeys,
    handleMenuSelect,
    handleToggleCollapse,
    handleCollapseChange,
    handleBreakpoint,
    labels
  }
}

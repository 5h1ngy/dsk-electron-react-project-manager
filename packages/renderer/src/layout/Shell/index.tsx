import { Layout, theme } from 'antd'
import type { MenuProps } from 'antd'
import { useCallback, useMemo, useState, type JSX, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

import type { UserDTO } from '@main/auth/authService'
import { useAppSelector } from '@renderer/store/hooks'
import { selectAccentColor, selectThemeMode } from '@renderer/store/slices/theme'

import { ShellHeader } from './components/ShellHeader'
import { ShellSider } from './components/ShellSider'
import { buildNavigationItems, resolveSelectedKey } from './helpers/navigation'

const { Content } = Layout

interface ShellProps {
  currentUser: UserDTO
  onLogout: () => void
  children: ReactNode
}

const Shell = ({ currentUser, onLogout, children }: ShellProps): JSX.Element => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { token } = theme.useToken()
  const [collapsed, setCollapsed] = useState(false)

  const accentColor = useAppSelector(selectAccentColor)
  const mode = useAppSelector(selectThemeMode)
  const menuTheme: 'light' | 'dark' = mode === 'dark' ? 'dark' : 'light'

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

  const layoutStyle = useMemo(
    () => ({
      minHeight: '100vh',
      background: token.colorBgLayout
    }),
    [token]
  )

  const contentStyle = useMemo(
    () => ({
      background: token.colorBgLayout,
      padding: 24
    }),
    [token]
  )

  const roles = useMemo(
    () =>
      currentUser.roles.map((role) => ({
        id: role,
        label: t(`roles.${role}`, { defaultValue: role })
      })),
    [currentUser.roles, t]
  )

  const welcomeMessage = useMemo(
    () => t('appShell.welcome', { name: currentUser.displayName }),
    [currentUser.displayName, t]
  )

  return (
    <Layout style={layoutStyle}>
      <ShellSider
        collapsed={collapsed}
        onCollapse={setCollapsed}
        selectedKeys={selectedKeys}
        items={menuItems}
        themeMode={menuTheme}
        title={t('appShell.title')}
        onSelect={handleMenuSelect}
      />
      <Layout>
        <ShellHeader
          collapsed={collapsed}
          onToggleCollapse={handleToggleCollapse}
          welcomeMessage={welcomeMessage}
          roles={roles}
          accentColor={accentColor}
          onLogout={onLogout}
          logoutLabel={t('appShell.logout')}
          expandLabel={t('appShell.expandSidebar')}
          collapseLabel={t('appShell.collapseSidebar')}
        />
        <Content style={contentStyle}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>{children}</div>
        </Content>
      </Layout>
    </Layout>
  )
}

Shell.displayName = 'AppShell'

export default Shell

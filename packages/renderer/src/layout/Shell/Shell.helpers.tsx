import { AppstoreOutlined, DashboardOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import type { TFunction } from 'i18next'
import type { ReactNode } from 'react'

interface NavigationDefinition {
  path: string
  labelKey: string
  icon: ReactNode
}

const NAVIGATION: NavigationDefinition[] = [
  {
    path: '/',
    labelKey: 'appShell.navigation.dashboard',
    icon: <DashboardOutlined />
  },
  {
    path: '/projects',
    labelKey: 'appShell.navigation.projects',
    icon: <AppstoreOutlined />
  }
]

export const buildNavigationItems = (t: TFunction): MenuProps['items'] =>
  NAVIGATION.map((item) => ({
    key: item.path,
    icon: item.icon,
    label: t(item.labelKey)
  }))

export const resolveSelectedKey = (pathname: string): string | undefined => {
  const match = NAVIGATION.find((item) =>
    item.path === '/' ? pathname === '/' : pathname.startsWith(item.path)
  )
  return match?.path
}

import {
  AppstoreOutlined,
  DashboardOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  TeamOutlined
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import type { TFunction } from 'i18next'
import type { ReactNode } from 'react'

export interface NavigationDefinition {
  path: string
  labelKey: string
  icon: ReactNode
}

const BASE_NAVIGATION: NavigationDefinition[] = [
  {
    path: '/',
    labelKey: 'appShell.navigation.dashboard',
    icon: <DashboardOutlined />
  },
  {
    path: '/projects',
    labelKey: 'appShell.navigation.projects',
    icon: <AppstoreOutlined />
  },
  {
    path: '/settings',
    labelKey: 'appShell.navigation.settings',
    icon: <SettingOutlined />
  }
]

const USER_MANAGEMENT_NAVIGATION: NavigationDefinition = {
  path: '/admin/users',
  labelKey: 'appShell.navigation.userManagement',
  icon: <TeamOutlined />
}

const ROLE_MANAGEMENT_NAVIGATION: NavigationDefinition = {
  path: '/admin/roles',
  labelKey: 'appShell.navigation.roleManagement',
  icon: <SafetyCertificateOutlined />
}

interface NavigationOptions {
  includeUserManagement?: boolean
}

const buildNavigationDefinitions = (options?: NavigationOptions): NavigationDefinition[] => {
  const items = [...BASE_NAVIGATION]
  if (options?.includeUserManagement) {
    items.splice(1, 0, USER_MANAGEMENT_NAVIGATION, ROLE_MANAGEMENT_NAVIGATION)
  }
  return items
}

export const buildNavigationItems = (
  t: TFunction,
  options?: NavigationOptions
): MenuProps['items'] =>
  buildNavigationDefinitions(options).map((item) => ({
    key: item.path,
    icon: item.icon,
    label: t(item.labelKey)
  }))

export const resolveSelectedKey = (
  pathname: string,
  options?: NavigationOptions
): string | undefined => {
  const navigation = buildNavigationDefinitions(options)
  const match = navigation.find((item) =>
    item.path === '/' ? pathname === '/' : pathname.startsWith(item.path)
  )
  return match?.path
}

export const resolveNavigationMeta = (
  pathname: string,
  options?: NavigationOptions
): NavigationDefinition | undefined => {
  const navigation = buildNavigationDefinitions(options)
  return navigation.find((item) =>
    item.path === '/' ? pathname === '/' : pathname.startsWith(item.path)
  )
}

import type { CSSProperties, ReactNode } from 'react'
import type { MenuProps } from 'antd'
import type { UserDTO } from '@main/services/auth'

export type MenuTheme = 'light' | 'dark'

export interface ShellProps {
  currentUser: UserDTO
  onLogout: () => void
  children: ReactNode
}

export interface ShellLabels {
  expandSidebar: string
  collapseSidebar: string
  title: string
  logout: string
}

export interface UseShellLayoutResult {
  collapsed: boolean
  menuTheme: MenuTheme
  layoutStyle: CSSProperties
  contentStyle: CSSProperties
  menuItems: MenuProps['items']
  selectedKeys: string[]
  handleMenuSelect: NonNullable<MenuProps['onClick']>
  handleToggleCollapse: () => void
  handleCollapseChange: (collapsed: boolean) => void
  handleBreakpoint: (broken: boolean) => void
  labels: ShellLabels
}

import type { ReactNode } from 'react'
import type { MenuProps } from 'antd'
import type { UserDTO } from '@main/services/auth'
import type { ShellStyleResult } from '@renderer/layout/Shell/Shell.style'

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
  menuItems: MenuProps['items']
  selectedKeys: string[]
  handleMenuSelect: NonNullable<MenuProps['onClick']>
  handleToggleCollapse: () => void
  handleCollapseChange: (collapsed: boolean) => void
  handleBreakpoint: (broken: boolean) => void
  labels: ShellLabels
}

export interface ShellViewProps {
  styles: ShellStyleResult
  collapsed: boolean
  menuTheme: MenuTheme
  menuItems: MenuProps['items']
  selectedKeys: string[]
  labels: ShellLabels
  headerContent: ReactNode
  accountButton: ReactNode
  children: ReactNode
  onMenuSelect: NonNullable<MenuProps['onClick']>
  onToggleCollapse: () => void
  onCollapseChange: (collapsed: boolean) => void
  onBreakpoint: (broken: boolean) => void
}

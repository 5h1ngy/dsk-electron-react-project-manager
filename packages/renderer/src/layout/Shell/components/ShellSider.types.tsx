import type { MenuProps } from 'antd'
import type { ReactNode } from 'react'

export interface ShellSiderProps {
  collapsed: boolean
  onCollapse: (collapsed: boolean) => void
  selectedKeys: string[]
  items: MenuProps['items']
  themeMode: 'light' | 'dark'
  title: string
  onSelect: NonNullable<MenuProps['onClick']>
  footer?: ReactNode
}


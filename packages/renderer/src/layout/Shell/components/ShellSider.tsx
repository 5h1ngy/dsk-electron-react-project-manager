import { Flex, Layout, Menu, Typography, theme } from 'antd'
import type { MenuProps } from 'antd'
import type { JSX } from 'react'

const { Sider } = Layout

interface ShellSiderProps {
  collapsed: boolean
  onCollapse: (collapsed: boolean) => void
  selectedKeys: string[]
  items: MenuProps['items']
  themeMode: 'light' | 'dark'
  title: string
  onSelect: NonNullable<MenuProps['onClick']>
}

export const ShellSider = ({
  collapsed,
  onCollapse,
  selectedKeys,
  items,
  themeMode,
  title,
  onSelect
}: ShellSiderProps): JSX.Element => {
  const { token } = theme.useToken()
  const background = themeMode === 'dark' ? token.colorBgElevated : token.colorBgContainer
  const borderColor = token.colorSplit

  return (
    <Sider
      width={240}
      collapsedWidth={72}
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => onCollapse(value)}
      trigger={null}
      theme={themeMode}
      style={{
        background,
        borderRight: `1px solid ${borderColor}`
      }}
    >
      {!collapsed && (
        <Flex
          align="center"
          justify="center"
          style={{ height: 64, borderBottom: `1px solid ${borderColor}` }}
        >
          <Typography.Title level={4} style={{ margin: 0 }}>
            {title}
          </Typography.Title>
        </Flex>
      )}
      <Menu
        mode="inline"
        theme={themeMode}
        items={items}
        selectedKeys={selectedKeys}
        onClick={onSelect}
      />
    </Sider>
  )
}

ShellSider.displayName = 'ShellSider'

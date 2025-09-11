import { Flex, Layout, Menu, Typography } from 'antd'
import type { JSX } from 'react'

import { useSiderStyles } from '@renderer/layout/Shell/components/Sider.hooks'
import type { SiderProps } from '@renderer/layout/Shell/components/Sider.types'

const { Sider: AntSider } = Layout

const Sider = ({
  collapsed,
  onCollapse,
  selectedKeys,
  items,
  themeMode,
  title,
  onSelect,
  footer
}: SiderProps): JSX.Element => {
  const { background, borderColor } = useSiderStyles(themeMode)

  return (
    <AntSider
      width={240}
      collapsedWidth={72}
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => onCollapse(value)}
      trigger={null}
      theme={themeMode}
      style={{
        background,
        borderRight: `1px solid ${borderColor}`,
        display: 'flex',
        flexDirection: 'column'
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
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Menu
          mode="inline"
          theme={themeMode}
          items={items}
          selectedKeys={selectedKeys}
          onClick={onSelect}
          style={{ borderInlineEnd: 'none', background: 'transparent' }}
        />
      </div>
      {footer && (
        <div
          style={{
            padding: 16,
            borderTop: `1px solid ${borderColor}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            marginTop: 'auto',
            flexShrink: 0
          }}
        >
          {footer}
        </div>
      )}
    </AntSider>
  )
}

Sider.displayName = 'Sider'

export { Sider }
export default Sider

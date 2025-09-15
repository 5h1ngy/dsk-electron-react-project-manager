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
  const { background, borderColor, accent, muted, text } = useSiderStyles(themeMode)

  return (
    <AntSider
      width={204}
      collapsedWidth={68}
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => onCollapse(value)}
      trigger={null}
      theme={themeMode}
      style={{
        background,
        borderRight: `1px solid ${borderColor}`,
        display: 'flex',
        flexDirection: 'column',
        padding: collapsed ? '18px 8px' : '24px 14px',
        gap: 16,
        borderRadius: 22,
        margin: '24px 12px 24px 18px',
        transition: 'background 0.3s ease, border-color 0.3s ease, margin 0.3s ease'
      }}
    >
      <Flex
        align="center"
        gap={collapsed ? 0 : 12}
        justify={collapsed ? 'center' : 'flex-start'}
        style={{ minHeight: 48 }}
      >
        <div
          aria-hidden
          style={{
            width: collapsed ? 36 : 40,
            height: collapsed ? 36 : 40,
            borderRadius: 14,
            backgroundImage:
              themeMode === 'dark'
                ? `linear-gradient(135deg, ${accent}, rgba(96, 165, 250, 0.75))`
                : `linear-gradient(135deg, ${accent}, rgba(59, 130, 246, 0.65))`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: collapsed ? 16 : 18,
            letterSpacing: 0.5
          }}
        >
          {title.slice(0, 1)}
        </div>
        {!collapsed && (
          <Flex vertical gap={2}>
            <Typography.Text strong style={{ color: text, fontSize: 16 }}>
              {title}
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12, color: muted }}>
              Workspace
            </Typography.Text>
          </Flex>
        )}
      </Flex>
      <div style={{ flex: 1, overflowY: 'auto', marginTop: 8 }}>
        <Menu
          mode="inline"
          theme={themeMode}
          items={items}
          selectedKeys={selectedKeys}
          onClick={onSelect}
          style={{
            borderInlineEnd: 'none',
            background: 'transparent',
            paddingInline: collapsed ? 0 : 2,
            gap: 8,
            display: 'flex',
            flexDirection: 'column'
          }}
          inlineCollapsed={collapsed}
          inlineIndent={collapsed ? 12 : 18}
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

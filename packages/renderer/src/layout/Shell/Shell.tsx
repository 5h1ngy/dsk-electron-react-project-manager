import { Layout } from 'antd'
import type { JSX } from 'react'

import Header from '@renderer/layout/Shell/components/Header'
import { ShellSider } from '@renderer/layout/Shell/components/Sider'
import { ShellSiderFooter } from '@renderer/layout/Shell/components/SiderFooter'
import { useShellLayout } from '@renderer/layout/Shell/Shell.hooks'
import type { ShellProps } from '@renderer/layout/Shell/Shell.types'

const { Content } = Layout

const INNER_LAYOUT_STYLE = {
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column'
} as const

const Shell = ({ currentUser, onLogout, children }: ShellProps): JSX.Element => {
  const {
    collapsed,
    menuTheme,
    layoutStyle,
    contentStyle,
    menuItems,
    selectedKeys,
    handleMenuSelect,
    handleToggleCollapse,
    handleCollapseChange,
    footerData,
    labels
  } = useShellLayout({ currentUser, onLogout })

  return (
    <Layout style={layoutStyle}>
      <ShellSider
        collapsed={collapsed}
        onCollapse={handleCollapseChange}
        selectedKeys={selectedKeys}
        items={menuItems}
        themeMode={menuTheme}
        title={labels.title}
        onSelect={handleMenuSelect}
        footer={<ShellSiderFooter {...footerData} />}
      />
      <Layout style={INNER_LAYOUT_STYLE}>
        <Header
          collapsed={collapsed}
          onToggleCollapse={handleToggleCollapse}
          expandLabel={labels.expandSidebar}
          collapseLabel={labels.collapseSidebar}
        />
        <Content style={contentStyle}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>{children}</div>
        </Content>
      </Layout>
    </Layout>
  )
}

Shell.displayName = 'Shell'

export default Shell


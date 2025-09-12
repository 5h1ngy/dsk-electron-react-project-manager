import { Layout } from 'antd'
import type { JSX } from 'react'

import Header from '@renderer/layout/Shell/components/Header'
import Sider from '@renderer/layout/Shell/components/Sider'
import { useShellLayout } from '@renderer/layout/Shell/Shell.hooks'
import type { ShellProps } from '@renderer/layout/Shell/Shell.types'

const { Content } = Layout

const INNER_LAYOUT_STYLE = {
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column'
} as const

const CONTENT_WRAPPER_STYLE = {
  maxWidth: 1280,
  margin: '0 auto',
  width: '100%',
  minHeight: '100%'
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
    handleCollapseChange,
    labels,
    headerProps
  } = useShellLayout({ currentUser, onLogout })

  return (
    <Layout style={layoutStyle}>
      <Sider
        collapsed={collapsed}
        onCollapse={handleCollapseChange}
        selectedKeys={selectedKeys}
        items={menuItems}
        themeMode={menuTheme}
        title={labels.title}
        onSelect={handleMenuSelect}
      />
      <Layout style={INNER_LAYOUT_STYLE}>
        <Header
          {...headerProps}
        />
        <Content style={contentStyle}>
          <div style={CONTENT_WRAPPER_STYLE}>{children}</div>
        </Content>
      </Layout>
    </Layout>
  )
}

Shell.displayName = 'Shell'

export { Shell }
export default Shell


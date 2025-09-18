import { Button, Flex, Layout } from 'antd'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'

import Sider from '@renderer/layout/Shell/components/Sider'
import type { ShellViewProps } from '@renderer/layout/Shell/Shell.types'

const { Content } = Layout

export const ShellView = ({
  styles,
  collapsed,
  menuTheme,
  menuItems,
  selectedKeys,
  labels,
  headerContent,
  accountButton,
  children,
  onMenuSelect,
  onToggleCollapse,
  onCollapseChange,
  onBreakpoint
}: ShellViewProps) => (
  <Layout style={styles.layoutStyle}>
    <Sider
      collapsed={collapsed}
      onCollapse={onCollapseChange}
      onBreakpoint={onBreakpoint}
      selectedKeys={selectedKeys}
      items={menuItems}
      themeMode={menuTheme}
      title={labels.title}
      onSelect={onMenuSelect}
      footer={accountButton}
    />
    <Layout style={styles.innerLayoutStyle}>
      <Content style={styles.contentStyle}>
        <Flex align="center" gap={styles.toolbarGap} wrap="wrap">
          <Button
            type="default"
            shape="circle"
            size="large"
            onClick={onToggleCollapse}
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            aria-label={collapsed ? labels.expandSidebar : labels.collapseSidebar}
            style={styles.collapseButtonStyle}
          />
          <Flex
            align="center"
            gap={styles.toolbarGap}
            style={styles.headerContainerStyle}
            wrap="wrap"
          >
            {headerContent}
          </Flex>
        </Flex>
        <Flex vertical style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          {children}
        </Flex>
      </Content>
    </Layout>
  </Layout>
)

ShellView.displayName = 'ShellView'

export default ShellView

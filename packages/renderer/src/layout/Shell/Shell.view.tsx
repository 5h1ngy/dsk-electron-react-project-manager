import { Button, Flex, Layout, Modal } from 'antd'
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
  onBreakpoint,
  isMobile,
  mobileMenuVisible,
  onCloseMobileMenu
}: ShellViewProps) => {
  const isMenuExpanded = isMobile ? mobileMenuVisible : !collapsed
  const collapseIcon = isMobile
    ? mobileMenuVisible
      ? <MenuFoldOutlined />
      : <MenuUnfoldOutlined />
    : collapsed
      ? <MenuUnfoldOutlined />
      : <MenuFoldOutlined />
  const collapseAriaLabel = isMenuExpanded ? labels.collapseSidebar : labels.expandSidebar

  return (
    <Layout style={styles.layoutStyle}>
      {!isMobile ? (
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
      ) : null}
      <Layout style={styles.innerLayoutStyle}>
        <Content style={styles.contentStyle}>
          <Flex align="center" gap={styles.toolbarGap} wrap="wrap">
            <Button
              type="default"
              shape="circle"
              size="large"
              onClick={onToggleCollapse}
              icon={collapseIcon}
              aria-label={collapseAriaLabel}
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
      {isMobile ? (
        <Modal
          open={mobileMenuVisible}
          onCancel={onCloseMobileMenu}
          footer={null}
          title={labels.title}
          width="100%"
          centered={false}
          destroyOnClose
          maskClosable
          style={{ top: 0, padding: 0 }}
          bodyStyle={{ padding: 0 }}
        >
          <Sider
            collapsed={false}
            onCollapse={(value) => {
              if (!value) {
                onCloseMobileMenu()
              }
            }}
            selectedKeys={selectedKeys}
            items={menuItems}
            themeMode={menuTheme}
            title={labels.title}
            onSelect={onMenuSelect}
            footer={accountButton}
            variant="mobile"
          />
        </Modal>
      ) : null}
    </Layout>
  )
}

ShellView.displayName = 'ShellView'

export default ShellView

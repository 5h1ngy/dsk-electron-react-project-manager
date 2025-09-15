import { Avatar, Button, Divider, Dropdown, Layout, Space, Typography, theme } from 'antd'
import { MenuFoldOutlined, MenuUnfoldOutlined, PoweroffOutlined } from '@ant-design/icons'
import { useCallback, useMemo, useState, type CSSProperties, type JSX, type ReactNode } from 'react'

import Sider from '@renderer/layout/Shell/components/Sider'
import { useShellLayout } from '@renderer/layout/Shell/Shell.hooks'
import type { ShellProps } from '@renderer/layout/Shell/Shell.types'
import { ShellHeaderProvider } from '@renderer/layout/Shell/ShellHeader.context'
import { getInitials, pickColor } from '@renderer/layout/Shell/utils/userIdentity'

const { Content } = Layout

const INNER_LAYOUT_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0,
  background: 'transparent'
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
    handleBreakpoint,
    labels
  } = useShellLayout()
  const { token } = theme.useToken()
  const [headerContent, setHeaderContent] = useState<ReactNode>(null)
  const handleHeaderChange = useCallback((content: ReactNode) => {
    setHeaderContent(content)
  }, [])

  const avatarColor = pickColor(currentUser.displayName)

  const contentWrapperStyle = useMemo<CSSProperties>(
    () => ({
      width: '100%',
      margin: '0'
    }),
    []
  )

  const toolbarStyle = useMemo<CSSProperties>(
    () => ({
      display: 'flex',
      alignItems: 'center',
      gap: token.marginSM,
      width: '100%',
      margin: '0',
      padding: 0,
      flexWrap: 'wrap'
    }),
    [token.marginSM]
  )

  const accountDropdownStyle = useMemo<CSSProperties>(
    () => ({
      padding: token.paddingLG,
      width: 240,
      background: token.colorBgElevated,
      borderRadius: token.borderRadiusLG,
      boxShadow: token.boxShadowSecondary
    }),
    [token.borderRadiusLG, token.boxShadowSecondary, token.colorBgElevated, token.paddingLG]
  )

  const accountButtonStyle = useMemo<CSSProperties>(
    () => ({
      width: '100%',
      height: token.controlHeightLG,
      borderRadius: token.borderRadiusLG,
      display: 'flex',
      alignItems: 'center',
      justifyContent: collapsed ? 'center' : 'flex-start',
      gap: collapsed ? 0 : token.marginXS,
      padding: collapsed ? 0 : `0 ${token.paddingSM}px`,
      background: menuTheme === 'dark' ? token.colorFillSecondary : token.colorBgElevated,
      border: `1px solid ${token.colorBorderSecondary}`,
      transition: `background ${token.motionDurationMid}`
    }),
    [
      collapsed,
      menuTheme,
      token.borderRadiusLG,
      token.colorBgElevated,
      token.colorBorderSecondary,
      token.colorFillSecondary,
      token.controlHeightLG,
      token.marginXS,
      token.motionDurationMid,
      token.paddingSM
    ]
  )

  const collapseButtonStyle = useMemo<CSSProperties>(
    () => ({
      borderRadius: token.borderRadiusLG,
      background: menuTheme === 'dark' ? token.colorFillSecondary : token.colorBgElevated,
      border: `1px solid ${token.colorBorderSecondary}`,
      width: token.controlHeightLG,
      height: token.controlHeightLG,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 0
    }),
    [
      menuTheme,
      token.borderRadiusLG,
      token.colorBgElevated,
      token.colorBorderSecondary,
      token.colorFillSecondary,
      token.controlHeightLG
    ]
  )

  const accountDropdown = (
    <div
      style={accountDropdownStyle}
    >
      <Space direction="vertical" size={token.marginSM} style={{ width: '100%' }}>
        <div>
          <Typography.Text strong style={{ display: 'block' }}>
            {currentUser.displayName}
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            {currentUser.username}
          </Typography.Text>
        </div>
        <Divider style={{ margin: `${token.marginSM}px 0` }} />
        <Button
          type="primary"
          danger
          icon={<PoweroffOutlined />}
          block
          onClick={onLogout}
        >
          {labels.logout}
        </Button>
      </Space>
    </div>
  )

  const accountButton = (
    <Dropdown trigger={['click']} dropdownRender={() => accountDropdown} placement="topLeft">
      <Button
        style={accountButtonStyle}
        aria-label={labels.logout}
      >
        <Avatar
          style={{ backgroundColor: avatarColor, color: token.colorWhite }}
          size={collapsed ? token.controlHeightSM : token.controlHeightLG}
        >
          {getInitials(currentUser.displayName)}
        </Avatar>
        {!collapsed && (
          <Space direction="vertical" size={0} align="start">
            <Typography.Text strong style={{ fontSize: token.fontSizeSM }}>
              {currentUser.displayName}
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              {currentUser.username}
            </Typography.Text>
          </Space>
        )}
      </Button>
    </Dropdown>
  )

  return (
    <ShellHeaderProvider onHeaderChange={handleHeaderChange}>
      <Layout style={layoutStyle}>
        <Sider
          collapsed={collapsed}
          onCollapse={handleCollapseChange}
          onBreakpoint={handleBreakpoint}
          selectedKeys={selectedKeys}
          items={menuItems}
          themeMode={menuTheme}
          title={labels.title}
          onSelect={handleMenuSelect}
          footer={accountButton}
        />
        <Layout style={INNER_LAYOUT_STYLE}>
          <Content style={contentStyle}>
            <div style={toolbarStyle}>
              <Button
                type="default"
                size="large"
                onClick={handleToggleCollapse}
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                aria-label={collapsed ? labels.expandSidebar : labels.collapseSidebar}
                style={collapseButtonStyle}
              />
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: token.controlHeightLG,
                  gap: token.marginSM
                }}
              >
                {headerContent}
              </div>
            </div>
            <div style={contentWrapperStyle}>{children}</div>
          </Content>
        </Layout>
      </Layout>
    </ShellHeaderProvider>
  )
}

Shell.displayName = 'Shell'

export { Shell }
export default Shell


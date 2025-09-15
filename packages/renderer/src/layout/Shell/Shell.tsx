import { Avatar, Button, Card, Divider, Dropdown, Flex, Layout, Typography, theme } from 'antd'
import { MenuFoldOutlined, MenuUnfoldOutlined, PoweroffOutlined } from '@ant-design/icons'
import { useCallback, useMemo, useState, type JSX, type ReactNode } from 'react'

import Sider from '@renderer/layout/Shell/components/Sider'
import { useShellLayout } from '@renderer/layout/Shell/Shell.hooks'
import type { ShellProps } from '@renderer/layout/Shell/Shell.types'
import { ShellHeaderProvider } from '@renderer/layout/Shell/ShellHeader.context'
import { getInitials } from '@renderer/layout/Shell/utils/userIdentity'
import { resolveAccentForeground } from '@renderer/theme/foundations/brand'
import { resolvePalette } from '@renderer/theme/foundations/palette'
import { useThemeTokens } from '@renderer/theme/hooks/useThemeTokens'

const { Content } = Layout

const Shell = ({ currentUser, onLogout, children }: ShellProps): JSX.Element => {
  const {
    collapsed,
    menuTheme,
    menuItems,
    selectedKeys,
    handleMenuSelect,
    handleToggleCollapse,
    handleCollapseChange,
    handleBreakpoint,
    labels
  } = useShellLayout()
  const { token } = theme.useToken()
  const { spacing } = useThemeTokens()
  const [headerContent, setHeaderContent] = useState<ReactNode>(null)
  const handleHeaderChange = useCallback((content: ReactNode) => {
    setHeaderContent(content)
  }, [])

  const palette = useMemo(() => resolvePalette(menuTheme), [menuTheme])
  const avatarPalette = useMemo(
    () => [token.colorPrimary, token.colorSuccess, token.colorWarning, token.colorError],
    [token.colorError, token.colorPrimary, token.colorSuccess, token.colorWarning]
  )
  const avatarColor = useMemo(() => {
    const source = currentUser.displayName ?? ''
    if (!source.trim()) {
      return avatarPalette[0]
    }
    const sum = [...source.trim()].reduce((accumulator, char) => accumulator + char.charCodeAt(0), 0)
    return avatarPalette[sum % avatarPalette.length]
  }, [avatarPalette, currentUser.displayName])
  const avatarForeground = useMemo(
    () => resolveAccentForeground(avatarColor, palette),
    [avatarColor, palette]
  )
  const dropdownWidth = useMemo(() => token.controlHeightLG * 5, [token.controlHeightLG])
  const contentPaddingInline = token.paddingXL
  const contentPaddingBlock = token.paddingLG
  const toolbarGap = spacing.sm
  const layoutGap = spacing.xl

  const accountDropdown = (
    <Card
      bordered={false}
      style={{
        width: dropdownWidth,
        background: token.colorBgElevated,
        borderRadius: token.borderRadiusLG,
        boxShadow: token.boxShadowSecondary
      }}
      bodyStyle={{ padding: token.paddingLG }}
    >
      <Flex vertical gap={spacing.sm}>
        <Flex vertical gap={spacing.xs}>
          <Typography.Text strong>{currentUser.displayName}</Typography.Text>
          <Typography.Text type="secondary">{currentUser.username}</Typography.Text>
        </Flex>
        <Divider style={{ marginBlock: `${token.marginSM}px` }} />
        <Button
          type="primary"
          danger
          icon={<PoweroffOutlined />}
          block
          onClick={onLogout}
        >
          {labels.logout}
        </Button>
      </Flex>
    </Card>
  )

  const accountButton = (
    <Dropdown trigger={['click']} dropdownRender={() => accountDropdown} placement="topLeft">
      <Button
        block
        size="large"
        style={{
          borderRadius: token.borderRadiusLG,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: collapsed ? 0 : spacing.xs,
          paddingInline: collapsed ? 0 : token.paddingSM,
          height: token.controlHeightLG,
          background: menuTheme === 'dark' ? token.colorFillSecondary : token.colorBgContainer,
          borderColor: token.colorBorderSecondary
        }}
        aria-label={labels.logout}
      >
        <Avatar
          style={{ backgroundColor: avatarColor, color: avatarForeground }}
          size={collapsed ? token.controlHeightSM : token.controlHeightLG}
        >
          {getInitials(currentUser.displayName)}
        </Avatar>
        {!collapsed && (
          <Flex vertical gap={0}>
            <Typography.Text strong style={{ fontSize: token.fontSizeSM }}>
              {currentUser.displayName}
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              {currentUser.username}
            </Typography.Text>
          </Flex>
        )}
      </Button>
    </Dropdown>
  )

  return (
    <ShellHeaderProvider onHeaderChange={handleHeaderChange}>
      <Layout
        style={{
          minHeight: '100vh',
          padding: token.paddingSM,
          gap: layoutGap,
          background: token.colorBgLayout,
          display: 'flex',
          alignItems: 'stretch'
        }}
      >
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
        <Layout
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minWidth: 0,
            background: 'transparent'
          }}
        >
          <Content
            style={{
              paddingInline: contentPaddingInline,
              paddingBlock: contentPaddingBlock,
              display: 'flex',
              flexDirection: 'column',
              gap: spacing.lg,
              minHeight: 0,
              background: 'transparent'
            }}
          >
            <Flex align="center" gap={toolbarGap} wrap="wrap">
              <Button
                type="default"
                shape="circle"
                size="large"
                onClick={handleToggleCollapse}
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                aria-label={collapsed ? labels.expandSidebar : labels.collapseSidebar}
                style={{
                  borderRadius: token.borderRadiusLG,
                  background: menuTheme === 'dark' ? token.colorFillSecondary : token.colorBgContainer,
                  borderColor: token.colorBorderSecondary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              />
              <Flex
                align="center"
                gap={toolbarGap}
                style={{ flex: 1, minHeight: token.controlHeightLG }}
                wrap="wrap"
              >
                {headerContent}
              </Flex>
            </Flex>
            <Flex vertical style={{ flex: 1, minHeight: 0 }}>
              {children}
            </Flex>
          </Content>
        </Layout>
      </Layout>
    </ShellHeaderProvider>
  )
}

Shell.displayName = 'Shell'

export { Shell }
export default Shell

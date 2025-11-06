import { Avatar, Button, Dropdown, Flex, Typography } from 'antd'
import { useCallback, useEffect, useMemo, useState, type JSX, type ReactNode } from 'react'

import { AccountMenu } from '@renderer/layout/Shell/components/AccountMenu'
import { getInitials } from '@renderer/layout/Shell/utils/userIdentity'
import ShellView from '@renderer/layout/Shell/Shell.view'
import { useShellLayout } from '@renderer/layout/Shell/Shell.hooks'
import { useShellStyles } from '@renderer/layout/Shell/Shell.style'
import { ShellHeaderProvider } from '@renderer/layout/Shell/ShellHeader.context'
import type { ShellProps } from '@renderer/layout/Shell/Shell.types'

const ShellContainer = ({ currentUser, onLogout, children }: ShellProps): JSX.Element => {
  const {
    collapsed,
    menuTheme,
    menuItems,
    selectedKeys,
    handleMenuSelect,
    handleToggleCollapse,
    handleCollapseChange,
    handleBreakpoint,
    labels,
    isMobile,
    mobileMenuVisible,
    handleCloseMobileMenu
  } = useShellLayout(currentUser)

  const styles = useShellStyles({
    menuTheme,
    collapsed,
    displayName: currentUser.displayName,
    isMobile
  })
  const { accountButtonStyle, accountAvatarStyle, accountAvatarSizes, dropdownWidth, token } =
    styles

  useEffect(() => {
    const styleId = 'app-pagination-active-style'
    let styleTag = document.getElementById(styleId) as HTMLStyleElement | null
    if (!styleTag) {
      styleTag = document.createElement('style')
      styleTag.id = styleId
      document.head.appendChild(styleTag)
    }
    styleTag.textContent = `.ant-pagination .ant-pagination-item-active a {
  color: ${token.colorTextLightSolid} !important;
  font-weight: ${token.fontWeightStrong};
}`
  }, [token.colorTextLightSolid, token.fontWeightStrong])

  const [headerContent, setHeaderContent] = useState<ReactNode>(null)
  const handleHeaderChange = useCallback((content: ReactNode) => {
    setHeaderContent(content)
  }, [])

  const accountMenu = useMemo(
    () => (
      <AccountMenu
        displayName={currentUser.displayName}
        username={currentUser.username}
        onLogout={onLogout}
        labels={labels}
        width={dropdownWidth}
      />
    ),
    [currentUser.displayName, currentUser.username, labels, onLogout, dropdownWidth]
  )

  const accountButton = useMemo(
    () => (
      <Dropdown trigger={['click']} popupRender={() => accountMenu} placement="topLeft">
        <Button block size="large" style={accountButtonStyle} aria-label={labels.logout}>
          <Avatar
            style={accountAvatarStyle}
            size={collapsed ? accountAvatarSizes.collapsed : accountAvatarSizes.expanded}
          >
            {getInitials(currentUser.displayName)}
          </Avatar>
          {!collapsed && (
            <Flex vertical gap={0} style={{ textAlign: 'left' }}>
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
    ),
    [
      accountAvatarStyle,
      accountAvatarSizes.collapsed,
      accountAvatarSizes.expanded,
      accountButtonStyle,
      accountMenu,
      collapsed,
      currentUser.displayName,
      currentUser.username,
      labels.logout,
      token.fontSizeSM
    ]
  )

  return (
    <ShellHeaderProvider onHeaderChange={handleHeaderChange}>
      <ShellView
        styles={styles}
        collapsed={collapsed}
        menuTheme={menuTheme}
        menuItems={menuItems}
        selectedKeys={selectedKeys}
        labels={labels}
        headerContent={headerContent}
        accountButton={accountButton}
        onMenuSelect={handleMenuSelect}
        onToggleCollapse={handleToggleCollapse}
        onCollapseChange={handleCollapseChange}
        onBreakpoint={handleBreakpoint}
        isMobile={isMobile}
        mobileMenuVisible={mobileMenuVisible}
        onCloseMobileMenu={handleCloseMobileMenu}
      >
        {children}
      </ShellView>
    </ShellHeaderProvider>
  )
}

ShellContainer.displayName = 'ShellContainer'

export { ShellContainer as Shell }
export default ShellContainer

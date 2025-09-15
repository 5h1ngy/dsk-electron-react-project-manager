import { MenuFoldOutlined, MenuUnfoldOutlined, PoweroffOutlined } from '@ant-design/icons'
import { Avatar, Button, Divider, Dropdown, Flex, Layout, Space, Typography } from 'antd'
import type { JSX } from 'react'

import { useHeaderStyles } from '@renderer/layout/Shell/components/Header/Header.hooks'
import type { HeaderProps } from '@renderer/layout/Shell/components/Header/Header.types'
import {
  getInitials,
  pickColor
} from '@renderer/layout/Shell/components/Header/UserIdentity.helpers'

const { Header: AntHeader } = Layout

const Header = ({
  collapsed,
  onToggleCollapse,
  expandLabel,
  collapseLabel,
  logoutLabel,
  onLogout,
  displayName,
  username,
  pageTitle
}: HeaderProps): JSX.Element => {
  const headerStyle = useHeaderStyles()
  const avatarColor = pickColor(displayName)

  const dropdownContent = (
    <div
      style={{
        padding: 16,
        width: 220
      }}
    >
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        <div>
          <Typography.Text strong style={{ display: 'block' }}>
            {displayName}
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {username}
          </Typography.Text>
        </div>
        <Divider style={{ margin: '8px 0' }} />
        <Button
          type="primary"
          danger
          icon={<PoweroffOutlined />}
          block
          onClick={onLogout}
        >
          {logoutLabel}
        </Button>
      </Space>
    </div>
  )

  return (
    <AntHeader style={headerStyle}>
      <Flex align="center" justify="space-between" gap={16} wrap style={{ width: '100%' }}>
        <Space align="center" size={14} style={{ minWidth: 160 }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            aria-label={collapsed ? expandLabel : collapseLabel}
            onClick={onToggleCollapse}
          />
          <Typography.Title level={4} style={{ margin: 0, fontWeight: 600 }}>
            {pageTitle || expandLabel}
          </Typography.Title>
        </Space>
        <div style={{ flex: 1 }} />
        <Dropdown
          trigger={["click"]}
          dropdownRender={() => dropdownContent}
          placement="bottomRight"
        >
          <Avatar
            style={{ backgroundColor: avatarColor, color: '#fff', cursor: 'pointer' }}
            size={40}
          >
            {getInitials(displayName)}
          </Avatar>
        </Dropdown>
      </Flex>
    </AntHeader>
  )
}

Header.displayName = 'Header'

export { Header }
export default Header

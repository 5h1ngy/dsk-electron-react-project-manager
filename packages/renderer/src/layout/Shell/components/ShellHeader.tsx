import { LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { Button, Flex, Layout, Space, Tag, Typography, theme } from 'antd'
import type { JSX } from 'react'

import { LanguageSwitcher } from '@renderer/components/LanguageSwitcher'
import { ThemeControls } from '@renderer/components/ThemeControls'

const { Header } = Layout

interface ShellHeaderProps {
  collapsed: boolean
  onToggleCollapse: () => void
  welcomeMessage?: string
  roles: Array<{ id: string; label: string }>
  accentColor: string
  onLogout: () => void
  logoutLabel: string
  expandLabel: string
  collapseLabel: string
}

export const ShellHeader = ({
  collapsed,
  onToggleCollapse,
  welcomeMessage,
  roles,
  accentColor,
  onLogout,
  logoutLabel,
  expandLabel,
  collapseLabel
}: ShellHeaderProps): JSX.Element => {
  const { token } = theme.useToken()

  return (
    <Header
      style={{
        background: token.colorBgElevated,
        borderBottom: `1px solid ${token.colorSplit}`,
        paddingInline: 24
      }}
    >
      <Flex align="center" justify="space-between" wrap gap={16} style={{ height: '100%' }}>
        <Flex align="center" gap={16}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            aria-label={collapsed ? expandLabel : collapseLabel}
            onClick={onToggleCollapse}
          />
          <Space direction="horizontal" size={0}>
            {!collapsed && (
              <>
                {roles.length > 0 && (
                  <Space size={4} wrap>
                    {roles.map((role) => (
                      <Tag key={role.id} color={accentColor}>
                        {role.label}
                      </Tag>
                    ))}
                  </Space>
                )}
                {welcomeMessage && (
                  <Typography.Text type="secondary">{welcomeMessage}</Typography.Text>
                )}
              </>
            )}
          </Space>
        </Flex>
        <Space size="middle" align="center">
          <LanguageSwitcher />
          <ThemeControls />
          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            onClick={onLogout}
            aria-label={logoutLabel}
          >
            {!collapsed && logoutLabel}
          </Button>
        </Space>
      </Flex>
    </Header>
  )
}

ShellHeader.displayName = 'ShellHeader'

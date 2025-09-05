import { LogoutOutlined } from '@ant-design/icons'
import { Button, Divider, Space, Tag, theme } from 'antd'
import type { JSX } from 'react'

import { UserIdentity } from './Header/UserIdentity'

interface ShellSiderFooterProps {
  displayName: string
  username: string
  roles: Array<{ id: string; label: string }>
  accentColor: string
  onLogout: () => void
  logoutLabel: string
}

export const ShellSiderFooter = ({
  displayName,
  username,
  roles,
  accentColor,
  onLogout,
  logoutLabel
}: ShellSiderFooterProps): JSX.Element => {
  const { token } = theme.useToken()

  return (
    <Space direction="vertical" size={12} style={{ width: '100%' }}>
      <UserIdentity displayName={displayName} username={username} />
      {roles.length > 0 && (
        <Space size={4} wrap>
          {roles.map((role) => (
            <Tag key={role.id} color={accentColor} bordered={false}>
              {role.label}
            </Tag>
          ))}
        </Space>
      )}
      <Divider style={{ margin: '12px 0', borderColor: token.colorSplit }} />
      <Button
        type="primary"
        danger
        icon={<LogoutOutlined />}
        block
        onClick={onLogout}
        aria-label={logoutLabel}
      >
        {logoutLabel}
      </Button>
    </Space>
  )
}

ShellSiderFooter.displayName = 'ShellSiderFooter'

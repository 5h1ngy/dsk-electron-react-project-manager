import { LogoutOutlined } from '@ant-design/icons'
import { Button, Divider, Space, Tag, theme } from 'antd'
import type { JSX } from 'react'

import { UserIdentity } from '@renderer/layout/Shell/components/Header/UserIdentity'
import type { SiderFooterProps } from '@renderer/layout/Shell/components/SiderFooter.types'

const SiderFooter = ({
  displayName,
  username,
  roles,
  accentColor,
  onLogout,
  logoutLabel
}: SiderFooterProps): JSX.Element => {
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

SiderFooter.displayName = 'SiderFooter'

export { SiderFooter }
export default SiderFooter

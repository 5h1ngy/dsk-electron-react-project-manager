import { Avatar, Space, Typography } from 'antd'
import type { JSX } from 'react'

import {
  getInitials,
  pickColor
} from '@renderer/layout/Shell/components/Header/UserIdentity.helpers'
import type { UserIdentityProps } from '@renderer/layout/Shell/components/Header/UserIdentity.types'

export const UserIdentity = ({ displayName, username }: UserIdentityProps): JSX.Element => (
  <Space direction="vertical" size={0}>
    <Space align="center" size={8}>
      <Avatar style={{ backgroundColor: pickColor(displayName), color: '#fff' }}>
        {getInitials(displayName)}
      </Avatar>
      <Typography.Text strong>{displayName}</Typography.Text>
    </Space>
    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
      {username}
    </Typography.Text>
  </Space>
)

UserIdentity.displayName = 'UserIdentity'


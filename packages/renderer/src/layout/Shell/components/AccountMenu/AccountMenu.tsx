import { PoweroffOutlined } from '@ant-design/icons'
import { Button, Card, Divider, Flex, Typography } from 'antd'
import type { JSX } from 'react'

import { useAccountMenuStyles } from '@renderer/layout/Shell/components/AccountMenu/AccountMenu.style'
import type { AccountMenuProps } from '@renderer/layout/Shell/components/AccountMenu/AccountMenu.types'

const AccountMenu = ({ displayName, username, onLogout, labels, width }: AccountMenuProps): JSX.Element => {
  const { sectionGap, headerGap, dividerStyle, cardProps } = useAccountMenuStyles({ width })

  return (
    <Card {...cardProps}>
      <Flex vertical gap={sectionGap}>
        <Flex vertical gap={headerGap}>
          <Typography.Text strong>{displayName}</Typography.Text>
          <Typography.Text type="secondary">{username}</Typography.Text>
        </Flex>
        <Divider style={dividerStyle} />
        <Button type="primary" danger icon={<PoweroffOutlined />} block onClick={onLogout}>
          {labels.logout}
        </Button>
      </Flex>
    </Card>
  )
}

AccountMenu.displayName = 'AccountMenu'

export { AccountMenu }
export default AccountMenu

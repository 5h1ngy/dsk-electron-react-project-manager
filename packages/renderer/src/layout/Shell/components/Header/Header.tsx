import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { Button, Flex, Layout, Space } from 'antd'
import type { JSX } from 'react'

import { LanguageSwitcher } from '@renderer/components/LanguageSwitcher'
import { ThemeControls } from '@renderer/components/ThemeControls'
import { useHeaderStyles } from '@renderer/layout/Shell/components/Header/Header.hooks'
import type { HeaderProps } from '@renderer/layout/Shell/components/Header/Header.types'

const { Header: AntHeader } = Layout

const Header = ({
  collapsed,
  onToggleCollapse,
  expandLabel,
  collapseLabel
}: HeaderProps): JSX.Element => {
  const headerStyle = useHeaderStyles()

  return (
    <AntHeader style={headerStyle}>
      <Flex align="center" justify="space-between" wrap gap={16} style={{ height: '100%' }}>
        <Flex align="center" gap={16}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            aria-label={collapsed ? expandLabel : collapseLabel}
            onClick={onToggleCollapse}
          />
        </Flex>
        <Space size="middle" align="center" wrap>
          <LanguageSwitcher />
          <ThemeControls />
        </Space>
      </Flex>
    </AntHeader>
  )
}

Header.displayName = 'Header'

export { Header }
export default Header

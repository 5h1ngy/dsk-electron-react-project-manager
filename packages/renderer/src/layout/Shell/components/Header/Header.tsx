import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { Button, Flex, Layout, Space } from 'antd'
import type { JSX } from 'react'

import { LanguageSwitcher } from '@renderer/components/LanguageSwitcher'
import { ThemeControls } from '@renderer/components/ThemeControls'
import { useShellHeaderStyles } from '@renderer/layout/Shell/components/Header/Header.hooks'
import type { ShellHeaderProps } from '@renderer/layout/Shell/components/Header/Header.types'

const { Header } = Layout

export const ShellHeader = ({
  collapsed,
  onToggleCollapse,
  expandLabel,
  collapseLabel
}: ShellHeaderProps): JSX.Element => {
  const headerStyle = useShellHeaderStyles()

  return (
    <Header style={headerStyle}>
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
    </Header>
  )
}

ShellHeader.displayName = 'ShellHeader'

export default ShellHeader

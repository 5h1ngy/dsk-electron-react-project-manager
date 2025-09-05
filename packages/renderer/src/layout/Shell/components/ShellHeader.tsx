import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { Button, Flex, Layout, Space, theme } from 'antd'
import type { JSX } from 'react'

import { LanguageSwitcher } from '@renderer/components/LanguageSwitcher'
import { ThemeControls } from '@renderer/components/ThemeControls'

const { Header } = Layout

interface ShellHeaderProps {
  collapsed: boolean
  onToggleCollapse: () => void
  expandLabel: string
  collapseLabel: string
}

export const ShellHeader = ({
  collapsed,
  onToggleCollapse,
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

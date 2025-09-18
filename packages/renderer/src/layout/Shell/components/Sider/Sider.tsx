import { Avatar, Flex, Layout, Menu, Typography, theme } from 'antd'
import type { JSX } from 'react'

import { useSiderStyles } from './Sider.style'
import type { SiderProps } from './Sider.types'

const { Sider: AntSider } = Layout

const Sider = ({
  collapsed,
  onCollapse,
  onBreakpoint,
  selectedKeys,
  items,
  themeMode,
  title,
  onSelect,
  footer
}: SiderProps): JSX.Element => {
  const { token } = theme.useToken()
  const { background, borderColor, accent, accentForeground, muted, text, shadow } =
    useSiderStyles(themeMode)
  const verticalPadding = collapsed ? token.paddingSM : token.paddingLG
  const horizontalPadding = collapsed ? token.paddingSM : token.paddingLG
  const containerPadding = `${verticalPadding}px ${horizontalPadding}px`
  const sectionGap = collapsed ? token.marginSM : token.marginMD
  const headerHeight = token.controlHeightLG
  const emblemSize = collapsed ? token.controlHeightSM : token.controlHeightLG
  const footerPadding = collapsed ? token.paddingSM : token.paddingLG
  const menuIndent = collapsed ? token.marginLG : token.marginXL
  const titleGap = collapsed ? 0 : token.marginXXS

  return (
    <AntSider
      width={228}
      collapsedWidth={72}
      breakpoint="lg"
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      onBreakpoint={onBreakpoint}
      trigger={null}
      theme={themeMode}
      style={{
        background,
        border: `${token.lineWidth}px solid ${borderColor}`,
        padding: containerPadding,
        borderRadius: token.borderRadiusLG,
        boxShadow: shadow,
        boxSizing: 'border-box'
      }}
    >
      <Flex vertical gap={sectionGap} style={{ height: '100%' }}>
        <Flex align="center" gap={collapsed ? 0 : token.marginSM} style={{ minHeight: headerHeight }}>
          <Avatar
            shape="square"
            size={emblemSize}
            style={{
              backgroundColor: accent,
              color: accentForeground,
              fontWeight: token.fontWeightStrong,
              fontSize: collapsed ? token.fontSize : token.fontSizeLG,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {title.slice(0, 1)}
          </Avatar>
          {!collapsed && (
            <Flex vertical gap={titleGap}>
              <Typography.Text strong style={{ color: text }}>
                {title}
              </Typography.Text>
              <Typography.Text type="secondary" style={{ color: muted }}>
                Workspace
              </Typography.Text>
            </Flex>
          )}
        </Flex>
        <Flex vertical flex={1} style={{ overflow: 'hidden' }}>
          <Menu
            mode="inline"
            theme={themeMode}
            items={items}
            selectedKeys={selectedKeys}
            onClick={onSelect}
            style={{
              borderInlineEnd: 'none',
              background: 'transparent',
              padding: 0,
              margin: 0,
              flex: 1,
              overflowY: 'auto'
            }}
            inlineCollapsed={collapsed}
            inlineIndent={menuIndent}
          />
        </Flex>
        {footer && (
          <Flex
            justify="center"
            style={{
              paddingBlock: `${footerPadding}px`,
              paddingInline: `${horizontalPadding}px`,
              borderBlockStart: `${token.lineWidth}px solid ${borderColor}`
            }}
          >
            {footer}
          </Flex>
        )}
      </Flex>
    </AntSider>
  )
}

Sider.displayName = 'Sider'

export { Sider }
export default Sider


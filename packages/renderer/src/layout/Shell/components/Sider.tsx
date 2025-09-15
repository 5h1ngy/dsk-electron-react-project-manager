import { Flex, Layout, Menu, Typography, theme } from 'antd'
import type { JSX } from 'react'

import { useSiderStyles } from '@renderer/layout/Shell/components/Sider.hooks'
import type { SiderProps } from '@renderer/layout/Shell/components/Sider.types'

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
  const { background, borderColor, accent, muted, text, shadow } = useSiderStyles(themeMode)
  const verticalPadding = collapsed ? token.paddingMD : token.paddingLG
  const horizontalPadding = collapsed ? token.paddingSM : token.paddingMD
  const containerPadding = `${verticalPadding}px ${horizontalPadding}px`
  const sectionGap = collapsed ? token.marginSM : token.marginMD
  const headerHeight = token.controlHeightLG
  const emblemSize = collapsed ? token.controlHeightSM : token.controlHeightLG - token.marginXS
  const emblemRadius = token.borderRadiusLG
  const footerPadding = collapsed ? token.paddingSM : token.paddingMD
  const menuPadding = collapsed ? 0 : token.paddingXS

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
        border: `1px solid ${borderColor}`,
        display: 'flex',
        flexDirection: 'column',
        padding: containerPadding,
        gap: sectionGap,
        borderRadius: token.borderRadiusLG,
        transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
        boxShadow: shadow,
        backdropFilter: themeMode === 'dark' ? 'blur(14px)' : undefined,
        minHeight: 0,
        height: '100%',
        flex: '0 0 auto',
        boxSizing: 'border-box'
      }}
    >
      <Flex
        align="center"
        justify="flex-start"
        gap={collapsed ? 0 : token.marginSM}
        style={{ minHeight: headerHeight, width: '100%' }}
      >
        <Flex align="center" gap={collapsed ? 0 : token.marginSM} style={{ flex: 1 }}>
          <div
            aria-hidden
            style={{
              width: emblemSize,
              height: emblemSize,
              borderRadius: emblemRadius,
              backgroundImage:
                themeMode === 'dark'
                  ? `linear-gradient(135deg, ${accent}, rgba(96, 165, 250, 0.75))`
                  : `linear-gradient(135deg, ${accent}, rgba(59, 130, 246, 0.65))`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: token.colorWhite,
              fontWeight: 700,
              fontSize: collapsed ? token.fontSize : token.fontSizeLG,
              letterSpacing: 0.5
            }}
          >
            {title.slice(0, 1)}
          </div>
          {!collapsed && (
            <Flex vertical gap={token.marginXXS}>
              <Typography.Text strong style={{ color: text }}>
                {title}
              </Typography.Text>
              <Typography.Text type="secondary" style={{ color: muted, fontSize: token.fontSizeSM }}>
                Workspace
              </Typography.Text>
            </Flex>
          )}
        </Flex>
      </Flex>
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          marginTop: token.marginSM,
          paddingInline: menuPadding
        }}
      >
        <Menu
          mode="inline"
          theme={themeMode}
          items={items}
          selectedKeys={selectedKeys}
          onClick={onSelect}
          style={{
            borderInlineEnd: 'none',
            background: 'transparent',
            paddingInline: 0,
            paddingBlock: collapsed ? 0 : token.paddingXS,
            ...(collapsed
              ? {}
              : {
                  display: 'flex',
                  flexDirection: 'column',
                  gap: token.marginXS
                })
          }}
          inlineCollapsed={collapsed}
          inlineIndent={collapsed ? token.marginMD : token.marginLG}
        />
      </div>
      {footer && (
        <div
          style={{
            padding: footerPadding,
            paddingTop: collapsed ? token.paddingSM : token.paddingMD,
            marginTop: 'auto',
            flexShrink: 0,
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            borderTop: `1px solid ${borderColor}`,
            background: themeMode === 'dark' ? token.colorBgElevated : token.colorBgContainer
          }}
        >
          {footer}
        </div>
      )}
    </AntSider>
  )
}

Sider.displayName = 'Sider'

export { Sider }
export default Sider

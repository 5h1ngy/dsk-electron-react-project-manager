import { Avatar, Flex, Layout, Menu, Typography, theme } from 'antd'
import type { MenuProps } from 'antd'
import { useMemo } from 'react'
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
  const menuIndent = collapsed ? 0 : token.marginXL
  const titleGap = collapsed ? 0 : token.marginXXS
  const menuItemStyle = useMemo(() => {
    const basePadding = collapsed ? token.paddingSM : token.paddingLG
    return {
      borderRadius: token.borderRadius,
      marginBlock: token.marginXXS,
      paddingInline: basePadding,
      paddingBlock: token.paddingXS,
      display: 'flex',
      alignItems: 'center',
      justifyContent: collapsed ? 'center' : 'flex-start',
      gap: collapsed ? 0 : token.marginSM
    }
  }, [
    collapsed,
    token.borderRadius,
    token.marginSM,
    token.marginXXS,
    token.paddingLG,
    token.paddingSM,
    token.paddingXS
  ])
  const menuItems = useMemo<MenuProps['items']>(() => {
    const decorate = (source?: MenuProps['items']): MenuProps['items'] | undefined => {
      if (!source) {
        return source
      }
      return source.map((item) => {
        if (!item || typeof item !== 'object' || Array.isArray(item)) {
          return item
        }
        if ('type' in item && item.type === 'divider') {
          return item
        }
        const childItems =
          'children' in item && Array.isArray(item.children)
            ? ((decorate(item.children) ?? []) as any)
            : undefined
        const iconNode = 'icon' in item ? item.icon : null
        const labelNode = 'label' in item ? item.label : null
        const ariaLabel =
          typeof labelNode === 'string' ? labelNode : undefined

        return {
          ...item,
          icon: undefined,
          title: undefined,
          style: {
            ...(item.style ?? {}),
            ...menuItemStyle
          },
          ...(childItems && childItems.length > 0 ? { children: childItems } : {}),
          label: (
            <Flex
              align="center"
              justify={collapsed ? 'center' : 'flex-start'}
              gap={collapsed ? 0 : token.marginSM}
              style={{ width: '100%', color: 'inherit' }}
              aria-label={ariaLabel}
            >
              {iconNode ? (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {iconNode}
                </span>
              ) : null}
              {!collapsed && labelNode ? (
                <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{labelNode}</span>
              ) : null}
            </Flex>
          )
        } as any
      }) as MenuProps['items']
    }

    return decorate(items)
  }, [collapsed, items, menuItemStyle, token.marginSM])

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
        <Flex
          align="center"
          justify={collapsed ? 'center' : 'flex-start'}
          gap={collapsed ? 0 : token.marginSM}
          style={{ minHeight: headerHeight }}
        >
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
            items={menuItems}
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
            inlineCollapsed={false}
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


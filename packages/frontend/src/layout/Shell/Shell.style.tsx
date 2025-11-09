import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import { theme } from 'antd'

import { resolveAccentForeground } from '@renderer/theme/foundations/brand'
import { resolvePalette } from '@renderer/theme/foundations/palette'
import { useThemeTokens } from '@renderer/theme/hooks/useThemeTokens'
import type { MenuTheme } from '@renderer/layout/Shell/Shell.types'

interface UseShellStylesParams {
  menuTheme: MenuTheme
  collapsed: boolean
  displayName: string
  isMobile: boolean
}

export interface ShellStyleResult {
  token: ReturnType<typeof theme.useToken>['token']
  spacing: ReturnType<typeof useThemeTokens>['spacing']
  layoutStyle: CSSProperties
  innerLayoutStyle: CSSProperties
  contentStyle: CSSProperties
  collapseButtonStyle: CSSProperties
  accountButtonStyle: CSSProperties
  accountAvatarStyle: CSSProperties
  accountAvatarSizes: {
    collapsed: number
    expanded: number
  }
  headerContainerStyle: CSSProperties
  dropdownWidth: number
  toolbarGap: number
  avatarColor: string
  avatarForeground: string
}

export const useShellStyles = ({
  menuTheme,
  collapsed,
  displayName,
  isMobile
}: UseShellStylesParams): ShellStyleResult => {
  const { token } = theme.useToken()
  const { spacing } = useThemeTokens()
  const spacingSm = spacing.sm
  const spacingLg = spacing.lg
  const spacingXl = spacing.xl

  const palette = useMemo(() => resolvePalette(menuTheme), [menuTheme])
  const avatarPalette = useMemo(
    () => [token.colorPrimary, token.colorSuccess, token.colorWarning, token.colorError],
    [token.colorError, token.colorPrimary, token.colorSuccess, token.colorWarning]
  )

  const avatarColor = useMemo(() => {
    const source = displayName ?? ''
    if (!source.trim()) {
      return avatarPalette[0]
    }
    const sum = [...source.trim()].reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return avatarPalette[sum % avatarPalette.length]
  }, [avatarPalette, displayName])

  const avatarForeground = useMemo(
    () => resolveAccentForeground(avatarColor, palette, menuTheme),
    [avatarColor, palette, menuTheme]
  )

  const layoutStyle: CSSProperties = useMemo(
    () => ({
      height: '100vh',
      padding: isMobile ? token.paddingXS : token.paddingSM,
      gap: isMobile ? spacingSm : spacingXl,
      background: token.colorBgLayout,
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: 'stretch',
      width: '100%',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }),
    [isMobile, spacingSm, spacingXl, token.colorBgLayout, token.paddingSM, token.paddingXS]
  )

  const innerLayoutStyle: CSSProperties = useMemo(
    () => ({
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minWidth: 0,
      background: 'transparent',
      overflow: 'hidden'
    }),
    []
  )

  const contentStyle: CSSProperties = useMemo(
    () => ({
      paddingInlineStart: isMobile ? token.paddingMD : token.paddingXL,
      paddingInlineEnd: isMobile ? token.paddingMD : token.paddingXL * 1.75,
      paddingBlock: isMobile ? token.paddingMD : token.paddingLG,
      display: 'flex',
      flexDirection: 'column',
      gap: spacingLg,
      minHeight: 0,
      background: 'transparent',
      flex: 1,
      height: '100%',
      overflow: 'hidden'
    }),
    [isMobile, spacingLg, token.paddingLG, token.paddingMD, token.paddingXL]
  )

  const collapseButtonStyle: CSSProperties = {
    borderRadius: token.borderRadiusLG,
    background: menuTheme === 'dark' ? token.colorFillSecondary : token.colorBgContainer,
    borderColor: token.colorBorderSecondary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: isMobile ? token.controlHeight : token.controlHeightLG,
    height: isMobile ? token.controlHeight : token.controlHeightLG
  }

  const accountButtonStyle: CSSProperties = {
    borderRadius: token.borderRadiusLG,
    display: 'flex',
    alignItems: 'center',
    justifyContent: collapsed ? 'center' : 'flex-start',
    gap: collapsed ? 0 : spacing.xs,
    paddingInline: collapsed ? 0 : token.paddingSM,
    height: token.controlHeightLG,
    background: menuTheme === 'dark' ? token.colorFillSecondary : token.colorBgContainer,
    borderColor: token.colorBorderSecondary
  }

  const accountAvatarStyle: CSSProperties = {
    backgroundColor: avatarColor,
    color: avatarForeground
  }

  const accountAvatarSizes = {
    collapsed: token.controlHeightSM,
    expanded: Math.max(token.controlHeightSM, token.controlHeight)
  }

  const headerContainerStyle: CSSProperties = {
    flex: 1,
    minHeight: token.controlHeightLG,
    width: isMobile ? '100%' : undefined
  }

  return {
    token,
    spacing,
    layoutStyle,
    innerLayoutStyle,
    contentStyle,
    collapseButtonStyle,
    accountButtonStyle,
    accountAvatarStyle,
    accountAvatarSizes,
    headerContainerStyle,
    dropdownWidth: token.controlHeightLG * 5,
    toolbarGap: spacing.sm,
    avatarColor,
    avatarForeground
  }
}

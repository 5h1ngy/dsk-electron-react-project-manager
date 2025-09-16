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
  headerContainerStyle: CSSProperties
  dropdownWidth: number
  toolbarGap: number
  avatarColor: string
  avatarForeground: string
}

export const useShellStyles = ({ menuTheme, collapsed, displayName }: UseShellStylesParams): ShellStyleResult => {
  const { token } = theme.useToken()
  const { spacing } = useThemeTokens()

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
    () => resolveAccentForeground(avatarColor, palette),
    [avatarColor, palette]
  )

  const layoutStyle: CSSProperties = {
    minHeight: '100vh',
    padding: token.paddingSM,
    gap: spacing.xl,
    background: token.colorBgLayout,
    display: 'flex',
    alignItems: 'stretch'
  }

  const innerLayoutStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
    background: 'transparent'
  }

  const contentStyle: CSSProperties = {
    paddingInline: token.paddingXL,
    paddingBlock: token.paddingLG,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.lg,
    minHeight: 0,
    background: 'transparent'
  }

  const collapseButtonStyle: CSSProperties = {
    borderRadius: token.borderRadiusLG,
    background: menuTheme === 'dark' ? token.colorFillSecondary : token.colorBgContainer,
    borderColor: token.colorBorderSecondary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
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

  const headerContainerStyle: CSSProperties = {
    flex: 1,
    minHeight: token.controlHeightLG
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
    headerContainerStyle,
    dropdownWidth: token.controlHeightLG * 5,
    toolbarGap: spacing.sm,
    avatarColor,
    avatarForeground
  }
}

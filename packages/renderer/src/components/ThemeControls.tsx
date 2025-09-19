import { BgColorsOutlined, BulbOutlined, MoonOutlined } from '@ant-design/icons'
import { Button, Card, Dropdown, Flex, Switch, Typography, theme } from 'antd'
import type { JSX } from 'react'
import { useCallback, useMemo } from 'react'

import { useThemeControls } from '@renderer/components/ThemeControls.hooks'
import type { ThemeControlsProps } from '@renderer/components/ThemeControls.types'
import { useThemeTokens } from '@renderer/theme/hooks/useThemeTokens'
import { resolvePalette } from '@renderer/theme/foundations/palette'
import { resolveAccentForeground } from '@renderer/theme/foundations/brand'

export const ThemeControls = ({ className }: ThemeControlsProps = {}): JSX.Element => {
  const { accentOptions, dropdownProps, mode, onAccentSelect, onToggleMode, t } =
    useThemeControls()
  const { token } = theme.useToken()
  const { spacing } = useThemeTokens()
  const palette = useMemo(() => resolvePalette(mode), [mode])

  const panelWidth = useMemo(
    () => token.controlHeightLG * 5,
    [token.controlHeightLG]
  )
  const sectionGap = spacing.md
  const accentGap = spacing.sm

  const popupRender = useCallback(() => {
    return (
      <Card
        size="small"
        variant="outlined"
        style={{ width: panelWidth, boxShadow: token.boxShadow }}
        onClick={(event) => event.stopPropagation()}
        bodyStyle={{ padding: token.paddingLG }}
      >
        <Flex vertical gap={sectionGap}>
          <Flex align="center" justify="space-between">
            <Typography.Text strong>{t('appShell.theme.mode')}</Typography.Text>
            <Switch
              checkedChildren={<MoonOutlined />}
              unCheckedChildren={<BulbOutlined />}
              checked={mode === 'dark'}
              onChange={onToggleMode}
              aria-label={t('theme.ariaLabel')}
            />
          </Flex>

          <Flex vertical gap={spacing.sm}>
            <Typography.Text strong>{t('appShell.theme.accent')}</Typography.Text>
            <Flex wrap gap={accentGap}>
              {accentOptions.map(({ color, isActive, ariaLabel }) => (
                <Button
                  key={color}
                  type="default"
                  shape="circle"
                  size="large"
                  style={{
                    backgroundColor: color,
                    borderColor: isActive ? token.colorBgContainer : 'transparent',
                    color: resolveAccentForeground(color, palette, mode),
                    boxShadow: isActive ? token.boxShadowSecondary : token.boxShadow,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={() => onAccentSelect(color)}
                  aria-label={ariaLabel}
                />
              ))}
            </Flex>
          </Flex>
        </Flex>
      </Card>
    )
  }, [
    accentOptions,
    mode,
    onAccentSelect,
    onToggleMode,
    palette,
    panelWidth,
    accentGap,
    sectionGap,
    t,
    token.boxShadow,
    token.boxShadowSecondary,
    token.colorBgContainer,
    token.paddingLG
  ])

  return (
    <Dropdown {...dropdownProps} popupRender={popupRender}>
      <Button
        className={className}
        aria-label={t('appShell.theme.title')}
        title={t('appShell.theme.title')}
        icon={<BgColorsOutlined />}
        type="primary"
        size="large"
        shape="round"
      >
        {t('appShell.theme.title')}
      </Button>
    </Dropdown>
  )
}

import { BgColorsOutlined, BulbOutlined, MoonOutlined } from '@ant-design/icons'
import { Button, Card, Dropdown, Space, Switch, Typography } from 'antd'
import type { CSSProperties, JSX } from 'react'
import { useCallback, useMemo } from 'react'

import { buildThemeButtonStyle } from '@renderer/components/ThemeControls.helpers'
import { useThemeControls } from '@renderer/components/ThemeControls.hooks'
import type { ThemeControlsProps } from '@renderer/components/ThemeControls.types'

export const ThemeControls = ({ className }: ThemeControlsProps = {}): JSX.Element => {
  const {
    accentColor,
    accentOptions,
    dropdownProps,
    iconColor,
    mode,
    onAccentSelect,
    onToggleMode,
    t
  } = useThemeControls()

  const popupRender = useCallback(() => {
    const cardStyle: CSSProperties = {
      width: 240,
      boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)'
    }

    return (
      <Card size="small" variant="outlined" style={cardStyle} onClick={(event) => event.stopPropagation()}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
            <Typography.Text strong>{t('appShell.theme.mode')}</Typography.Text>
            <Switch
              checkedChildren={<MoonOutlined />}
              unCheckedChildren={<BulbOutlined />}
              checked={mode === 'dark'}
              onChange={onToggleMode}
              aria-label={t('theme.ariaLabel')}
            />
          </Space>

          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Typography.Text strong>{t('appShell.theme.accent')}</Typography.Text>
            <Space wrap size={12}>
              {accentOptions.map(({ color, isActive, ariaLabel }) => (
                <Button
                  key={color}
                  type="default"
                  style={{
                    width: 40,
                    height: 40,
                    minWidth: 40,
                    padding: 0,
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: color,
                    borderColor: isActive ? '#ffffff' : 'transparent',
                    boxShadow: isActive
                      ? `0 0 0 3px rgba(255, 255, 255, 0.45)`
                      : '0 4px 12px rgba(15, 23, 42, 0.18)'
                  }}
                  onClick={() => onAccentSelect(color)}
                  aria-label={ariaLabel}
                />
              ))}
            </Space>
          </Space>
        </Space>
      </Card>
    )
  }, [accentOptions, mode, onAccentSelect, onToggleMode, t])

  const buttonStyle = useMemo(
    () => buildThemeButtonStyle({ accentColor, iconColor }),
    [accentColor, iconColor]
  )

  return (
    <Dropdown {...dropdownProps} popupRender={popupRender}>
      <Button
        className={className}
        aria-label={t('appShell.theme.title')}
        title={t('appShell.theme.title')}
        icon={<BgColorsOutlined />}
        style={buttonStyle}
      >
        {t('appShell.theme.title')}
      </Button>
    </Dropdown>
  )
}

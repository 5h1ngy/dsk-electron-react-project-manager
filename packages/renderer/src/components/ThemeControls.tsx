import { BgColorsOutlined, BulbOutlined, MoonOutlined } from '@ant-design/icons'
import { Button, Card, Dropdown, Space, Switch, Typography } from 'antd'
import type { DropdownProps } from 'antd'
import { useCallback, useMemo, useState, type JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import {
  selectAccentColor,
  selectThemeMode,
  setAccentColor,
  setMode
} from '@renderer/store/slices/theme'

export const ACCENT_COLORS = [
  '#00F5D4',
  '#00D4FF',
  '#5BFF70',
  '#FF00C8',
  '#FFB400',
  '#C0FF00'
] as const

export const ThemeControls = (): JSX.Element => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const mode = useAppSelector(selectThemeMode)
  const accentColor = useAppSelector(selectAccentColor)
  const [open, setOpen] = useState(false)
  const iconColor = useMemo(() => {
    const hex = accentColor.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness > 140 ? '#0f172a' : '#ffffff'
  }, [accentColor])

  const handleToggleMode = useCallback(
    (checked: boolean) => {
      dispatch(setMode(checked ? 'dark' : 'light'))
    },
    [dispatch]
  )

  const handleAccentSelect = useCallback(
    (color: string) => {
      dispatch(setAccentColor(color))
      setOpen(false)
    },
    [dispatch]
  )

  const dropdownRender: DropdownProps['dropdownRender'] = useCallback(() => {
    const cardStyle: React.CSSProperties = {
      width: 240,
      boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)'
    }

    return (
      <Card size="small" bordered style={cardStyle} onClick={(event) => event.stopPropagation()}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
            <Typography.Text strong>{t('appShell.theme.mode')}</Typography.Text>
            <Switch
              checkedChildren={<MoonOutlined />}
              unCheckedChildren={<BulbOutlined />}
              checked={mode === 'dark'}
              onChange={handleToggleMode}
              aria-label={t('theme.ariaLabel')}
            />
          </Space>

          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Typography.Text strong>{t('appShell.theme.accent')}</Typography.Text>
            <Space wrap size="small">
              {ACCENT_COLORS.map((color, index) => {
                const isActive = color === accentColor
                return (
                  <Button
                    key={color}
                    shape="circle"
                    size="small"
                    style={{
                      width: 28,
                      height: 28,
                      backgroundColor: color,
                      borderColor: isActive ? '#ffffff' : color,
                      boxShadow: isActive ? `0 0 0 2px rgba(0, 0, 0, 0.2)` : undefined
                    }}
                    onClick={() => handleAccentSelect(color)}
                    aria-label={t('appShell.accent.option', { index: index + 1 })}
                  />
                )
              })}
            </Space>
          </Space>
        </Space>
      </Card>
    )
  }, [accentColor, handleAccentSelect, handleToggleMode, mode, t])

  const dropdownProps: DropdownProps = useMemo(
    () => ({
      trigger: ['click'],
      placement: 'bottomRight',
      arrow: true,
      open,
      onOpenChange: setOpen,
      dropdownRender
    }),
    [dropdownRender, open]
  )

  return (
    <Dropdown {...dropdownProps}>
      <Button
        shape="circle"
        aria-label={t('appShell.theme.title')}
        title={t('appShell.theme.title')}
        icon={<BgColorsOutlined />}
        style={{
          width: 36,
          height: 36,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: accentColor,
          borderColor: accentColor,
          color: iconColor
        }}
      />
    </Dropdown>
  )
}

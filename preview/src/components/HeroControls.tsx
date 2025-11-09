import { BulbOutlined, MoonOutlined } from '@ant-design/icons'
import { Button, Flex, Space, theme } from 'antd'
import type { ReactElement } from 'react'

import { ACCENT_OPTIONS } from '../theme'
import { useSurfacePalette } from '../hooks/useSurfacePalette'
import type { ControlCopy } from '../types/content'
import type { ThemeMode } from '../theme/foundations/palette'

interface HeroControlsProps {
  accent: string
  setAccent: (value: string) => void
  mode: ThemeMode
  onModeChange: (value: ThemeMode) => void
  controlsCopy: ControlCopy
}

export const HeroControls = ({
  accent,
  setAccent,
  mode,
  onModeChange,
  controlsCopy
}: HeroControlsProps): ReactElement => {
  const { token } = theme.useToken()
  const surfaces = useSurfacePalette(mode, accent)
  const controlDiameter = token.controlHeightSM
  const accentDotSize = Math.max(12, controlDiameter - token.paddingMD)
  const iconSize = token.fontSizeHeading4

  const buildCircleButtonStyle = (selected: boolean, colorOverride?: string) => ({
    width: controlDiameter,
    height: controlDiameter,
    borderRadius: controlDiameter,
    border: `1px solid ${selected ? accent : surfaces.pillBorder}`,
    background: selected ? (colorOverride ?? accent) : surfaces.pillBackground,
    color: selected ? token.colorTextLightSolid ?? '#fff' : token.colorTextBase,
    boxShadow: surfaces.pillShadow,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: iconSize
  })

  return (
    <Flex gap={token.margin} align="center" wrap>
      <Space size={token.marginSM}>
        {[
          { value: 'light' as ThemeMode, icon: <BulbOutlined /> },
          { value: 'dark' as ThemeMode, icon: <MoonOutlined /> }
        ].map((option) => {
          const selected = option.value === mode
          return (
            <Button
              key={option.value}
              type="text"
              shape="circle"
              aria-label={`${controlsCopy.displayLabel} ${option.value}`}
              aria-pressed={selected}
              style={buildCircleButtonStyle(selected)}
              onClick={() => {
                if (!selected) {
                  onModeChange(option.value)
                }
              }}
              icon={option.icon}
            />
          )
        })}
      </Space>
      <Space size={token.marginSM}>
        {ACCENT_OPTIONS.map((value) => {
          const selected = value === accent
          return (
            <Button
              key={value}
              type="text"
              shape="circle"
              aria-label={`${controlsCopy.accentLabel} ${value}`}
              aria-pressed={selected}
              style={{
                width: controlDiameter,
                height: controlDiameter,
                borderRadius: controlDiameter,
                border: `1px solid ${selected ? token.colorTextLightSolid ?? '#fff' : surfaces.pillBorder}`,
                background: surfaces.pillBackground,
                padding: token.paddingXXS,
                boxShadow: surfaces.pillShadow,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => {
                if (!selected) {
                  setAccent(value)
                }
              }}
              >
                <span
                  style={{
                  width: accentDotSize,
                  height: accentDotSize,
                  borderRadius: '50%',
                  background: value,
                  border: `1px solid ${token.colorBorderSecondary}`
                }}
              />
            </Button>
          )
        })}
      </Space>
    </Flex>
  )
}

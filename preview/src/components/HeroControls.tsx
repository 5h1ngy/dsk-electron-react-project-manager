import { BulbOutlined, MoonOutlined } from '@ant-design/icons'
import { Avatar, Flex, Segmented, theme } from 'antd'
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
  const controlHeight = token.controlHeightLG
  const controlPaddingY = token.paddingXXS
  const controlPaddingX = token.paddingSM
  const swatchSize = token.controlHeightSM - token.padding
  const iconSize = token.fontSizeHeading4

  const pillStyle = {
    borderRadius: token.borderRadiusOuter * 2,
    padding: `${controlPaddingY}px ${controlPaddingX}px`,
    background: surfaces.pillBackground,
    border: `1px solid ${surfaces.pillBorder}`,
    boxShadow: surfaces.pillShadow
  }

  return (
    <Flex gap={token.margin} align="center">
      <Segmented
        value={mode}
        size="large"
        aria-label={controlsCopy.displayLabel}
        style={{ ...pillStyle, height: controlHeight, display: 'flex', alignItems: 'center' }}
        options={[
          { value: 'light', label: <BulbOutlined style={{ fontSize: iconSize }} /> },
          { value: 'dark', label: <MoonOutlined style={{ fontSize: iconSize }} /> }
        ]}
        onChange={(value) => {
          const next = value as ThemeMode
          if (next !== mode) {
            onModeChange(next)
          }
        }}
      />
      <Segmented
        value={accent}
        aria-label={controlsCopy.accentLabel}
        style={{ ...pillStyle, height: controlHeight, display: 'flex', alignItems: 'center' }}
        options={ACCENT_OPTIONS.map((value) => ({
          value,
          label: (
            <Avatar
              size={swatchSize}
              style={{
                background: value,
                border: `1px solid ${mode === 'dark' ? token.colorBorder : token.colorBorderSecondary}`
              }}
            />
          )
        }))}
        onChange={(value) => setAccent(value as string)}
      />
    </Flex>
  )
}

import { BulbOutlined, MoonOutlined } from '@ant-design/icons'
import { Avatar, Flex, Segmented, theme } from 'antd'
import type { ReactElement } from 'react'

import { ACCENT_OPTIONS } from '../theme'
import type { ControlCopy } from '../types/content'
import type { ThemeMode } from '../theme/foundations/palette'
import { darken, lighten } from '../theme/utils'

interface HeroControlsProps {
  accent: string
  setAccent: (value: string) => void
  mode: ThemeMode
  toggleMode: () => void
  controlsCopy: ControlCopy
}

export const HeroControls = ({
  accent,
  setAccent,
  mode,
  toggleMode,
  controlsCopy
}: HeroControlsProps): ReactElement => {
  const { token } = theme.useToken()
  const controlHeight = token.controlHeightLG
  const controlPaddingY = token.paddingXXS
  const controlPaddingX = token.paddingSM
  const pillBackground =
    mode === 'dark'
      ? darken(token.colorBgElevated, 0.05)
      : lighten(token.colorBgElevated, 0.06)
  const pillBorder = mode === 'dark' ? token.colorBorder : token.colorBorderSecondary
  const pillShadow = mode === 'dark' ? token.boxShadowSecondary : token.boxShadow
  const swatchSize = token.controlHeightSM - token.padding
  const iconSize = token.fontSizeHeading4

  const pillStyle = {
    borderRadius: token.borderRadiusOuter * 2,
    padding: `${controlPaddingY}px ${controlPaddingX}px`,
    background: pillBackground,
    border: `1px solid ${pillBorder}`,
    boxShadow: pillShadow
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
          if (value !== mode) {
            toggleMode()
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

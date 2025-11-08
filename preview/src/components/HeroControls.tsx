import { BulbOutlined, MoonOutlined } from '@ant-design/icons'
import { Avatar, Flex, Segmented, theme } from 'antd'
import type { ReactElement } from 'react'

import { ACCENT_OPTIONS } from '../theme'
import type { ControlCopy } from '../types/content'
import type { ThemeMode } from '../theme/foundations/palette'

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

  const pillStyle = {
    borderRadius: 999,
    padding: '4px 6px',
    background: mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.08)',
    border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(15,23,42,0.18)'}`,
    boxShadow: mode === 'dark' ? '0 12px 32px rgba(0,0,0,0.35)' : '0 12px 32px rgba(15,23,42,0.2)'
  }

  return (
    <Flex gap={token.margin} align="center">
      <Segmented
        value={mode}
        size="large"
        aria-label={controlsCopy.displayLabel}
        style={{ ...pillStyle, height: 48, display: 'flex', alignItems: 'center' }}
        options={[
          { value: 'light', label: <BulbOutlined style={{ fontSize: 18 }} /> },
          { value: 'dark', label: <MoonOutlined style={{ fontSize: 18 }} /> }
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
        style={{ ...pillStyle, height: 48, display: 'flex', alignItems: 'center' }}
        options={ACCENT_OPTIONS.map((value) => ({
          value,
          label: (
            <Avatar
              size={22}
              style={{
                background: value,
                border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(15,23,42,0.2)'}`
              }}
            />
          )
        }))}
        onChange={(value) => setAccent(value as string)}
      />
    </Flex>
  )
}

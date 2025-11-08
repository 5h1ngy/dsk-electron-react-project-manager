/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Avatar, Flex, Segmented, Switch, Typography, theme } from 'antd'
import { BulbOutlined, MoonOutlined } from '@ant-design/icons'
import type { ThemeMode } from '../theme/foundations/palette'
import { ACCENT_OPTIONS } from '../theme'

interface HeroControlsProps {
  accent: string
  setAccent: (value: string) => void
  mode: ThemeMode
  toggleMode: () => void
}

export const HeroControls = ({ accent, setAccent, mode, toggleMode }: HeroControlsProps) => {
  const { token } = theme.useToken()

  return (
    <Flex align="center" justify="flex-end" gap="middle" wrap style={{ width: '100%' }}>
      <Typography.Text style={{ color: token.colorTextSecondary, fontWeight: 600 }}>
        Display
      </Typography.Text>
      <Switch
        checkedChildren={<MoonOutlined />}
        unCheckedChildren={<BulbOutlined />}
        checked={mode === 'dark'}
        onChange={toggleMode}
        aria-label="Toggle theme mode"
      />
      <Segmented
        value={accent}
        options={ACCENT_OPTIONS.map((value) => ({
          value,
          label: (
            <Avatar
              size={22}
              style={{
                background: value,
                border: `1px solid ${token.colorBorderSecondary}`
              }}
            />
          )
        }))}
        onChange={(value) => setAccent(value as string)}
        aria-label="Select accent color"
      />
    </Flex>
  )
}

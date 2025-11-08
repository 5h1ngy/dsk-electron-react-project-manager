import { Avatar, Flex, Segmented, Select, Switch, Typography, theme } from 'antd'
import { BulbOutlined, MoonOutlined } from '@ant-design/icons'
import type { ReactElement } from 'react'
import type { ThemeMode } from '../theme/foundations/palette'
import { ACCENT_OPTIONS } from '../theme'
import type { ControlCopy, LanguageOption } from '../types/content'
import type { SupportedLanguage } from '../i18n/language'

interface HeroControlsProps {
  accent: string
  setAccent: (value: string) => void
  mode: ThemeMode
  toggleMode: () => void
  controlsCopy: ControlCopy
  language: SupportedLanguage
  languageOptions: LanguageOption[]
  onLanguageChange: (value: SupportedLanguage) => void
}

export const HeroControls = ({
  accent,
  setAccent,
  mode,
  toggleMode,
  controlsCopy,
  language,
  languageOptions,
  onLanguageChange
}: HeroControlsProps): ReactElement => {
  const { token } = theme.useToken()

  return (
    <Flex align="center" justify="flex-end" gap="middle" wrap style={{ width: '100%' }}>
      <Flex align="center" gap="small">
        <Typography.Text style={{ color: token.colorTextSecondary, fontWeight: 600 }}>
          {controlsCopy.displayLabel}
        </Typography.Text>
        <Switch
          checkedChildren={<MoonOutlined />}
          unCheckedChildren={<BulbOutlined />}
          checked={mode === 'dark'}
          onChange={toggleMode}
          aria-label={controlsCopy.displayLabel}
        />
      </Flex>
      <Flex align="center" gap="small">
        <Typography.Text style={{ color: token.colorTextSecondary, fontWeight: 600 }}>
          {controlsCopy.accentLabel}
        </Typography.Text>
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
          aria-label={controlsCopy.accentLabel}
        />
      </Flex>
      <Flex align="center" gap="small">
        <Typography.Text style={{ color: token.colorTextSecondary, fontWeight: 600 }}>
          {controlsCopy.languageLabel}
        </Typography.Text>
        <Select
          value={language}
          options={languageOptions.map((option) => ({
            value: option.value,
            label: option.label
          }))}
          onChange={(value) => onLanguageChange(value as SupportedLanguage)}
          style={{ minWidth: 150 }}
          aria-label={controlsCopy.languageLabel}
        />
      </Flex>
    </Flex>
  )
}

import { BulbOutlined, MoonOutlined } from '@ant-design/icons'
import { Avatar, Button, Dropdown, Flex, Segmented, Typography, theme } from 'antd'
import type { MenuProps } from 'antd'
import type { ReactElement } from 'react'
import { useMemo, useState } from 'react'

import type { SupportedLanguage } from '../i18n/language'
import { ACCENT_OPTIONS } from '../theme'
import type { ControlCopy, LanguageOption } from '../types/content'
import type { ThemeMode } from '../theme/foundations/palette'

const FLAG_MAP: Record<SupportedLanguage, string> = {
  en: '🇬🇧',
  it: '🇮🇹'
}

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
  const [languageHover, setLanguageHover] = useState(false)
  const [languageOpen, setLanguageOpen] = useState(false)

  const languageMenu: MenuProps['items'] = useMemo(
    () =>
      languageOptions.map((option) => ({
        key: option.value,
        label: (
          <Flex align="center" gap={token.marginXS}>
            <span style={{ fontSize: 18 }}>{FLAG_MAP[option.value]}</span>
            <Typography.Text style={{ fontSize: 14 }}>{option.label}</Typography.Text>
          </Flex>
        )
      })),
    [languageOptions, token.marginXS]
  )

  const showLanguageHighlight = languageHover || languageOpen
  const modeOptions = [
    { value: 'light', label: <BulbOutlined /> },
    { value: 'dark', label: <MoonOutlined /> }
  ]

  const pillStyle = {
    borderRadius: 999,
    padding: '4px 8px',
    background: mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.08)',
    border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(15,23,42,0.15)'}`,
    boxShadow: mode === 'dark' ? '0 10px 30px rgba(0,0,0,0.35)' : '0 10px 30px rgba(15,23,42,0.15)'
  }

  return (
    <Flex
      align="center"
      gap={token.margin}
      wrap={false}
      style={{
        background: mode === 'dark' ? 'rgba(4,6,18,0.75)' : 'rgba(255,255,255,0.75)',
        borderRadius: 999,
        padding: '10px 16px',
        border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.12)'}`,
        backdropFilter: 'blur(12px)',
        boxShadow: mode === 'dark' ? '0 25px 60px rgba(0,0,0,0.35)' : '0 15px 40px rgba(15,23,42,0.2)'
      }}
    >
      <Segmented
        value={mode}
        options={modeOptions}
        onChange={(value) => {
          if (value !== mode) {
            toggleMode()
          }
        }}
        aria-label={controlsCopy.displayLabel}
        size="large"
        style={pillStyle}
      />
      <Segmented
        value={accent}
        options={ACCENT_OPTIONS.map((value) => ({
          value,
          label: (
            <Avatar
              size={20}
              style={{
                background: value,
                border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.2)'}`
              }}
            />
          )
        }))}
        onChange={(value) => setAccent(value as string)}
        aria-label={controlsCopy.accentLabel}
        style={pillStyle}
      />
      <Dropdown
        trigger={['click']}
        placement="topRight"
        onOpenChange={(open) => setLanguageOpen(open)}
        menu={{
          items: languageMenu,
          selectable: true,
          selectedKeys: [language],
          onClick: ({ key }) => onLanguageChange(key as SupportedLanguage)
        }}
      >
        <Button
          type="text"
          aria-label={controlsCopy.languageLabel}
          onMouseEnter={() => setLanguageHover(true)}
          onMouseLeave={() => setLanguageHover(false)}
          style={{
            borderRadius: 999,
            width: 44,
            height: 44,
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: showLanguageHighlight
              ? `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(15,23,42,0.35)'}`
              : '1px solid transparent',
            background: showLanguageHighlight
              ? mode === 'dark'
                ? 'rgba(255,255,255,0.08)'
                : 'rgba(15,23,42,0.08)'
              : 'transparent',
            transition: 'all 0.3s ease'
          }}
        >
          <span style={{ fontSize: 20, lineHeight: 1 }}>{FLAG_MAP[language]}</span>
        </Button>
      </Dropdown>
    </Flex>
  )
}

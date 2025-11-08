import { Dropdown, Flex, Typography, theme, Button } from 'antd'
import type { MenuProps } from 'antd'
import ReactCountryFlag from 'react-country-flag'
import { useMemo, useState, type ReactElement } from 'react'

import type { SupportedLanguage } from '../i18n/language'
import type { LanguageOption } from '../types/content'

const FLAG_CODE: Record<SupportedLanguage, string> = {
  en: 'GB',
  it: 'IT'
}

interface LanguageSwitcherProps {
  language: SupportedLanguage
  options: LanguageOption[]
  label: string
  onChange: (value: SupportedLanguage) => void
}

export const LanguageSwitcher = ({
  language,
  options,
  label,
  onChange
}: LanguageSwitcherProps): ReactElement => {
  const { token } = theme.useToken()
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)

  const menuItems: MenuProps['items'] = useMemo(
    () =>
      options.map((option) => ({
        key: option.value,
        label: (
          <Flex align="center" gap={token.marginXS}>
            <ReactCountryFlag svg countryCode={FLAG_CODE[option.value]} style={{ fontSize: 20 }} />
            <Typography.Text style={{ fontSize: 14 }}>{option.label}</Typography.Text>
          </Flex>
        )
      })),
    [options, token.marginXS]
  )

  const highlight = open || hovered

  return (
    <Dropdown
      placement="bottomRight"
      trigger={['click']}
      open={open}
      onOpenChange={(next) => setOpen(next)}
      menu={{
        items: menuItems,
        selectable: true,
        selectedKeys: [language],
        onClick: ({ key }) => onChange(key as SupportedLanguage)
      }}
    >
      <Button
        type="text"
        aria-label={label}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: 48,
          height: 48,
          borderRadius: 999,
          border: highlight
            ? `1px solid ${token.colorPrimaryBorder}`
            : '1px solid transparent',
          background: highlight ? token.colorBgElevated : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.25s ease',
          padding: 0,
          boxShadow: highlight ? token.boxShadow : 'none'
        }}
      >
        <ReactCountryFlag svg countryCode={FLAG_CODE[language]} style={{ fontSize: 22 }} />
      </Button>
    </Dropdown>
  )
}

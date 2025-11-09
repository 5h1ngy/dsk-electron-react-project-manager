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
  const controlSize = token.controlHeightLG
  const indicatorFontSize = token.fontSizeHeading3
  const optionFontSize = token.fontSize

  const menuItems: MenuProps['items'] = useMemo(
    () =>
      options.map((option) => ({
        key: option.value,
        label: (
          <Flex align="center" gap={token.marginXS}>
            <ReactCountryFlag
              svg
              countryCode={FLAG_CODE[option.value]}
              style={{ fontSize: indicatorFontSize }}
            />
            <Typography.Text style={{ fontSize: optionFontSize }}>{option.label}</Typography.Text>
          </Flex>
        )
      })),
    [options, indicatorFontSize, optionFontSize, token.marginXS]
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
          width: controlSize,
          height: controlSize,
          borderRadius: token.borderRadiusOuter * 2,
          border: `1px solid ${highlight ? token.colorPrimaryBorder : 'transparent'}`,
          background: highlight ? token.colorBgElevated : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.25s ease',
          padding: 0,
          boxShadow: highlight ? token.boxShadow : 'none'
        }}
      >
        <ReactCountryFlag
          svg
          countryCode={FLAG_CODE[language]}
          style={{ fontSize: indicatorFontSize }}
        />
      </Button>
    </Dropdown>
  )
}

import { Select } from 'antd'
import type { JSX } from 'react'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import {
  changeLocale,
  selectLocale,
  selectSupportedLocales,
  type SupportedLocale
} from '@renderer/store/slices/locale'

const FLAG_BY_LOCALE: Record<SupportedLocale, string> = {
  en: '\u{1F1EC}\u{1F1E7}',
  it: '\u{1F1EE}\u{1F1F9}',
  de: '\u{1F1E9}\u{1F1EA}',
  fr: '\u{1F1EB}\u{1F1F7}'
}

export const LanguageSwitcher = (): JSX.Element => {
  const dispatch = useAppDispatch()
  const locale = useAppSelector(selectLocale)
  const supportedLocales = selectSupportedLocales()
  const { t } = useTranslation()

  const options = useMemo(
    () =>
      supportedLocales.map((value) => ({
        value,
        label: (
          <span role="img" aria-label={t(`language.options.${value}`)} style={{ fontSize: 18 }}>
            {FLAG_BY_LOCALE[value]}
          </span>
        ),
        title: t(`language.options.${value}`)
      })),
    [supportedLocales, t]
  )

  const handleChange = useCallback(
    (value: SupportedLocale) => {
      dispatch(changeLocale(value))
    },
    [dispatch]
  )

  return (
    <Select
      size="small"
      value={locale}
      onChange={handleChange}
      options={options}
      aria-label={t('language.ariaLabel')}
      popupMatchSelectWidth={false}
      style={{ minWidth: 72 }}
      optionLabelProp="title"
    />
  )
}

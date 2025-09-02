import { Select } from 'antd'
import type { JSX } from 'react'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import {
  supportedLocaleOptions,
  type SupportedLocale,
  useLocaleStore
} from '@renderer/store/localeStore'

export const LanguageSwitcher = (): JSX.Element => {
  const locale = useLocaleStore((state) => state.locale)
  const setLocale = useLocaleStore((state) => state.setLocale)
  const { t } = useTranslation()

  const options = useMemo(
    () =>
      supportedLocaleOptions.map((value) => ({
        value,
        label: t(`language.options.${value}`)
      })),
    [t]
  )

  const handleChange = useCallback(
    (value: SupportedLocale) => {
      setLocale(value)
    },
    [setLocale]
  )

  return (
    <Select
      size="small"
      value={locale}
      onChange={handleChange}
      options={options}
      aria-label={t('language.ariaLabel')}
      dropdownMatchSelectWidth={false}
      style={{ minWidth: 140 }}
    />
  )
}
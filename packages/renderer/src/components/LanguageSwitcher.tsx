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
} from '@renderer/store/slices/localeSlice'

export const LanguageSwitcher = (): JSX.Element => {
  const dispatch = useAppDispatch()
  const locale = useAppSelector(selectLocale)
  const supportedLocales = selectSupportedLocales()
  const { t } = useTranslation()

  const options = useMemo(
    () =>
      supportedLocales.map((value) => ({
        value,
        label: t(`language.options.${value}`)
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
      style={{ minWidth: 140 }}
    />
  )
}

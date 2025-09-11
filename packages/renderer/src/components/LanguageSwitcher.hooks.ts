import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import {
  changeLocale,
  selectLocale,
  selectSupportedLocales,
  type SupportedLocale
} from '@renderer/store/slices/locale'
import type { LanguageOption, UseLanguageSwitcherResult } from '@renderer/components/LanguageSwitcher.types'
import { getLocaleFlag } from '@renderer/components/LanguageSwitcher.helpers'

export const useLanguageSwitcher = (): UseLanguageSwitcherResult => {
  const dispatch = useAppDispatch()
  const locale = useAppSelector(selectLocale)
  const supportedLocales = selectSupportedLocales()
  const { t } = useTranslation()

  const options = useMemo<LanguageOption[]>(
    () =>
      supportedLocales.map((value) => ({
        value,
        label: (
          <span role="img" aria-label={t(`language.options.${value}`)} style={{ fontSize: 18 }}>
            {getLocaleFlag(value)}
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

  return {
    locale,
    options,
    ariaLabel: t('language.ariaLabel'),
    handleChange,
    defaultSize: 'small'
  }
}


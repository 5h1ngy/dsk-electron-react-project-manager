import type { SelectProps } from 'antd'
import type { ReactNode } from 'react'

import type { SupportedLocale } from '@renderer/store/slices/locale'

export interface LanguageSwitcherProps {
  className?: string
  size?: SelectProps<SupportedLocale>['size']
}

export interface LanguageOption {
  value: SupportedLocale
  label: ReactNode
  title: string
}

export interface UseLanguageSwitcherResult {
  locale: SupportedLocale
  options: LanguageOption[]
  ariaLabel: string
  handleChange: (locale: SupportedLocale) => void
  defaultSize: SelectProps<SupportedLocale>['size']
}


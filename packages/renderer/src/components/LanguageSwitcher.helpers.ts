import type { SupportedLocale } from '@renderer/store/slices/locale'

const FLAG_BY_LOCALE: Record<SupportedLocale, string> = {
  en: '\u{1F1EC}\u{1F1E7}',
  it: '\u{1F1EE}\u{1F1F9}',
  de: '\u{1F1E9}\u{1F1EA}',
  fr: '\u{1F1EB}\u{1F1F7}'
}

export const getLocaleFlag = (locale: SupportedLocale): string => FLAG_BY_LOCALE[locale]

export const LANGUAGE_SELECT_STYLE = {
  minWidth: 72
} as const

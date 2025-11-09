export const SUPPORTED_LANGUAGES = ['en', 'it'] as const

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en'

export const FALLBACK_LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: 'English',
  it: 'Italiano'
}

export const isSupportedLanguage = (value?: string | null): value is SupportedLanguage =>
  Boolean(value && SUPPORTED_LANGUAGES.includes(value as SupportedLanguage))

export const getLanguageFromUrl = (): SupportedLanguage | null => {
  if (typeof window === 'undefined') {
    return null
  }
  const params = new URLSearchParams(window.location.search)
  const lang = params.get('lang')
  return isSupportedLanguage(lang) ? (lang as SupportedLanguage) : null
}

const getLanguageFromNavigator = (): SupportedLanguage | null => {
  if (typeof navigator === 'undefined') {
    return null
  }
  const locale = navigator.language?.split('-')[0]
  return isSupportedLanguage(locale) ? (locale as SupportedLanguage) : null
}

export const resolveInitialLanguage = (preferred?: string | null): SupportedLanguage => {
  return (
    getLanguageFromUrl() ??
    (preferred && isSupportedLanguage(preferred) ? (preferred as SupportedLanguage) : null) ??
    getLanguageFromNavigator() ??
    DEFAULT_LANGUAGE
  )
}

export const syncLanguageQueryParam = (language: SupportedLanguage): void => {
  if (typeof window === 'undefined') {
    return
  }
  const params = new URLSearchParams(window.location.search)
  params.set('lang', language)
  const query = params.toString()
  const newUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
  window.history.replaceState({}, '', newUrl)
}

import type { RootState } from '../../types'
import { SUPPORTED_LOCALES } from './constants'
import type { SupportedLocale } from './types'

export const selectLocale = (state: RootState) => state.locale.locale
export const selectSupportedLocales = (): readonly SupportedLocale[] => SUPPORTED_LOCALES

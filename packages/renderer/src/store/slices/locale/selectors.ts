import type { RootState } from '@renderer/store/types'
import { SUPPORTED_LOCALES } from '@renderer/store/slices/locale/constants'
import type { SupportedLocale } from '@renderer/store/slices/locale/types'

export const selectLocale = (state: RootState) => state.locale.locale
export const selectSupportedLocales = (): readonly SupportedLocale[] => SUPPORTED_LOCALES

import { i18n } from '@renderer/i18n/config'

import type { AppThunk } from '@renderer/store/types'
import { setLocale } from '@renderer/store/slices/locale/slice'
import type { SupportedLocale } from '@renderer/store/slices/locale/types'

export const changeLocale =
  (locale: SupportedLocale): AppThunk =>
  (dispatch) => {
    void i18n.changeLanguage(locale)
    dispatch(setLocale(locale))
  }

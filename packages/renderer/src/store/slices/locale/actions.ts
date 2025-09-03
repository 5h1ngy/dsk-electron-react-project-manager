import { i18n } from '@renderer/i18n/config'

import type { AppThunk } from '../../types'
import { setLocale } from './slice'
import type { SupportedLocale } from './types'

export const changeLocale =
  (locale: SupportedLocale): AppThunk =>
  (dispatch) => {
    void i18n.changeLanguage(locale)
    dispatch(setLocale(locale))
  }

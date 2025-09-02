import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enCommon from './locales/en/common.json'
import enLogin from './locales/en/login.json'
import itCommon from './locales/it/common.json'
import itLogin from './locales/it/login.json'
import deCommon from './locales/de/common.json'
import deLogin from './locales/de/login.json'
import frCommon from './locales/fr/common.json'
import frLogin from './locales/fr/login.json'

const resources = {
  en: { common: enCommon, login: enLogin },
  it: { common: itCommon, login: itLogin },
  de: { common: deCommon, login: deLogin },
  fr: { common: frCommon, login: frLogin }
} as const

i18n.use(initReactI18next).init({
  resources,
  lng: 'it',
  fallbackLng: 'en',
  defaultNS: 'common',
  interpolation: {
    escapeValue: false
  }
})

export { i18n }

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enCommon from './locales/en/common.json'
import enLogin from './locales/en/login.json'
import enRegister from './locales/en/register.json'
import itCommon from './locales/it/common.json'
import itLogin from './locales/it/login.json'
import itRegister from './locales/it/register.json'
import deCommon from './locales/de/common.json'
import deLogin from './locales/de/login.json'
import deRegister from './locales/de/register.json'
import frCommon from './locales/fr/common.json'
import frLogin from './locales/fr/login.json'
import frRegister from './locales/fr/register.json'

const resources = {
  en: { common: enCommon, login: enLogin, register: enRegister },
  it: { common: itCommon, login: itLogin, register: itRegister },
  de: { common: deCommon, login: deLogin, register: deRegister },
  fr: { common: frCommon, login: frLogin, register: frRegister }
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

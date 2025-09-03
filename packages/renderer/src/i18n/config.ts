import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enCommon from './locales/en/common.json'
import enLogin from './locales/en/login.json'
import enRegister from './locales/en/register.json'
import enDashboard from './locales/en/dashboard.json'
import itCommon from './locales/it/common.json'
import itLogin from './locales/it/login.json'
import itRegister from './locales/it/register.json'
import itDashboard from './locales/it/dashboard.json'
import deCommon from './locales/de/common.json'
import deLogin from './locales/de/login.json'
import deRegister from './locales/de/register.json'
import deDashboard from './locales/de/dashboard.json'
import frCommon from './locales/fr/common.json'
import frLogin from './locales/fr/login.json'
import frRegister from './locales/fr/register.json'
import frDashboard from './locales/fr/dashboard.json'

const resources = {
  en: { common: enCommon, login: enLogin, register: enRegister, dashboard: enDashboard },
  it: { common: itCommon, login: itLogin, register: itRegister, dashboard: itDashboard },
  de: { common: deCommon, login: deLogin, register: deRegister, dashboard: deDashboard },
  fr: { common: frCommon, login: frLogin, register: frRegister, dashboard: frDashboard }
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

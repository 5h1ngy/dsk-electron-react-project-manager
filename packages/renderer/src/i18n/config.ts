import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enCommon from '@renderer/i18n/locales/en/common.json'
import enLogin from '@renderer/i18n/locales/en/login.json'
import enRegister from '@renderer/i18n/locales/en/register.json'
import enDashboard from '@renderer/i18n/locales/en/dashboard.json'
import enProjects from '@renderer/i18n/locales/en/projects.json'
import itCommon from '@renderer/i18n/locales/it/common.json'
import itLogin from '@renderer/i18n/locales/it/login.json'
import itRegister from '@renderer/i18n/locales/it/register.json'
import itDashboard from '@renderer/i18n/locales/it/dashboard.json'
import itProjects from '@renderer/i18n/locales/it/projects.json'
import deCommon from '@renderer/i18n/locales/de/common.json'
import deLogin from '@renderer/i18n/locales/de/login.json'
import deRegister from '@renderer/i18n/locales/de/register.json'
import deDashboard from '@renderer/i18n/locales/de/dashboard.json'
import deProjects from '@renderer/i18n/locales/de/projects.json'
import frCommon from '@renderer/i18n/locales/fr/common.json'
import frLogin from '@renderer/i18n/locales/fr/login.json'
import frRegister from '@renderer/i18n/locales/fr/register.json'
import frDashboard from '@renderer/i18n/locales/fr/dashboard.json'
import frProjects from '@renderer/i18n/locales/fr/projects.json'

const resources = {
  en: { common: enCommon, login: enLogin, register: enRegister, dashboard: enDashboard, projects: enProjects },
  it: { common: itCommon, login: itLogin, register: itRegister, dashboard: itDashboard, projects: itProjects },
  de: { common: deCommon, login: deLogin, register: deRegister, dashboard: deDashboard, projects: deProjects },
  fr: { common: frCommon, login: frLogin, register: frRegister, dashboard: frDashboard, projects: frProjects }
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


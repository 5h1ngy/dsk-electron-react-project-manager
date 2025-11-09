import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from '../locales/en/translation.json'
import it from '../locales/it/translation.json'

import { DEFAULT_LANGUAGE } from './language'

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    it: { translation: it }
  },
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: {
    escapeValue: false
  },
  returnObjects: true,
  react: {
    useSuspense: false
  }
})

export default i18n

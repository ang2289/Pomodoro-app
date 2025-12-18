import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import zhTW from './locales/zh-TW.json'
import enUS from './locales/en-US.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'zh-TW': { translation: zhTW },
      'en': { translation: enUS },
      // 保留舊格式以向後兼容
      'zh_TW': { translation: zhTW },
      'en_US': { translation: enUS },
    },
    fallbackLng: 'zh-TW',
    supportedLngs: ['en', 'zh-TW'],
    detection: {
      order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupQuerystring: 'lng',
      lookupLocalStorage: 'i18nextLng',
    },
    interpolation: { escapeValue: false },
  })

export default i18n

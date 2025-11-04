import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import zhTW from './locales/zh-TW.json'
import enUS from './locales/en-US.json'

// 從 localStorage 讀取語言設定，預設為中文
const getInitialLanguage = () => {
  if (typeof window === 'undefined') return 'zh_TW'
  const saved = localStorage.getItem('i18nextLng')
  if (saved === 'zh_TW' || saved === 'en_US') return saved
  // 預設返回中文
  return 'zh_TW'
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      zh_TW: { translation: zhTW },
      en_US: { translation: enUS },
    },
    lng: getInitialLanguage(),
    fallbackLng: 'zh_TW',
    interpolation: { escapeValue: false },
  })

export default i18n



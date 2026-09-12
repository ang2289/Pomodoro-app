import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import zhTW from './locales/zh-TW.json'
import enUS from './locales/en-US.json'
import zhRxv from './i18n/zh.json'
import enRxv from './i18n/en.json'
import zhBatch1 from './i18n/batch1-zh.json'
import enBatch1 from './i18n/batch1-en.json'

const zhMerged = {
  ...(zhTW as Record<string, unknown>),
  ...(zhRxv as Record<string, unknown>),
  ...(zhBatch1 as Record<string, unknown>),
}
const enMerged = {
  ...(enUS as Record<string, unknown>),
  ...(enRxv as Record<string, unknown>),
  ...(enBatch1 as Record<string, unknown>),
}

/** 自訂語系偵測：先 localStorage (lang)，再 navigator 對應，fallback zh-TW */
const langStorageKey = 'lang'

const customLangDetector = {
  name: 'customLang' as const,
  lookup(): string | undefined {
    if (typeof window === 'undefined') return undefined
    const stored = localStorage.getItem(langStorageKey)
    if (stored === 'zh-TW' || stored === 'en-US') return stored
    const nav = navigator.language || (navigator as { userLanguage?: string }).userLanguage || ''
    if (nav.startsWith('en')) return 'en-US'
    if (nav.startsWith('zh')) return 'zh-TW'
    return 'zh-TW'
  },
  cacheUserLanguage(lng: string): void {
    if (typeof window !== 'undefined') localStorage.setItem(langStorageKey, lng)
  },
}

const detector = new LanguageDetector()
detector.addDetector(customLangDetector)

i18n
  .use(detector)
  .use(initReactI18next)
  .init({
    resources: {
      'zh-TW': { translation: zhMerged },
      'en-US': { translation: enMerged },
      en: { translation: enMerged },
      zh_TW: { translation: zhMerged },
      en_US: { translation: enMerged },
    },
    fallbackLng: 'zh-TW',
    supportedLngs: ['zh-TW', 'en-US', 'en', 'zh_TW', 'en_US'],
    detection: {
      order: ['customLang', 'querystring', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupQuerystring: 'lng',
      lookupLocalStorage: langStorageKey,
    },
    interpolation: { escapeValue: false },
  })

// 同步 <html lang> 與當前語系，讓瀏覽器原生控制項（如檔案選擇按鈕）顯示對應語言
function applyHtmlLang(lng: string) {
  if (typeof document === 'undefined') return
  document.documentElement.lang = lng.startsWith('zh') ? 'zh-TW' : 'en'
}
applyHtmlLang(i18n.language)
i18n.on('languageChanged', applyHtmlLang)

export default i18n

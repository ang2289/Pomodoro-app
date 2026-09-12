import { useTranslation } from 'react-i18next'
import i18n from '../i18n'

const LANG_ZH_TW = 'zh-TW'
const LANG_EN_US = 'en-US'

export default function LanguageSwitcher() {
  const { t } = useTranslation()
  const current = i18n.language?.startsWith('zh') ? LANG_ZH_TW : LANG_EN_US

  const setLang = (lng: string) => {
    const next = lng === 'zh-TW' ? LANG_ZH_TW : LANG_EN_US
    i18n.changeLanguage(next)
    if (typeof window !== 'undefined') window.localStorage.setItem('lang', next)
  }

  return (
    <div className="flex items-center gap-0.5 sm:gap-1" role="group" aria-label={t('language_switch')}>
      <button
        type="button"
        onClick={() => setLang(LANG_EN_US)}
        className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-l-lg text-sm font-medium transition-colors ${
          current === LANG_EN_US
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
        }`}
        title="English"
      >
        🌐 EN
      </button>
      <button
        type="button"
        onClick={() => setLang(LANG_ZH_TW)}
        className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-r-lg text-sm font-medium transition-colors ${
          current === LANG_ZH_TW
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
        }`}
        title="中文"
      >
        中文
      </button>
    </div>
  )
}

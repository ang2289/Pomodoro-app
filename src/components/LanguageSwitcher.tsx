import { useTranslation } from 'react-i18next'
import i18n from '../i18n'

export default function LanguageSwitcher() {
  const { t } = useTranslation()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value)
  }

  return (
    <div className="flex items-center space-x-2">
      <label className="text-sm text-gray-600">{t('language_switch')}：</label>
      <select
        onChange={handleChange}
        defaultValue={i18n.language}
        className="border border-gray-300 rounded p-1 text-sm"
      >
        <option value="zh_TW">{t('lang_zh_tw')}</option>
        <option value="en_US">{t('lang_en')}</option>
      </select>
    </div>
  )
}



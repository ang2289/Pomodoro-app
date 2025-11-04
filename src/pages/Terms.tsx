import React from "react"
import { useTranslation } from 'react-i18next'
import ModuleDropdown from '../components/ModuleDropdown'

export default function TermsPage() {
  const { t } = useTranslation()
  
  return (
    <div className="p-6 max-w-3xl mx-auto text-gray-800 leading-relaxed">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{t('terms_title')}</h1>
        <ModuleDropdown />
      </div>
      <p className="mb-3">
        {t('terms_intro')}
      </p>
      <h2 className="text-lg font-semibold mt-4 mb-2">{t('terms_conduct_title')}</h2>
      <p className="mb-3">
        {t('terms_conduct_content')}
      </p>
      <h2 className="text-lg font-semibold mt-4 mb-2">{t('terms_disclaimer_title')}</h2>
      <p className="mb-3">
        {t('terms_disclaimer_1')}
      </p>
      <p className="mb-3">
        {t('terms_disclaimer_2')}
      </p>
      <p className="mb-3">
        {t('terms_changes')}
      </p>
      <p className="text-sm text-gray-500">{t('privacy_last_updated')}: 2025/11/04</p>
    </div>
  )
}

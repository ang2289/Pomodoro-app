import React from "react"
import { useTranslation } from 'react-i18next'
import i18n from '../i18n'
import ModuleDropdown from '../components/ModuleDropdown'

export default function AboutPage() {
  const { t } = useTranslation()
  
  return (
    <div className="gradient-bg min-h-screen flex justify-center px-4 py-10">
      <div className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-6 max-w-2xl w-full text-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">{t('about_page_title')}</h1>
          <ModuleDropdown />
        </div>
        <p className="mb-4">{t('about_page_intro')}</p>
        <p className="mb-4">
          {t('about_page_independent')}
          <strong className="mx-1">{t('about_page_studio')}</strong>
          {t('about_page_features')}
        </p>
        <p className="mb-4">{t('about_page_not_affiliated')}</p>
        
        <hr className="my-6 border-gray-300" />
        
        <p className="mb-2">
          📧 {t('about_page_contact')}{" "}
          <a
            href="mailto:rxv0227@gmail.com"
            className="text-blue-600 underline hover:text-blue-800"
          >
            rxv0227@gmail.com
          </a>
        </p>
        <p className="text-sm text-gray-500">
          {t('about_page_update')}{i18n.language === 'en_US' ? ': ' : '：'}2025/11/04
        </p>
      </div>
    </div>
  )
}

import React from "react"
import { useTranslation } from 'react-i18next'
import ModuleDropdown from '../components/ModuleDropdown'

export default function FeaturesPage() {
  const { t } = useTranslation()
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 頁面標題與導覽 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📋 {t('features_overview_title')}</h1>
        <ModuleDropdown />
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">🍅 {t('features_pomodoro')}</h2>
        <ul className="list-disc ml-5 space-y-1 text-gray-700">
          <li>{t('feature_pomodoro_1')}</li>
          <li>{t('feature_pomodoro_2')}</li>
          <li>{t('feature_pomodoro_3')}</li>
          <li>{t('feature_pomodoro_4')}</li>
          <li>{t('feature_pomodoro_5')}</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">📿 {t('features_chant')}</h2>
        <ul className="list-disc ml-5 space-y-1 text-gray-700">
          <li>{t('feature_chant_1')}</li>
          <li>{t('feature_chant_2')}</li>
          <li>{t('feature_chant_3')}</li>
          <li>{t('feature_chant_4')}</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">✅ {t('features_todo')}</h2>
        <ul className="list-disc ml-5 space-y-1 text-gray-700">
          <li>{t('feature_todo_1')}</li>
          <li>{t('feature_todo_2')}</li>
          <li>{t('feature_todo_3')}</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">📊 {t('features_stats')}</h2>
        <ul className="list-disc ml-5 space-y-1 text-gray-700">
          <li>{t('feature_stats_1')}</li>
          <li>{t('feature_stats_2')}</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">⚙️ {t('features_system')}</h2>
        <ul className="list-disc ml-5 space-y-1 text-gray-700">
          <li>{t('feature_system_1')}</li>
          <li>{t('feature_system_2')}</li>
          <li>{t('feature_system_3')}</li>
          <li>{t('feature_system_4')}</li>
          <li>{t('feature_system_5')}</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">📄 {t('features_legal')}</h2>
        <ul className="list-disc ml-5 space-y-1 text-gray-700">
          <li>{t('feature_legal_1')}</li>
          <li>{t('feature_legal_2')}</li>
        </ul>
      </section>
    </div>
  )
}

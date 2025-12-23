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

      {/* Beta 測試標示 */}
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800 font-semibold mb-2">⚠️ Beta 測試中</p>
        <p className="text-yellow-700 text-sm">
          本服務目前處於 Beta 測試階段，功能可能會持續優化與調整。如有任何問題或建議，歡迎透過 Email 聯絡我們。
        </p>
      </div>

      <p className="mb-3">
        {t('terms_intro')}
      </p>

      {/* 服務條款 - 使用方案購買說明 */}
      <h2 className="text-lg font-semibold mt-4 mb-2">使用方案購買服務條款</h2>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <p className="text-blue-900 font-semibold mb-2">📌 重要說明：</p>
        <ul className="list-disc ml-5 space-y-2 text-blue-800 text-sm">
          <li><strong>使用方案為一次性購買</strong>：購買的使用方案為一次性消費，不會自動續費或重複扣款</li>
          <li><strong>不限使用期限</strong>：購買的使用方案沒有使用期限，可隨時使用</li>
          <li><strong>用完為止</strong>：使用額度依實際使用的文字量扣除，用完後需再次購買才能繼續使用</li>
          <li><strong>不提供退費</strong>：使用方案一旦購買，除非服務發生重大問題，否則不提供退款服務</li>
        </ul>
      </div>
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

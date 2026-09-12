//src/pages/summary/SummaryLayout.tsx
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { trackEvent } from '@/utils/analytics'

import SectionHeader from '../../components/SectionHeader'
import { PLANS } from '../../config'
import { getPlanChars } from '../../lib/usagePlans'
import { isLoggedIn } from '@/lib/auth'
import UpgradeModal from '@/components/UpgradeModal'
import TwoColumnToolLayout from '@/components/TwoColumnToolLayout'
import PricingPlanCard from '@/components/PricingPlanCard'
import PrimaryButton from '@/components/ui/PrimaryButton'
import InsufficientCreditsPrompt from '@/components/InsufficientCreditsPrompt'
import LowCreditsNotice from '@/components/LowCreditsNotice'
import { Card, CardContent } from '@/components/ui/card'

interface SummaryLayoutProps {
  // Language
  lang: 'zh-tw' | 'en'
  
  // Modal
  showInsufficientQuotaModal: boolean
  onCloseInsufficientQuotaModal: () => void
  showInsufficientCreditsPrompt: boolean
  
  // Input
  input: string
  onInputChange: (value: string) => void
  
  // Loading & Submit
  loading: boolean
  onSubmit: () => void
  
  // Credits
  remainingChars: number | null
  setRemainingChars?: (value: number) => void
  
  // Summary
  summary: { content: string; isPreview?: boolean }
  lastUsedPoints: {
    inputLength: number
    outputLength: number
    totalUsedPoints: number
  } | null
  usageChars: number | null
  
  // Keywords
  keywords: string[]
  /** 預設關鍵字為 i18n 鍵時，顯示與複製會依語系翻譯 */
  defaultKeywordKeys?: string[]
  
  // Traffic Keywords
  trafficKeywords: string[]
  trafficKeywordsReady: boolean
  
  // High Intent Content
  highIntentContent: Array<{ question: string; answer: string }>
  
  // Conversion Keywords
  conversionKeywords: string[]
  conversionKeywordsReady: boolean
  
  // Error
  error: string
  
  // User Credits (只讀，用於 UI 顯示)
  trialRemaining: number | null
  paidRemaining: number | null
  totalRemaining: number | null  // 總剩餘字數 = (trial_total - trial_used) + (paid_total - paid_used)
  
  // 匿名使用者剩餘字數（用於顯示）
  anonRemainingChars: number | null
  
  // 免費試用（未登入時顯示）
  freeTrialUsedCount: number | null  // 已使用的免費試用次數（0-3）
  freeTrialRemainingCount: number | null  // 剩餘的免費試用次數（3-0）
  
  // 使用字數統計（從 usage_logs 累加）
  usedChars?: number
  // 方案限制（從 plans 表或預設 free plan）
  planLimit?: number
}

export default function SummaryLayout(props: SummaryLayoutProps) {
  const {
    lang,
    showInsufficientQuotaModal,
    onCloseInsufficientQuotaModal,
    showInsufficientCreditsPrompt,
    input,
    onInputChange,
    loading,
    onSubmit,
    remainingChars,
    setRemainingChars,
    summary,
    lastUsedPoints,
    usageChars,
    keywords,
    defaultKeywordKeys,
    trafficKeywords,
    trafficKeywordsReady,
    highIntentContent,
    conversionKeywords,
    conversionKeywordsReady,
    error,
    trialRemaining,
    paidRemaining,
    totalRemaining,
    anonRemainingChars,
    freeTrialUsedCount,
    freeTrialRemainingCount,
    usedChars = 0,
    planLimit,
  } = props

  const { t, i18n } = useTranslation()
  const copySeparator = "\n"
  const navigate = useNavigate()
  /** 若為預設 i18n 鍵則顯示翻譯，否則顯示 API 回傳字串 */
  const getKeywordLabel = (k: string) => (defaultKeywordKeys && defaultKeywordKeys.includes(k) ? t(k) : k)

  // 追蹤導流卡顯示（摘要結果產出後）
  const hasTrackedCrossPromo = React.useRef(false)
  useEffect(() => {
    if (summary.content?.trim() && !loading && !hasTrackedCrossPromo.current) {
      trackEvent('crosspromo_show_homework', { source: 'summary' })
      hasTrackedCrossPromo.current = true
    }
    if (!summary.content?.trim()) hasTrackedCrossPromo.current = false
  }, [summary.content, loading])

  // 追蹤升級提示 UI 顯示（使用 ref 避免重複觸發）
  const hasTrackedUpgradeModal = React.useRef(false)
  const hasTrackedInsufficientPrompt = React.useRef(false)
  const hasTrackedLowCreditsNotice = React.useRef(false)

  useEffect(() => {
    // 當 UpgradeModal 顯示時（只追蹤一次）
    if (showInsufficientQuotaModal && !hasTrackedUpgradeModal.current) {
      trackEvent('show_upgrade_prompt', {
        prompt_type: 'upgrade_modal',
      })
      hasTrackedUpgradeModal.current = true
    } else if (!showInsufficientQuotaModal) {
      // 當 modal 關閉時重置，以便下次顯示時再次追蹤
      hasTrackedUpgradeModal.current = false
    }
  }, [showInsufficientQuotaModal])

  useEffect(() => {
    // 當 InsufficientCreditsPrompt 顯示時（只追蹤一次）
    if (showInsufficientCreditsPrompt && !hasTrackedInsufficientPrompt.current) {
      trackEvent('show_upgrade_prompt', {
        prompt_type: 'insufficient_credits_prompt',
      })
      hasTrackedInsufficientPrompt.current = true
    } else if (!showInsufficientCreditsPrompt) {
      hasTrackedInsufficientPrompt.current = false
    }
  }, [showInsufficientCreditsPrompt])

  useEffect(() => {
    // 當 LowCreditsNotice 應該顯示時（remainingChars < 5000 且 > 0，只追蹤一次）
    if (remainingChars !== null && remainingChars > 0 && remainingChars < 5000 && !hasTrackedLowCreditsNotice.current) {
      trackEvent('show_upgrade_prompt', {
        prompt_type: 'low_credits_notice',
      })
      hasTrackedLowCreditsNotice.current = true
    } else if (remainingChars === null || remainingChars >= 5000 || remainingChars <= 0) {
      hasTrackedLowCreditsNotice.current = false
    }
  }, [remainingChars])

  // 追蹤購買點數方案區塊顯示（該區塊始終顯示，但只在首次載入時追蹤一次）
  const hasTrackedPricingBlock = React.useRef(false)
  useEffect(() => {
    if (!hasTrackedPricingBlock.current) {
      // 購買點數方案區塊始終顯示，在首次載入時追蹤
      trackEvent('show_upgrade_prompt', {
        prompt_type: 'pricing_block',
      })
      hasTrackedPricingBlock.current = true
    }
  }, [])

  // 處理購買方案按鈕點擊（檢查登入狀態）
  const handlePurchaseClick = (e: React.MouseEvent) => {
    if (!isLoggedIn()) {
      e.preventDefault()
      alert(t('summary_please_login'))
      navigate('/login')
      return
    }
  }

  // Copy functions
  const copyText = (text: string) => {
    navigator.clipboard.writeText(text)
    alert(t('summary_copied'))
  }

  const copySummary = () => {
    if (summary.content) {
      copyText(summary.content)
    }
  }

  const copyKeywords = () => {
    if (keywords.length > 0) {
      copyText(keywords.map(getKeywordLabel).join(copySeparator))
    }
  }

  const copyTrafficKeywords = async () => {
    // 只複製已產生的關鍵字（不是 placeholder）
    // ⚠️ 流量關鍵字由 Supabase Edge Function + Gemini JSON Schema 生成
    // 前端不得再做任何修正、去重或補齊，避免破壞搜尋語意
    // 禁止使用 slice、filter、去重（includes / startsWith）等任何加工邏輯
    if (trafficKeywordsReady && trafficKeywords.length > 0) {
      try {
        const text = trafficKeywords.join(copySeparator)
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text)
          alert(t('summary_traffic_copied'))
        } else {
          const textArea = document.createElement('textarea')
          textArea.value = text
          textArea.style.position = 'fixed'
          textArea.style.opacity = '0'
          document.body.appendChild(textArea)
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)
          alert(t('summary_traffic_copied'))
        }
      } catch (err) {
        console.error('複製流量關鍵字失敗:', err)
        alert(t('summary_copy_failed'))
      }
    }
  }

  const copyConversionKeyword = (keyword: string) => {
    if (keyword && keyword.trim().length > 0) {
      navigator.clipboard.writeText(keyword.trim())
      alert(t('summary_conversion_copied'))
    }
  }

  return (
    <div>
      <Helmet>
        <title>{t('summary_article_tool')}</title>
      </Helmet>


      
      {/* 頁面標題與首頁按鈕 */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 flex-1 text-center">{t('summary_article_tool')}</h1>
        <Link
          to="/"
          className="inline-flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-bold text-sm sm:text-base"
        >
          <span className="text-white">{t('homepage')}</span>
        </Link>
      </div>

      
      {/* 🔒 字數不足升級彈窗 - 統一使用 UpgradeModal，僅在 remainingChars <= 0 時顯示 */}
      <UpgradeModal
        isOpen={showInsufficientQuotaModal}
        onClose={onCloseInsufficientQuotaModal}
        requiredChars={input.length}
        remainingChars={remainingChars || 0}
        lang={lang}
      />
      
      {/* 點數不足提示區塊：當 consume_credits 回傳 false 時顯示 */}
      {showInsufficientCreditsPrompt && (
        <InsufficientCreditsPrompt lang={lang} />
      )}

      {/* ⚠️ 已移除試用字數提醒（localStorage remaining_trial_chars） */}
      
      <TwoColumnToolLayout
        left={
          <div>
            {/* 輸入框 */}
            <div className="shadow-md border rounded-2xl p-5 bg-white transition">
              <SectionHeader title={t('summary_input_title')} />
              <textarea
                className="w-full h-[380px] bg-gray-50 border rounded-xl p-3 focus:ring-2 focus:ring-blue-500"
                placeholder={t('summary_placeholder')}
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
              />
            </div>

            {/* 生成摘要按鈕 */}
            <button
              onClick={onSubmit}
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold transition
                ${loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
            >
              {loading ? t('summary_loading') : t('summary_btn_generate')}
            </button>

            {/* 手機版優先顯示：摘要結果 */}
            {/* ✅ STATE 變數：summary.content */}
            <div className="lg:hidden mt-6">
              <Card>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">📌 {t('summary_result_title')}</h3>
                    <button
                      onClick={copySummary}
                      className="px-3 py-1.5 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition"
                    >
                      {t('summary_copy_summary')}
                    </button>
                  </div>
                  {summary.content && summary.content.trim() !== '' ? (
                    <>
                      <p className="text-gray-800 leading-relaxed">{summary.content}</p>
                      {lastUsedPoints && (
                        <div className="mt-2 text-sm text-gray-500">
                          {t('summary_last_use_detail', {
                            input: lastUsedPoints.inputLength,
                            output: lastUsedPoints.outputLength,
                            points: lastUsedPoints.totalUsedPoints,
                          })}
                        </div>
                      )}
                      {usageChars !== null && (
                        <div className="text-sm text-gray-500">
                          {t('summary_usage_this_time', { count: usageChars })}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-gray-400">{t('summary_no_summary_yet')}</div>
                  )}
                </CardContent>
              </Card>
              {/* 導流卡：作業解題（僅在摘要產出後顯示） */}
              {summary.content?.trim() && !loading && (
                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <h4 className="text-sm font-semibold text-slate-800">📌 {t('summary_homework_promo_title')}</h4>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    {t('summary_homework_promo_desc')}
                  </p>
                  <Link
                    to="/tools/homework-helper"
                    onClick={() => trackEvent('crosspromo_click_homework', { source: 'summary' })}
                    className="mt-3 block w-full rounded-lg bg-blue-600 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
                  >
                    {t('summary_go_homework')}
                  </Link>
                </div>
              )}
            </div>

            {/* 手機版優先顯示：關鍵字建議 */}
            {/* ✅ STATE 變數：keywords */}
            <div className="lg:hidden mt-6">
              <Card>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{t('summary_keywords_title')}</h3>
                    <button 
                      onClick={copyKeywords}
                      className="btn-green"
                    >
                      {t('summary_copy_keywords')}
                    </button>
                  </div>

                  {keywords.length === 0 ? (
                    <div className="text-sm text-gray-400">{t('summary_no_keywords_yet')}</div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {keywords.map((k, i) => (
                        <span key={i} className="tag-blue">{getKeywordLabel(k)}</span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 手機版優先顯示：流量關鍵字 */}
            {/* ✅ STATE 變數：trafficKeywords */}
            <div className="lg:hidden mt-6">
              <Card>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{t('summary_traffic_keywords')}</h3>
                    <button 
                      onClick={copyTrafficKeywords}
                      className="btn-emerald"
                    >
                      {t('summary_copy_traffic_keywords')}
                    </button>
                  </div>

                  {trafficKeywords.length === 0 ? (
                    <div className="text-sm text-gray-400">
                      {t('summary_no_traffic_keywords_yet')}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {trafficKeywords.map((k, i) => (
                        <span key={i} className="tag-emerald">{k}</span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 點數顯示 */}
            {isLoggedIn() ? (
              <div className="mt-3 text-sm text-gray-500 space-y-1">
                <div>{t('summary_used_chars')}：{(usedChars ?? 0).toLocaleString()}</div>
                <div>{t('summary_remaining_chars')}：{remainingChars !== null ? remainingChars.toLocaleString() : '—'}</div>
              </div>
            ) : (
              <div className="mt-3 text-sm text-gray-500 space-y-1">
                <div>
                  {t('summary_free_trial_used', { count: freeTrialUsedCount ?? 0 })}
                </div>
                {freeTrialRemainingCount !== null && freeTrialRemainingCount > 0 && (
                  <div className="text-blue-600 font-medium">
                    {t('summary_free_trial_remaining', { count: freeTrialRemainingCount })}
                  </div>
                )}
                {freeTrialRemainingCount !== null && freeTrialRemainingCount === 0 && (
                  <div className="text-red-600 font-medium mt-2">
                    {t('summary_free_trial_exhausted')}
                  </div>
                )}
              </div>
            )}


{/* 購買點數方案區塊（手機版移到關鍵字建議之後）- 一律顯示 */}
<div className="mt-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6 shadow-md">
  <div className="text-center mb-6">
    <h2 className="text-xl font-bold text-gray-900 mb-2">
      {t('summary_purchase_credits')}
    </h2>
    <p className="text-sm text-gray-700">
      {t('summary_purchase_credits_desc')}
    </p>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="bg-white rounded-lg p-5 border-2 border-blue-300 shadow-sm hover:shadow-md transition">
      <div className="text-center mb-4">
        <span className="text-3xl mb-2 block">💎</span>
        <h3 className="text-lg font-bold text-blue-900 mb-1">
          {t('summary_standard_plan')}
        </h3>
        <p className="text-xl font-bold text-blue-900">
          NT${PLANS.plan99.price}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          {getPlanChars('pack99').toLocaleString()} {t('summary_credits_unit')}
        </p>
        <p className="text-sm font-semibold text-blue-600 mt-2">
          {t('summary_standard_plan_desc')}
        </p>
      </div>

      <Link
        to="/pricing"
        onClick={(e) => {
          handlePurchaseClick(e)
          trackEvent('click_pricing', { source_page: 'summary' })
        }}
        className="block"
      >
        <PrimaryButton fullWidth className="mt-4">
          {t('summary_buy_credits')}
        </PrimaryButton>
      </Link>
    </div>

    <div className="bg-white rounded-lg p-5 border-2 border-purple-400 shadow-md hover:shadow-lg ring-2 ring-purple-200 transition">
      <div className="text-center mb-4">
        <span className="text-3xl mb-2 block">💎</span>
        <h3 className="text-lg font-bold text-purple-900 mb-1">
          {t('summary_advanced_plan')}
        </h3>
        <p className="text-xl font-bold text-purple-900">
          NT${PLANS.plan199.price}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          {getPlanChars('pack199').toLocaleString()} {t('summary_credits_unit')}
        </p>
        <p className="text-sm font-bold text-purple-600 mt-2">
          {t('summary_advanced_plan_desc')}
        </p>
      </div>

      <Link
        to="/pricing"
        onClick={(e) => {
          handlePurchaseClick(e)
          trackEvent('click_pricing', { source_page: 'summary' })
        }}
        className="block"
      >
        <PrimaryButton fullWidth className="mt-4">
          {t('summary_buy_credits')}
        </PrimaryButton>
      </Link>
    </div>
  </div>

  <p className="mt-4 text-sm text-gray-600 text-center">
    {t('summary_credits_usage_note')}
  </p>

  <div className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm text-gray-600">
    <span>✓ {t('summary_free_images')}</span>
    <span>✓ {t('summary_standard_images')}</span>
    <span>✓ {t('summary_premium_images')}</span>
  </div>
</div>







            {/* 低點數提醒：當 remainingChars < 5000 且 > 0 時顯示 */}
            {remainingChars !== null && remainingChars > 0 && remainingChars < 5000 && (
              <div className="mt-4">
                <LowCreditsNotice remainingCredits={remainingChars} lang={lang} />
              </div>
            )}

            {/* ⚠️ 已移除 CreditStatusBarDetailed，避免重複顯示點數 */}
            {/* 點數顯示統一在上方的「已用字數」、「剩餘字數」、「方案上限」區塊 */}

            {/* 方案說明卡片（手機版移到關鍵字建議之後） */}
            <PricingPlanCard />

            {/* 使用說明文字 */}
            <p className="text-sm text-gray-500">
              {t('summary_usage_note')}
            </p>

            {/* 簡易使用說明：僅顯示連結到完整說明頁 */}
            <div className="mt-2 text-xs text-gray-500 text-center">
              <Link to="/points" className="text-blue-600 hover:underline">
                {t('summary_view_full_usage')} →
              </Link>
            </div>

            {/* SEO 內鏈 */}
            <p className="mt-4 text-sm text-gray-600 text-center">
              {t('summary_seo_homework_intro')}{' '}
              <Link to="/tools/homework-helper" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">
                {t('summary_seo_homework_link')}
              </Link>{' '}
              {t('summary_seo_homework_outro')}
            </p>

            {error && (
              <p className="mt-3 p-3 bg-red-100 border border-red-300 text-red-600 rounded">
                {error}
              </p>
            )}
          </div>
        }
        right={
          <div className="space-y-6">
            {/* 桌面版顯示：摘要結果 */}
            {/* ✅ STATE 變數：summary.content */}
            <div className="hidden lg:block">
              <Card>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">📌 {t('summary_result_title')}</h3>
                    <button
                      onClick={copySummary}
                      className="px-3 py-1.5 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition"
                    >
                      {t('summary_copy_summary')}
                    </button>
                  </div>
                  {summary.content && summary.content.trim() !== '' ? (
                    <>
                      <p className="text-gray-800 leading-relaxed">{summary.content}</p>
                      {lastUsedPoints && (
                        <div className="mt-2 text-sm text-gray-500">
                          {t('summary_last_use_detail', {
                            input: lastUsedPoints.inputLength,
                            output: lastUsedPoints.outputLength,
                            points: lastUsedPoints.totalUsedPoints,
                          })}
                        </div>
                      )}
                      {usageChars !== null && (
                        <div className="text-sm text-gray-500">
                          {t('summary_usage_this_time', { count: usageChars })}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-gray-400">{t('summary_no_summary_yet')}</div>
                  )}
                </CardContent>
              </Card>
              {summary.content?.trim() && !loading && (
                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <h4 className="text-sm font-semibold text-slate-800">📌 {t('summary_homework_promo_title')}</h4>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    {t('summary_homework_promo_desc')}
                  </p>
                  <Link
                    to="/tools/homework-helper"
                    onClick={() => trackEvent('crosspromo_click_homework', { source: 'summary' })}
                    className="mt-3 block w-full rounded-lg bg-blue-600 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
                  >
                    {t('summary_go_homework')}
                  </Link>
                </div>
              )}
            </div>

            {/* 桌面版顯示：關鍵字 */}
            <div className="hidden lg:block">
              <Card>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{t('summary_keywords_title')}</h3>
                    <button 
                      onClick={copyKeywords}
                      className="btn-green"
                    >
                      {t('summary_copy_keywords')}
                    </button>
                  </div>

                  {keywords.length === 0 ? (
                    <div className="text-sm text-gray-400">{t('summary_no_keywords_yet')}</div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {keywords.map((k, i) => (
                        <span key={i} className="tag-blue">{getKeywordLabel(k)}</span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 流量關鍵字（重點） */}
            <Card>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{t('summary_traffic_keywords')}</h3>
                  <button 
                    onClick={copyTrafficKeywords}
                    className="btn-emerald"
                  >
                    {t('summary_copy_traffic_keywords')}
                  </button>
                </div>

                {trafficKeywords.length === 0 ? (
                  <div className="text-sm text-gray-400">
                    {t('summary_no_traffic_keywords_yet')}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {trafficKeywords.map((k, i) => (
                      <span key={i} className="tag-emerald">{k}</span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        }
      />
    </div>
  )
}

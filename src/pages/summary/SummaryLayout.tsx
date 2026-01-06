import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'

import SectionHeader from '../../components/SectionHeader'
import { PLANS } from '../../config'
import { getPlanChars } from '../../lib/usagePlans'
import { isLoggedIn } from '@/lib/auth'
import UpgradeModal from '@/components/UpgradeModal'
import TwoColumnToolLayout from '@/components/TwoColumnToolLayout'
import PricingPlanCard from '@/components/PricingPlanCard'
import { buildSEO } from '../../lib/seo'
import PrimaryButton from '@/components/ui/PrimaryButton'
import InsufficientCreditsPrompt from '@/components/InsufficientCreditsPrompt'
import LowCreditsNotice from '@/components/LowCreditsNotice'
import { Card, CardContent } from '@/components/ui/card'

// ===== 🔤 MVP 語系 =====
const LANG_TEXT = {
  'zh-tw': {
    langLabel: '繁體中文',
    inputTitle: '文字輸入',
    placeholder: '請貼上要摘要的文章...',
    summaryTitle: '📌 摘要結果',
    copySummary: '複製摘要',
    keywordTitle: '🔖 相關關鍵字',
    copyKeywords: '複製關鍵字',
    trafficKeywordTitle: '流量關鍵字建議',
    copyTrafficKeywords: '複製流量關鍵字',
    conversionKeywordTitle: '高轉換關鍵字（諮詢 / 行動導向）',
    conversionKeywordSubtitle: '適合用於諮詢、下一步行動或專業協助判斷',
    conversionKeywordHover: '這類關鍵字通常出現在使用者準備採取行動前',
    pending: '（內容將顯示於此）',
    btn: '一鍵摘要',
    loading: '生成中…',
    previewTitle: '✨ 即將上線功能（預告）',
    previewList: [
      '網址自動抓全文摘要',
      '多語言自動識別 & 多語輸出',
      '一鍵分享 FB / LINE / Reddit',
      'AI 摘要歷史記錄',
      '深度重點提取（非一般摘要）',
      'AI 真人朗讀（未來付費功能）',
      '上傳 PDF → 自動擷取文字（未來進階功能）'
    ],
    currentLength: '目前輸入字數',
    freeLimitTitle: '⚡ 免費方案：總額 10,000 字',
    freeLimitSub: '字數以實際輸入內容計算，不限月份、不限天數，用完為止'
  },
  en: {
    langLabel: 'English',
    inputTitle: 'Text Input',
    placeholder: 'Paste the article…',
    summaryTitle: '📌 Summary Result',
    copySummary: 'Copy Summary',
    keywordTitle: '🔖 Keywords',
    copyKeywords: 'Copy Keywords',
    trafficKeywordTitle: 'Traffic Keyword Suggestions',
    copyTrafficKeywords: 'Copy Traffic Keywords',
    conversionKeywordTitle: 'Conversion Keywords (Consultation / Action-Oriented)',
    conversionKeywordSubtitle: 'Suitable for consultation, next steps, or professional assistance',
    conversionKeywordHover: 'These keywords typically appear when users are ready to take action',
    pending: '(Summary will appear here)',
    btn: 'Generate',
    loading: 'Generating…',
    previewTitle: '✨ Coming Soon Features',
    previewList: [
      'Auto URL full-text extraction',
      'Multi-language detection & output',
      'One-click share to FB / LINE / Reddit',
      'Summary history record',
      'Deep insight extraction',
      'AI human-voice reading (future paid feature)',
      'Upload PDF → extract text (future feature)'
    ],
    currentLength: 'Current Input Length',
    freeLimitTitle: '⚡ Free Plan: 10,000 characters',
    freeLimitSub: 'Characters are calculated based on actual input, no expiration date'
  }
}

const seo = buildSEO({
  title: 'AI 摘要工具',
  description: '貼上文章內容，AI 自動生成摘要與關鍵字。支援繁中 / 英文切換，簡單快速抓重點。',
  url: 'https://pomodoro-app-eight-rouge.vercel.app/summary',
  image: '/seo/summary-tool.png',
})

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
    usedChars = 0,
    planLimit,
  } = props

  // UI 僅做狀態顯示，不碰資料來源
  const t = LANG_TEXT[lang]
  const navigate = useNavigate()

  // 處理購買方案按鈕點擊（檢查登入狀態）
  const handlePurchaseClick = (e: React.MouseEvent) => {
    if (!isLoggedIn()) {
      e.preventDefault()
      alert('請先註冊或登入，才能使用本功能')
      navigate('/login')
      return
    }
    // 已登入，允許跳轉到 /pricing
  }

  // Copy functions
  const copyText = (text: string) => {
    navigator.clipboard.writeText(text)
    alert(lang === 'zh-tw' ? '已複製！' : 'Copied!')
  }

  const copySummary = () => {
    if (summary.content) {
      copyText(summary.content)
    }
  }

  const copyKeywords = () => {
    if (keywords.length > 0) {
      // 根據語言使用不同的分隔符：中文用「、」，英文用「, 」
      const separator = lang === 'zh-tw' ? '、' : ', '
      copyText(keywords.join(separator))
    }
  }

  const copyTrafficKeywords = async () => {
    // 只複製已產生的關鍵字（不是 placeholder）
    // ⚠️ 流量關鍵字由 Supabase Edge Function + Gemini JSON Schema 生成
    // 前端不得再做任何修正、去重或補齊，避免破壞搜尋語意
    // 禁止使用 slice、filter、去重（includes / startsWith）等任何加工邏輯
    if (trafficKeywordsReady && trafficKeywords.length > 0) {
      try {
        // ⚠️ 完全信任後端回傳，禁止任何前端加工
        // 直接使用所有後端回傳的關鍵字，不做任何處理
        const separator = lang === 'zh-tw' ? '、' : ', '
        const text = trafficKeywords.join(separator)
        
        // 使用 navigator.clipboard 複製所有流量關鍵字
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text)
          alert(lang === 'zh-tw' ? '流量關鍵字已複製' : 'Traffic keywords copied')
        } else {
          // Fallback：使用舊的 document.execCommand 方法
          const textArea = document.createElement('textarea')
          textArea.value = text
          textArea.style.position = 'fixed'
          textArea.style.opacity = '0'
          document.body.appendChild(textArea)
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)
          alert(lang === 'zh-tw' ? '流量關鍵字已複製' : 'Traffic keywords copied')
        }
      } catch (err) {
        console.error('複製流量關鍵字失敗:', err)
        alert(lang === 'zh-tw' ? '複製失敗，請手動選取複製' : 'Copy failed, please select and copy manually')
      }
    }
  }

  const copyConversionKeyword = (keyword: string) => {
    // 複製單一高轉換關鍵字
    // ⚠️ 高轉換關鍵字由 Supabase Edge Function + Gemini JSON Schema 生成
    // 前端不得再做任何修正、去重或補齊，避免破壞搜尋語意
    if (keyword && keyword.trim().length > 0) {
      navigator.clipboard.writeText(keyword.trim())
      alert(lang === 'zh-tw' ? '高轉換關鍵字已複製' : 'Conversion keyword copied')
    }
  }

  return (
    <div>
      <Helmet>
        <title>{seo.title}</title>
      </Helmet>
      
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
              <SectionHeader title={t.inputTitle} />
              <textarea
                className="w-full h-[380px] bg-gray-50 border rounded-xl p-3 focus:ring-2 focus:ring-blue-500"
                placeholder={t.placeholder}
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
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90'
                }`}
            >
              {loading ? '生成中…' : '產生摘要'}
            </button>

            {/* 點數顯示 */}
            <div className="mt-3 text-sm text-gray-500 space-y-1">
              <div>已用點數：{(usedChars ?? 0).toLocaleString()}</div>
              <div>剩餘點數：{remainingChars !== null ? remainingChars.toLocaleString() : '—'}</div>
              <div>本方案上限：{planLimit ? planLimit.toLocaleString() : '10,000'} 點</div>
            </div>

            {/* 購買點數方案區塊（永久顯示） */}
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6 shadow-md">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {lang === 'zh-tw' ? '購買點數方案' : 'Purchase Credits'}
                </h2>
                <p className="text-sm text-gray-700">
                  {lang === 'zh-tw' ? '升級方案後可繼續使用 AI 摘要功能' : 'Upgrade your plan to continue using AI summary features'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 標準方案 NT$99 */}
                <div className="bg-white rounded-lg p-5 border-2 border-blue-300 shadow-sm hover:shadow-md transition">
                  <div className="text-center mb-4">
                    <span className="text-3xl mb-2 block">💎</span>
                    <h3 className="text-lg font-bold text-blue-900 mb-1">
                      {lang === 'zh-tw' ? '標準方案' : 'Standard Plan'}
                    </h3>
                    <p className="text-xl font-bold text-blue-900">
                      NT${PLANS.plan99.price}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {getPlanChars('pack99').toLocaleString()} {lang === 'zh-tw' ? '字' : 'chars'}
                    </p>
                  </div>
                  <Link to="/pricing" onClick={handlePurchaseClick} className="block">
                    <PrimaryButton fullWidth className="mt-4">
                      {lang === 'zh-tw' ? '立即升級' : 'Upgrade Now'}
                    </PrimaryButton>
                  </Link>
                </div>

                {/* 進階方案 NT$199 */}
                <div className="bg-white rounded-lg p-5 border-2 border-purple-300 shadow-sm hover:shadow-md transition">
                  <div className="text-center mb-4">
                    <span className="text-3xl mb-2 block">💎</span>
                    <h3 className="text-lg font-bold text-purple-900 mb-1">
                      {lang === 'zh-tw' ? '進階方案' : 'Advanced Plan'}
                    </h3>
                    <p className="text-xl font-bold text-purple-900">
                      NT${PLANS.plan199.price}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {getPlanChars('pack199').toLocaleString()} {lang === 'zh-tw' ? '字' : 'chars'}
                    </p>
                  </div>
                  <Link to="/pricing" onClick={handlePurchaseClick} className="block">
                    <PrimaryButton fullWidth className="mt-4">
                      {lang === 'zh-tw' ? '立即升級' : 'Upgrade Now'}
                    </PrimaryButton>
                  </Link>
                </div>
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

            {/* 方案說明卡片 */}
            <PricingPlanCard />

            {/* 使用說明文字 */}
            <p className="text-sm text-gray-500">
              本功能依實際輸入與 AI 輸出內容計算使用量，
              僅供學習、作業理解與內容整理輔助用途。
            </p>

            {/* 簡易使用說明：僅顯示連結到完整說明頁 */}
            <div className="mt-2 text-xs text-gray-500 text-center">
              <Link to="/points" className="text-blue-600 hover:underline">
                查看完整使用說明 →
              </Link>
            </div>

            {error && (
              <p className="mt-3 p-3 bg-red-100 border border-red-300 text-red-600 rounded">
                {error}
              </p>
            )}
          </div>
        }
        right={
          <div className="space-y-6">

            {/* 摘要結果 */}
            <Card>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">📌 摘要結果</h3>
                  <button
                    onClick={copySummary}
                    className="px-3 py-1.5 rounded-md text-sm bg-indigo-500 text-white hover:bg-indigo-600 active:scale-95 transition"
                  >
                    複製摘要
                  </button>
                </div>
                {summary.content && summary.content.trim() !== '' ? (
                  <>
                    <p className="text-gray-800 leading-relaxed">{summary.content}</p>
                    {lastUsedPoints && (
                      <div className="mt-2 text-sm text-gray-500">
                        共輸入 <strong>{lastUsedPoints.inputLength}</strong> 字，輸出 <strong>{lastUsedPoints.outputLength}</strong> 字，合計扣除 <strong>{lastUsedPoints.totalUsedPoints}</strong> 點。
                      </div>
                    )}
                    {usageChars !== null && (
                      <div className="text-sm text-gray-500">
                        本次使用字數：{usageChars.toLocaleString()} 字
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-gray-400">尚未生成摘要</div>
                )}
              </CardContent>
            </Card>

            {/* 關鍵字 */}
            <Card>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">關鍵字建議</h3>
                  <button 
                    onClick={copyKeywords}
                    className="btn-green"
                  >
                    複製關鍵字
                  </button>
                </div>

                {keywords.length === 0 ? (
                  <div className="text-sm text-gray-400">尚未產生關鍵字</div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((k, i) => (
                      <span key={i} className="tag-blue">{k}</span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 流量關鍵字（重點） */}
            <Card>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">流量關鍵字</h3>
                  <button 
                    onClick={() =>
                      navigator.clipboard.writeText(trafficKeywords.join('\n'))
                    }
                    className="btn-emerald"
                  >
                    複製流量關鍵字
                  </button>
                </div>

                {trafficKeywords.length === 0 ? (
                  <div className="text-sm text-gray-400">
                    尚未產生流量關鍵字
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


import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { buildSEO } from '../../lib/seo'
import SectionHeader from '../../components/SectionHeader'
import { config } from '../../config'
import { useDailyLimit } from '@/hooks/useDailyLimit'
import UpgradeModal from '@/components/UpgradeModal'
import UsageMeter from '@/components/UsageMeter'
import CreditUsageNotice from '@/components/CreditUsageNotice'
import CreditStatusBar, { updateUsedCharsAfterSuccess } from '@/components/CreditStatusBar'
import { useAuthCredits } from '@/hooks/useAuthCredits'
import { useCreditCheck } from '@/hooks/useCreditCheck'

// 方案常數定義（只存字數，不寫死篇數）
const PLANS = {
  free: {
    name: '免費方案',
    nameEn: 'Free Plan',
    price: 0,
    monthlyQuota: 10000, // 總可用字數（不限月份）
  },
  plan99: {
    name: '點數方案',
    nameEn: 'Point Plan',
    price: 99,
    monthlyQuota: 100000, // 購買字數（點數）
  },
  plan199: {
    name: '點數方案',
    nameEn: 'Point Plan',
    price: 199,
    monthlyQuota: 300000, // 購買字數（點數）
  },
};

// 範例文章字數基準（僅用於顯示換算，不是限制）
const EXAMPLE_ARTICLE_LENGTH = 2500;

// 計算約可摘要篇數（四捨五入）
function calculateEstimatedArticles(monthlyQuota: number): number {
  return Math.round(monthlyQuota / EXAMPLE_ARTICLE_LENGTH);
}

const seo = buildSEO({
  title: 'AI 摘要工具',
  description: '貼上文章內容，AI 自動生成摘要與關鍵字。支援繁中 / 英文切換，簡單快速抓重點。',
  url: 'https://pomodoro-app-eight-rouge.vercel.app/summary',
  image: '/seo/summary-tool.png',
})

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

export default function SummaryPage() {
  const navigate = useNavigate()
  const [lang, setLang] = useState<'zh-tw' | 'en'>('zh-tw')
  const t = LANG_TEXT[lang]

  // 🔒 每日限制僅用於顯示統計，不影響升級彈窗判斷
  const limit = useDailyLimit("summary", 5)

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [error, setError] = useState('')
  const [isQuotaExhausted, setIsQuotaExhausted] = useState(false) // 追蹤 403 狀態
  const [showInsufficientQuotaModal, setShowInsufficientQuotaModal] = useState(false) // 字數不足提示視窗

  // 使用 useAuthCredits Hook 自動取得並更新剩餘點數
  const { remainingChars, loading: creditsLoading, refresh: refreshCredits } = useAuthCredits()
  
  // 使用共用的扣點檢查邏輯
  const creditCheck = useCreditCheck(input.length)

  // 監聽 localStorage 變化，確保點數更新後重新計算
  useEffect(() => {
    if (remainingChars !== null) return // 登入狀態不需要監聽 localStorage

    const handleStorageChange = () => {
      // 觸發重新渲染以更新 creditCheck
      // creditCheck 會在每次渲染時重新計算，所以這裡只需要觸發更新
      const event = new Event('localStorageUpdate')
      window.dispatchEvent(event)
    }

    window.addEventListener('localStorageUpdate', handleStorageChange)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('localStorageUpdate', handleStorageChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [remainingChars])

  // 自動偵測輸入文字的語言
  function detectLanguage(text: string): 'zh-TW' | 'en' {
    const chineseRegex = /[\u4e00-\u9fa5]/
    return chineseRegex.test(text) ? 'zh-TW' : 'en'
  }

  const handleSummary = async () => {
    if (!input.trim()) {
      setError(lang === 'zh-tw' ? '請貼上文章內容' : 'Please paste article content')
      return
    }

    // 🔒 步驟 1：計算本次輸入字數
    const inputChars = input.length

    // 🔒 步驟 2：取得當前剩餘點數和相關數值（用於偵錯顯示）
    const currentRemainingPoints = creditCheck.remainingChars
    const totalChars = 10000 // 試用總額
    const usedChars = totalChars - currentRemainingPoints

    // 🔍 偵錯顯示：在檢查前顯示所有關鍵數值
    console.log('🔍 [摘要扣點檢查] 關鍵數值：', {
      totalChars: totalChars.toLocaleString(),
      usedChars: usedChars.toLocaleString(),
      remainingChars: currentRemainingPoints.toLocaleString(),
      inputChars: inputChars.toLocaleString(),
      willRemainAfter: (currentRemainingPoints - inputChars).toLocaleString(),
    })

    // 🔒 步驟 3：檢查扣點後是否會小於 0（remainingChars - inputChars < 0）
    // 🧩 收尾 1：點數不足時，按鈕維持可點但不觸發 API
    if (currentRemainingPoints - inputChars < 0) {
      const whyUpgrade = currentRemainingPoints === 0 
        ? 'remaining===0' 
        : 'notEnoughForThisRun'
      
      console.log('⚠️ [點數不足] 原因：', whyUpgrade, {
        remainingChars: currentRemainingPoints,
        inputChars: inputChars,
        willRemainAfter: currentRemainingPoints - inputChars,
      })

      // 🧩 收尾 1：只有當 remainingPoints === 0 時才顯示升級彈窗
      // 若 remainingPoints > 0 但 < inputChars，只顯示錯誤訊息，不顯示彈窗，不呼叫 API
      if (currentRemainingPoints === 0) {
        // 剩餘點數 = 0 → 顯示升級提示（但標註未開放購買）
        setIsQuotaExhausted(true)
        setShowInsufficientQuotaModal(true)
        setError(lang === 'zh-tw' 
          ? '免費試用額度已使用完畢'
          : 'Free trial quota exhausted')
      } else {
        // 剩餘點數 > 0 但不足 → 只顯示錯誤訊息，不顯示彈窗，不呼叫 API
        setError(lang === 'zh-tw' 
          ? `剩餘字數不足（需要 ${inputChars.toLocaleString()} 字，僅剩 ${currentRemainingPoints.toLocaleString()} 字）`
          : `Insufficient credits (need ${inputChars.toLocaleString()} chars, only ${currentRemainingPoints.toLocaleString()} remaining)`)
        // 不設置 setIsQuotaExhausted 和 setShowInsufficientQuotaModal，避免顯示彈窗
      }
      // 絕對不可送出 API 請求
      return
    }

    // 🔒 步驟 4：字數足夠 → 才呼叫摘要 API（扣點在 API 成功後才執行）
    console.log('✅ [檢查通過] 字數足夠，準備呼叫摘要 API', {
      remainingChars: currentRemainingPoints.toLocaleString(),
      inputChars: inputChars.toLocaleString(),
      willRemainAfter: (currentRemainingPoints - inputChars).toLocaleString(),
    })

    // 🔒 步驟 4：remainingPoints > 0 且字數足夠 → 直接呼叫摘要 API
    limit.addOne()

    setError('')
    setLoading(true)
    setSummary('')
    setKeywords([])
    // 確保在 API 調用前不會顯示升級提示
    setIsQuotaExhausted(false)
    setShowInsufficientQuotaModal(false)

    try {
      // 自動偵測輸入文字的語言
      const detectedLang = detectLanguage(input)

      // 檢查環境變數並使用 config
      if (!config.summaryFunctionUrl) {
        throw new Error('SUMMARY FUNCTION URL 不存在，請確認環境變數 VITE_SUMMARY_FUNCTION_URL 已於 Vercel 設定');
      }

      if (!config.supabaseAnonKey) {
        throw new Error('VITE_SUPABASE_ANON_KEY 不存在，請確認環境變數已於 Vercel 設定');
      }

      console.log('🚀 呼叫摘要 API：', config.summaryFunctionUrl);
      console.log('🔑 環境變數檢查：', {
        summaryFunctionUrl: config.summaryFunctionUrl ? '✅ SET' : '❌ UNDEFINED',
        supabaseAnonKey: config.supabaseAnonKey ? '✅ SET' : '❌ UNDEFINED',
      });

      const res = await fetch(
        config.summaryFunctionUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.supabaseAnonKey}`,  // ⭐ 最重要：避免 401
          },
          body: JSON.stringify({ 
            content: input,
            lang: detectedLang, // 自動偵測的語言
          }),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        // 🔒 步驟 5：只有在 API 回傳 403 錯誤時，才顯示升級提示
        // 🧩 收尾 2：只有當 remainingChars === 0 時才顯示升級彈窗
        if (res.status === 403 && (data.error === 'INSUFFICIENT_CREDITS' || data.error === 'NEED_PURCHASE')) {
          console.log('⚠️ [API 403 錯誤] 後端回傳點數不足：', {
            error: data.error,
            remainingChars: currentRemainingPoints,
            inputChars: inputChars,
            whyUpgrade: 'apiReturned403',
          })
          
          // 重新取得最新剩餘點數
          await refreshCredits()
          
          // 🧩 收尾 2：只有當 remainingChars === 0 時才顯示升級彈窗
          // refreshCredits 會更新 remainingChars，但由於是異步的，我們檢查當前值
          // 如果當前 remainingChars === 0，才顯示升級彈窗
          if (currentRemainingPoints === 0) {
            setIsQuotaExhausted(true)
            setShowInsufficientQuotaModal(true)
            setError(lang === 'zh-tw' 
              ? '免費試用額度已使用完畢'
              : 'Free trial quota exhausted')
          } else {
            // 剩餘點數 > 0 但 API 回傳 403，只顯示錯誤訊息，不顯示彈窗
            setError(lang === 'zh-tw' 
              ? '點數不足，請減少輸入字數'
              : 'Insufficient credits, please reduce input length')
          }
          // 不要清空使用者貼上的文章內容
          return
        }
        
        // 其他錯誤
        setIsQuotaExhausted(false)
        throw new Error(data.error || data.message || '摘要失敗')
      }

      setSummary(data.summary)
      setKeywords(data.keywords)
      
      // 🔒 步驟 5：摘要成功後 → 才扣點（確認要執行摘要後才扣點）
      // 從 API 回傳本次實際扣點數
      // API 可能回傳：data.cost, data.deducted, data.usedChars 或使用 input.length 作為預設
      const actualCost = data.cost ?? data.deducted ?? data.usedChars ?? inputChars
      
      // 🔍 偵錯顯示：扣點前後的數值
      console.log('💰 [扣點執行] 摘要成功，開始扣點：', {
        actualCost: actualCost.toLocaleString(),
        beforeRemaining: currentRemainingPoints.toLocaleString(),
        afterRemaining: (currentRemainingPoints - actualCost).toLocaleString(),
      })
      
      // 🔒 步驟 6：前端即時更新點數
      // 先更新未登入狀態的 localStorage（使用實際扣點數）
      updateUsedCharsAfterSuccess(actualCost)
      
      // 登入狀態：使用 refreshCredits 來更新點數（會自動更新 useAuthCredits 的狀態）
      // 這會從後端取得最新的 remainingChars（已扣點後）
      await refreshCredits()
      
      // 🔒 步驟 7：確保點數完全同步
      // refreshCredits 會更新 remainingChars，creditCheck 會在下一次渲染時自動重新計算
      // 不需要手動更新，因為 useAuthCredits 和 useCreditCheck 會自動同步
      
      console.log('✅ [扣點完成] 點數已更新')
      
      // 清除錯誤訊息和 403 狀態（摘要成功）
      setError('')
      setIsQuotaExhausted(false)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text)
    alert(lang === 'zh-tw' ? '已複製！' : 'Copied!')
  }

  const copySummary = () => {
    if (summary) {
      copyText(summary)
    }
  }

  const copyKeywords = () => {
    if (keywords.length > 0) {
      copyText(keywords.join(', '))
    }
  }

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
      </Helmet>
      
      {/* 🔒 字數不足升級彈窗 - 統一使用 UpgradeModal，僅在 remainingChars <= 0 時顯示 */}
      <UpgradeModal
        isOpen={showInsufficientQuotaModal}
        onClose={() => setShowInsufficientQuotaModal(false)}
        requiredChars={input.length}
        remainingChars={remainingChars || 0}
        lang={lang}
      />
      
      {/* ===== Container ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 lg:p-8 bg-[#EFF5FF] min-h-screen">
        
        {/* 語系選擇 */}
        <div className="flex justify-end mb-4 lg:col-span-2">
          <div className="flex flex-col items-end">
            <label className="text-sm text-gray-600 mb-1">
              🌐 選擇語言 / Choose Language
            </label>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as any)}
              className="w-[150px] p-2 border rounded-lg bg-white shadow-sm"
            >
              <option value="zh-tw">繁體中文</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
        
        {/* ===== 左側：輸入 ===== */}
        <div className="shadow-md border rounded-2xl p-5 bg-white transition">
          <SectionHeader title={t.inputTitle} />

          <textarea
            className="w-full h-[380px] bg-gray-50 border rounded-xl p-3 focus:ring-2 focus:ring-blue-500"
            placeholder={t.placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          {/* 字數統計（僅顯示字數，扣點提示由 CreditUsageNotice 統一處理） */}
          {input.length > 0 && (
            <div className="mt-2">
              <div className="text-xs text-gray-500">
                {lang === 'zh-tw' 
                  ? `本篇文章字數：${input.length.toLocaleString()} 字`
                  : `Article length: ${input.length.toLocaleString()} characters`}
              </div>
            </div>
          )}

          {/* 用量顯示元件（UsageMeter） */}
          {remainingChars !== null && (
            <UsageMeter
              currentInput={input.length}
              remainingChars={remainingChars}
              planId="free"
              lang={lang}
              showInsufficientModal={showInsufficientQuotaModal}
              onCloseModal={() => setShowInsufficientQuotaModal(false)}
            />
          )}

          {/* 點數顯示區塊 - 僅在登入狀態且已載入完成時顯示 */}
          {remainingChars !== null && (
            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-sm font-semibold text-gray-900 mb-2">
                {lang === 'zh-tw' 
                  ? `目前可用點數：${remainingChars.toLocaleString()} 字`
                  : `Available Credits: ${remainingChars.toLocaleString()} characters`}
              </p>
              <p className="text-xs text-gray-500">
                {lang === 'zh-tw' 
                  ? '本次輸入字數：' + input.length.toLocaleString() + ' 字'
                  : 'Current Input: ' + input.length.toLocaleString() + ' characters'}
              </p>
              {/* 扣點提示已統一由 CreditUsageNotice 元件處理 */}
            </div>
          )}

          {/* 🧩 收尾 2：剩餘點數 = 0 才顯示「升級提示（未開放）」 */}
          {/* 只有在點數完全用完（=== 0）時才顯示升級提示 */}
          {remainingChars !== null && remainingChars === 0 && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-4 space-y-3">
              <div className="text-red-700 text-sm leading-relaxed">
                <p className="font-semibold mb-2">
                  {lang === 'zh-tw' 
                    ? '⚠️ 免費試用額度已用完'
                    : '⚠️ Free trial quota exhausted'}
                </p>
                <p>
                  {lang === 'zh-tw' 
                    ? '您已完成本次免費試用（10,000 字）。目前僅開放試用，購買功能尚未開放。'
                    : 'You have completed the free trial (10,000 characters). Currently only trial is available, purchase function is not yet open.'}
                </p>
              </div>

              {/* 🧩 收尾 2：標註「尚未開放購買」，不可出現付款、結帳、信用卡等字樣 */}
              <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700 text-center">
                {lang === 'zh-tw' ? '⚠️ 目前僅開放試用，購買功能尚未開放' : '⚠️ Currently only trial is available, purchase function is not yet open'}
              </div>
              <button
                onClick={() => navigate('/pricing')}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                title={lang === 'zh-tw' ? '目前僅開放試用，購買功能尚未開放' : 'Currently only trial is available, purchase function is not yet open'}
              >
                {lang === 'zh-tw' ? '查看方案（尚未開放購買）' : 'View Plans (Purchase Not Available)'}
              </button>

              {/* 消保安全免責說明 */}
              <p className="text-[10px] text-gray-400 text-center pt-2 border-t border-gray-200">
                ※ {lang === 'zh-tw' 
                  ? '字數點數以實際頁面說明為準'
                  : 'Character points are subject to actual page description'}
              </p>
            </div>
          )}

          <div className="mt-4"></div>
          <div className="space-y-3">
            {/* 共用狀態列元件 */}
            <CreditStatusBar
              inputChars={input.length}
              isLoading={loading}
              featureName="summary"
              lang={lang}
            />

            {/* 一鍵摘要按鈕 */}
            {(() => {
              // 🧩 收尾 1：按鈕維持可點，不因點數不足而 disabled
              // 只有 loading 或 inputChars === 0 時才 disabled
              // 點數不足時按鈕仍可點擊，但點擊後只顯示錯誤訊息，不觸發 API
              const inputChars = input.length
              const isButtonDisabled = loading || inputChars === 0
              
              // 🧩 收尾 1：按鈕文字（不因點數不足而改變，維持可點狀態）
              let buttonText = loading ? t.loading : t.btn
              if (inputChars === 0 && !loading) {
                buttonText = lang === 'zh-tw' ? '請先輸入內容' : 'Please enter content'
              }
              
              // Hover 提示文字
              const tooltipText = inputChars === 0
                ? (lang === 'zh-tw' ? '請先輸入內容' : 'Please enter content')
                : ''
              
              return (
                <div className="relative">
                  <button
                    onClick={handleSummary}
                    disabled={isButtonDisabled}
                    title={tooltipText}
                    className={`w-full font-bold py-3 sm:py-4 px-3 sm:px-4 rounded-xl transition-all duration-200 transform flex items-center justify-center gap-2 ${
                      isButtonDisabled
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-md'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 cursor-pointer shadow-md hover:shadow-lg hover:scale-105 active:scale-95'
                    }`}
                    style={
                      !isButtonDisabled
                        ? {
                            color: '#ffffff',
                          }
                        : undefined
                    }
                  >
                    {loading && (
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {buttonText}
                  </button>
                </div>
              )
            })()}

            {/* 額度不足時的提示文字（顯示在按鈕下方，不惹怒版） */}
            {creditCheck.remainingChars <= 0 && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-2">
                  {lang === 'zh-tw' 
                    ? '你已完成本次免費試用（10,000 字）。\n目前摘要功能仍可查看已產生內容。'
                    : 'You\'ve reached the free trial limit (10,000 characters).\nYou can still view previously generated summaries.'}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {lang === 'zh-tw' 
                    ? '💡 付費方案即將開放，敬請期待。'
                    : '💡 Paid plans will be available soon.'}
                </p>
              </div>
            )}

            {/* 字數計算方式說明 */}
            {lang === 'zh-tw' && (
              <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-4 space-y-3">
                <h3 className="font-semibold text-blue-900 text-sm mb-2">
                  📌 字數計算方式說明
                </h3>
                
                <div className="text-xs text-blue-800 space-y-2 leading-relaxed">
                  <p>
                    每次使用時，系統會依「實際輸入的文字字數」扣除點數。
                  </p>
                  
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <p className="font-medium mb-1 text-blue-900">範例說明：</p>
                    <ul className="list-disc ml-4 space-y-0.5 text-blue-700">
                      <li>輸入 2,500 字文章摘要 → 扣 2,500 字</li>
                      <li>解題輸入 300 字題目 → 扣 300 字</li>
                    </ul>
                  </div>
                  
                  <p className="font-medium text-blue-900">
                    字數為一次性點數，不限使用期限，用完為止。
                  </p>
                </div>
              </div>
            )}
            
            {/* 英文版本的簡化說明（維持原有） */}
            {lang === 'en' && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs text-yellow-800">
              <p className="font-semibold">
                {t.freeLimitTitle}
              </p>
              <p className="mt-1 text-[11px]">
                {t.freeLimitSub}
              </p>
            </div>
            )}
          </div>

          {error && (
            <p className="mt-3 p-3 bg-red-100 border border-red-300 text-red-600 rounded">
              {error}
            </p>
          )}
        </div>

        {/* ===== 右側：摘要 + 關鍵字 ===== */}
        <div className="flex flex-col gap-6">

          {/* 摘要區塊 */}
          <div className="shadow-md border rounded-2xl p-5 bg-white transition">
            <SectionHeader
              title={t.summaryTitle}
              actionLabel={t.copySummary}
              onAction={copySummary}
            />

            <div className="text-gray-700 leading-7 whitespace-pre-line">
              {summary || (lang === 'zh-tw' ? '摘要內容將顯示於此' : 'Summary content will appear here')}
            </div>
          </div>

          {/* 關鍵字 */}
          <div className="shadow-md border rounded-2xl p-5 bg-white transition">
            <SectionHeader
              title={t.keywordTitle}
              actionLabel={t.copyKeywords}
              onAction={copyKeywords}
            />

            {keywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {keywords.map((k, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-blue-100 text-blue-700 border border-blue-300 rounded-full text-sm"
                  >
                    #{k}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">{t.pending}</p>
            )}
          </div>

          {/* ===== 方案說明區塊（已改為點數制） ===== */}
          <div className="shadow-md border rounded-2xl p-5 bg-white transition">
            <SectionHeader title={lang === 'zh-tw' ? '💳 字數點數方案' : '💳 Character Point Plans'} />

            {/* Your Status 區塊 */}
            {!creditsLoading && remainingChars !== null && (
              <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  {lang === 'zh-tw' ? '您的狀態：' : 'Your Status:'}
                </p>
                {remainingChars > 0 ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✔</span>
                      <span className="text-sm font-medium text-gray-900">
                        {lang === 'zh-tw' ? '可使用' : 'Available'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 ml-6">
                      {lang === 'zh-tw' 
                        ? `剩餘：${remainingChars.toLocaleString()} 字`
                        : `Remaining: ${remainingChars.toLocaleString()} characters`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-red-600">⚠</span>
                      <span className="text-sm font-medium text-gray-900">
                        {lang === 'zh-tw' ? '無可用點數' : 'No credits available'}
                      </span>
                    </div>
                    {/* 免費額度用完時不顯示購買按鈕 */}
                    {false && (
                      <button
                        onClick={() => navigate('/pricing')}
                        className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors"
                      >
                        {lang === 'zh-tw' ? '購買點數' : 'Buy Credits'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
            {creditsLoading && (
              <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-xs text-gray-500">
                  {lang === 'zh-tw' ? '載入中...' : 'Loading...'}
                </p>
              </div>
            )}

            <div className="space-y-4">
              {/* 免費方案 */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {lang === 'zh-tw' ? '免費體驗' : 'Free Trial'}
                  </h3>
                  <p className="text-lg font-bold text-gray-900">
                    {PLANS.free.monthlyQuota.toLocaleString()} 字
                  </p>
                </div>

                <div className="text-xs text-gray-600 space-y-1">
                  <p>📌 {lang === 'zh-tw' ? '不需信用卡' : 'No credit card required'}</p>
                  <p>📌 {lang === 'zh-tw' ? '不限使用期限' : 'No expiration date'}</p>
                  <p>📌 {lang === 'zh-tw' ? '摘要與作業解題共用' : 'Shared for summary and homework'}</p>
                </div>
              </div>

              {/* 99 元方案 */}
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <div className="mb-3">
                  <h3 className="font-semibold text-blue-900 mb-1">
                    {lang === 'zh-tw' ? `NT$${PLANS.plan99.price} 方案` : `NT$${PLANS.plan99.price} Plan`}
                  </h3>
                  <p className="text-lg font-bold text-blue-900">
                    100,000 字
                  </p>
                </div>

                <div className="text-xs text-blue-700 space-y-1">
                  <p>📌 {lang === 'zh-tw' ? '一次購買' : 'One-time purchase'}</p>
                  <p>📌 {lang === 'zh-tw' ? '不自動續費' : 'No auto-renewal'}</p>
                  <p>📌 {lang === 'zh-tw' ? '不限使用期限' : 'No expiration date'}</p>
                </div>
              </div>

              {/* 199 元方案 */}
              <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                <div className="mb-3">
                  <h3 className="font-semibold text-purple-900 mb-1">
                    {lang === 'zh-tw' ? `NT$${PLANS.plan199.price} 方案` : `NT$${PLANS.plan199.price} Plan`}
                  </h3>
                  <p className="text-lg font-bold text-purple-900">
                    300,000 字
                  </p>
                </div>

                <div className="text-xs text-purple-700 space-y-1">
                  <p>📌 {lang === 'zh-tw' ? '一次購買' : 'One-time purchase'}</p>
                  <p>📌 {lang === 'zh-tw' ? '不自動續費' : 'No auto-renewal'}</p>
                  <p>📌 {lang === 'zh-tw' ? '不限使用期限' : 'No expiration date'}</p>
                </div>
              </div>

              {/* 法律安全註記 */}
              <div className="pt-3 border-t border-gray-200">
                <p className="text-[10px] text-gray-400 text-center">
                  ※ {lang === 'zh-tw' ? '所有功能共用同一字數池，字數永久有效' : 'All features share the same character pool, characters never expire'}
                </p>
              </div>
            </div>
          </div>

          {/* ===== 未來功能（預告） ===== */}
          <div className="shadow-md border rounded-2xl p-5 bg-white transition">
            <SectionHeader title={t.previewTitle} />

            <ul className="list-disc ml-5 text-gray-700 leading-7">
              {t.previewList.map((txt, i) => (
                <li key={i}>{txt}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

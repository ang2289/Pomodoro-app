import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate, Link } from 'react-router-dom'
import { buildSEO } from '../../lib/seo'
import SectionHeader from '../../components/SectionHeader'
import { config, PLANS, FREE_TRIAL_QUOTA } from '../../config'
import { useDailyLimit } from '@/hooks/useDailyLimit'
import UpgradeModal from '@/components/UpgradeModal'
import UsageMeter from '@/components/UsageMeter'
import CreditUsageNotice from '@/components/CreditUsageNotice'
import CreditStatusBar, { updateUsedCharsAfterSuccess } from '@/components/CreditStatusBar'
import { applyCreditFromApiResponse } from '@/utils/creditCalculator'
import { useAuthCredits } from '@/hooks/useAuthCredits'
import { useCreditCheck } from '@/hooks/useCreditCheck'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/utils/supabaseClient'
import TwoColumnToolLayout from '@/components/TwoColumnToolLayout'
import PricingPlanCard from '@/components/PricingPlanCard'

// 方案常數定義已移至 src/config.ts（單一來源）

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
  // 預設示意關鍵字（初次進入頁面時顯示）
  const defaultKeywords = [
    '重點摘要',
    '關鍵事件',
    '核心人物',
    '時間脈絡',
    '後續影響'
  ]
  const [keywords, setKeywords] = useState<string[]>(defaultKeywords)
  const [error, setError] = useState('')
  const [isQuotaExhausted, setIsQuotaExhausted] = useState(false) // 追蹤 403 狀態
  const [showInsufficientQuotaModal, setShowInsufficientQuotaModal] = useState(false) // 字數不足提示視窗
  const [isTrialExpired, setIsTrialExpired] = useState(false) // 追蹤體驗是否過期

  // 本次使用點數資訊
  const [lastUsedPoints, setLastUsedPoints] = useState<{
    inputLength: number
    outputLength: number
    totalUsedPoints: number
  } | null>(null)

  // 使用 useAuthCredits Hook 自動取得並更新剩餘點數
  const { remainingChars, loading: creditsLoading, refresh: refreshCredits } = useAuthCredits()
  const [showCreditInfo, setShowCreditInfo] = useState(false)
  const totalTrialChars = PLANS.free.monthlyQuota
  
  // 使用共用的扣點檢查邏輯
  const creditCheck = useCreditCheck(input.length)

  // 🔐 登入狀態檢查（僅用於檢查是否登入）
  const { user } = useAuth()

  // 監聽 localStorage 變化，確保點數更新後重新計算
  // 注意：此 useEffect 只設置事件監聽器，不會 set state，避免無限循環
  useEffect(() => {
    if (remainingChars !== null) return // 登入狀態不需要監聽 localStorage

    const handleStorageChange = () => {
      // 觸發重新渲染以更新 creditCheck
      // creditCheck 會在每次渲染時重新計算，所以這裡只需要觸發更新
      // 使用 requestAnimationFrame 避免過度渲染
      requestAnimationFrame(() => {
        const event = new Event('localStorageUpdate')
        window.dispatchEvent(event)
      })
    }

    window.addEventListener('localStorageUpdate', handleStorageChange)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('localStorageUpdate', handleStorageChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [remainingChars]) // 只在 remainingChars 改變時重新設置監聽器（登入/登出時）

  // 自動偵測輸入文字的語言
  function detectLanguage(text: string): 'zh-TW' | 'en' {
    const chineseRegex = /[\u4e00-\u9fa5]/
    return chineseRegex.test(text) ? 'zh-TW' : 'en'
  }

  // 從摘要文字自動產生關鍵字（fallback 邏輯）
  function generateKeywordsFromSummary(summaryText: string, maxKeywords: number = 5): string[] {
    if (!summaryText || summaryText.trim().length === 0) {
      return []
    }

    // 移除標點符號和特殊字符，保留中文、英文、數字
    const cleanedText = summaryText
      .replace(/[。，、；：！？「」『』（）【】《》〈〉〔〕［］｛｝【】『』「」""''（）()\[\]{}.,;:!?\-_=+*&^%$#@~`|\\/<>]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    if (cleanedText.length === 0) {
      return []
    }

    // 判斷是否為中文
    const isChinese = /[\u4e00-\u9fa5]/.test(cleanedText)
    
    let words: string[] = []

    if (isChinese) {
      // 中文處理：提取 2-4 字的詞組
      const chineseWords: string[] = []
      const textArray = cleanedText.split('')
      
      // 提取 2 字詞
      for (let i = 0; i < textArray.length - 1; i++) {
        const word = textArray[i] + textArray[i + 1]
        if (/[\u4e00-\u9fa5]{2}/.test(word)) {
          chineseWords.push(word)
        }
      }
      
      // 提取 3 字詞
      for (let i = 0; i < textArray.length - 2; i++) {
        const word = textArray[i] + textArray[i + 1] + textArray[i + 2]
        if (/[\u4e00-\u9fa5]{3}/.test(word)) {
          chineseWords.push(word)
        }
      }
      
      words = chineseWords
    } else {
      // 英文處理：按空格分割，過濾過短詞
      words = cleanedText
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 2) // 過濾 <= 2 字符的詞
        .filter(word => !/^\d+$/.test(word)) // 過濾純數字
    }

    // 統計詞頻
    const wordFreq: Record<string, number> = {}
    words.forEach(word => {
      if (word.length > 1) { // 確保長度 > 1
        wordFreq[word] = (wordFreq[word] || 0) + 1
      }
    })

    // 按頻率排序，取前 maxKeywords 個
    const sortedWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1]) // 按頻率降序
      .slice(0, maxKeywords)
      .map(([word]) => word)

    return sortedWords
  }

  const handleSummary = async () => {
    if (!input.trim()) {
      setError(lang === 'zh-tw' ? '請貼上文章內容' : 'Please paste article content')
      return
    }

    // 🔒 步驟 1：計算本次輸入字數
    const inputChars = input.length

    // 🔒 步驟 2：判斷是否為訪客試用模式（未登入或 remainingChars === null）
    const isGuestMode = !user || remainingChars === null

    // 🔒 步驟 3：只有在已登入且 remainingChars 為數字時才檢查點數
    if (!isGuestMode) {
      // 已登入狀態：進行點數檢查
      const currentRemainingPoints = creditCheck.remainingChars
      const totalChars = FREE_TRIAL_QUOTA // 試用總額（從共用配置讀取）
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
    } else {
      // 訪客試用模式：檢查 localStorage 中的剩餘點數
      const FREE_REMAINING_KEY = 'free_characters_remaining'
      // FREE_TRIAL_QUOTA 已從共用配置導入
      
      // 從 localStorage 讀取剩餘點數
      let guestRemainingChars = FREE_TRIAL_QUOTA
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(FREE_REMAINING_KEY)
        if (saved !== null) {
          guestRemainingChars = Math.max(0, parseInt(saved, 10))
        } else {
          // 如果沒有值，初始化為 10,000
          localStorage.setItem(FREE_REMAINING_KEY, FREE_TRIAL_QUOTA.toString())
          guestRemainingChars = FREE_TRIAL_QUOTA
        }
      }
      
      console.log('✅ [訪客試用模式] 檢查剩餘點數', {
        isGuestMode: true,
        inputChars: inputChars.toLocaleString(),
        guestRemainingChars: guestRemainingChars.toLocaleString(),
        willRemainAfter: (guestRemainingChars - inputChars).toLocaleString(),
      })
      
      // 檢查剩餘點數是否 <= 0
      if (guestRemainingChars <= 0) {
        console.log('⚠️ [訪客模式] 訪客免費額度已用完', {
          guestRemainingChars,
        })
        setError(lang === 'zh-tw' 
          ? '免費額度已用完，請登入後繼續使用'
          : 'Free quota exhausted. Please log in to continue')
        return
      }
      
      // 檢查本次輸入是否會超過剩餘點數
      if (guestRemainingChars - inputChars < 0) {
        console.log('⚠️ [訪客模式] 剩餘點數不足', {
          guestRemainingChars,
          inputChars,
          willRemainAfter: guestRemainingChars - inputChars,
        })
        setError(lang === 'zh-tw' 
          ? `剩餘字數不足（需要 ${inputChars.toLocaleString()} 字，僅剩 ${guestRemainingChars.toLocaleString()} 字）。免費額度已用完，請登入後繼續使用`
          : `Insufficient credits (need ${inputChars.toLocaleString()} chars, only ${guestRemainingChars.toLocaleString()} remaining). Free quota exhausted. Please log in to continue`)
        return
      }
      
      console.log('✅ [訪客試用模式] 點數檢查通過，準備執行摘要', {
        guestRemainingChars: guestRemainingChars.toLocaleString(),
        inputChars: inputChars.toLocaleString(),
      })
    }

    // 🔒 步驟 4：remainingPoints > 0 且字數足夠 → 直接呼叫摘要 API
    limit.addOne()

    setError('')
    setLoading(true)
    setSummary('')
    // 不清除 keywords，保留預設示意關鍵字，直到 API 回傳實際關鍵字
    setLastUsedPoints(null) // 清除上次的點數資訊
    // 確保在 API 調用前不會顯示升級提示
    setIsQuotaExhausted(false)
    setShowInsufficientQuotaModal(false)

    // 🔐 登入檢查：已移除，訪客試用模式可直接使用

    try {
      // 自動偵測輸入文字的語言
      const detectedLang = detectLanguage(input)

      // 🔒 統一點數檢查流程（在實際呼叫 Edge Function 前）
      const { checkCreditBeforeApiCall } = await import('@/utils/creditCheck')
      const creditCheckResult = checkCreditBeforeApiCall(remainingChars)
      
      if (!creditCheckResult.allowed) {
        if (creditCheckResult.reason === 'TRIAL_EXPIRED') {
          // 體驗已過期：顯示友善提示，不顯示錯誤訊息
          setIsTrialExpired(true)
          setLoading(false)
          return
        }
        // 其他原因也阻止執行
        setError(lang === 'zh-tw' 
          ? '無法使用此功能，請稍後再試'
          : 'Unable to use this feature. Please try again later')
        setLoading(false)
        return
      }
      
      // 檢查通過，清除體驗過期提示
      setIsTrialExpired(false)

      let data: any = null
      let error: any = null

      // ✅ 根據登入狀態選擇不同的呼叫方式
      if (isGuestMode) {
        // 訪客模式：使用 fetch 直接呼叫，明確傳送 anon key
        console.log('🚀 [訪客模式] 使用 fetch 呼叫 Edge Function：auto-summary', {
          hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
          supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        })

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

        if (!supabaseUrl || !anonKey) {
          throw new Error('Supabase 環境變數未設定')
        }

        const response = await fetch(`${supabaseUrl}/functions/v1/auto-summary`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${anonKey}`,
            'Content-Type': 'application/json',
            'apikey': anonKey,
          },
          body: JSON.stringify({
            content: input,
            lang: detectedLang,
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          let errorMessage = ''
          try {
            const errorJson = JSON.parse(errorText)
            errorMessage = errorJson.error || errorJson.message || errorText
          } catch {
            errorMessage = errorText || `HTTP ${response.status}`
          }
          
          error = {
            message: errorMessage,
            status: response.status,
          }
        } else {
          try {
            data = await response.json()
          } catch (parseError) {
            error = {
              message: 'Failed to parse response',
              status: response.status,
            }
          }
        }
      } else {
        // 已登入模式：使用 supabase.functions.invoke（維持原本邏輯）
        console.log('🚀 [已登入模式] 使用 supabase.functions.invoke 呼叫 Edge Function：auto-summary')

        const invokeResult = await supabase.functions.invoke('auto-summary', {
          body: {
            content: input,
            lang: detectedLang,
          },
        })

        data = invokeResult.data
        error = invokeResult.error
      }
      
      // 🔍 DEBUG: 記錄詳細錯誤資訊
      if (error) {
        console.error('❌ [摘要 API] 詳細錯誤資訊:', {
          error,
          message: error?.message,
          status: error?.status,
          context: error?.context,
          name: error?.name,
        })
      }

      // 🛡️ 統一錯誤處理：使用 Supabase invoke 或 fetch 回傳的 error 物件判斷
      if (error) {
        // 處理點數不足錯誤
        const errorMessage = error.message || String(error) || ''
        if (errorMessage.includes('INSUFFICIENT_CREDITS') || errorMessage.includes('insufficient')) {
          // 訪客模式下不應該出現點數不足錯誤，但保留處理邏輯
          if (!isGuestMode) {
            console.log('⚠️ [API 錯誤] 後端回傳點數不足：', {
              remainingChars: creditCheck.remainingChars,
              inputChars: inputChars,
              whyUpgrade: 'apiReturned403',
            })
            
            // 重新取得最新剩餘點數
            await refreshCredits()
            
            const currentRemainingPoints = creditCheck.remainingChars || 0
            // 只有當 remainingChars === 0 時才顯示升級彈窗
            if (currentRemainingPoints === 0) {
              setIsQuotaExhausted(true)
              setShowInsufficientQuotaModal(true)
              setError(lang === 'zh-tw' 
                ? '免費試用額度已使用完畢'
                : 'Free trial quota exhausted')
            } else {
              // 剩餘點數 > 0 但 API 回傳錯誤，只顯示錯誤訊息，不顯示彈窗
              setError(lang === 'zh-tw' 
                ? '使用額度不足，請減少輸入字數'
                : 'Insufficient usage quota, please reduce input length')
            }
          } else {
            // 訪客模式下出現點數不足錯誤（不應該發生）
            setError(lang === 'zh-tw' ? 'AI 服務暫時異常，請稍後再試' : 'AI service temporarily unavailable, please try again later')
          }
          // 不要清空使用者貼上的文章內容
          setLoading(false)
          return
        }
        
        // 其他錯誤：UI 僅顯示友善錯誤訊息，不顯示 raw error string
        console.error('❌ [摘要 API] 錯誤：', error)
        setIsQuotaExhausted(false)
        setError(lang === 'zh-tw' ? 'AI 服務暫時異常，請稍後再試' : 'AI service temporarily unavailable, please try again later')
        setLoading(false)
        return
      }

      // 🛡️ 防呆：檢查 data 是否為有效物件（不再假設回傳一定是 JSON）
      if (!data || typeof data !== 'object') {
        console.error('❌ [摘要 API] 回傳格式錯誤：data 不是物件', data)
        setError(lang === 'zh-tw' ? 'AI 服務暫時異常，請稍後再試' : 'AI service temporarily unavailable, please try again later')
        setLoading(false)
        return
      }

      // 處理回傳格式：統一讀取 data.result 作為摘要文字（使用多層 fallback）
      const result =
        typeof data?.result === "string"
          ? data.result
          : typeof data?.summary === "string"
            ? data.summary
            : ""

      // 如果 result 為空字串，顯示友善錯誤訊息
      if (!result || result.trim().length === 0) {
        console.error('❌ [摘要 API] 回傳格式錯誤：result 為空', data)
        setError(lang === 'zh-tw' ? '摘要產生失敗，請稍後再試' : 'Summary generation failed, please try again later')
        setLoading(false)
        return
      }

      // result 是摘要文字
      const summaryText = result
      setSummary(summaryText)
      
      // 處理 keywords 陣列（使用多層 fallback）
      let keywordList: string[] = []
      
      // 1. 優先使用 API 回傳的 keywords
      if (Array.isArray(data.keywords) && data.keywords.length > 0) {
        keywordList = data.keywords
      } 
      // 2. 其次使用 API 回傳的 tags
      else if (Array.isArray(data.tags) && data.tags.length > 0) {
        keywordList = data.tags
      }
      // 3. 若 API 未回傳關鍵字，從摘要文字自動產生
      else {
        keywordList = generateKeywordsFromSummary(summaryText, 5)
      }
      
      // 確保 keywordList 中的元素都是字串，並清理
      const cleanKeywordList = keywordList
        .map((k: any) => typeof k === "string" ? k.trim() : String(k).trim())
        .filter((k: string) => k.length > 0)
        .slice(0, 5) // 最多取 5 個
      
      // 只有在有實際關鍵字時才覆蓋預設示意關鍵字
      if (cleanKeywordList.length > 0) {
        setKeywords(cleanKeywordList)
      }
      // 若 API 未回傳關鍵字且自動生成也失敗，保留預設示意關鍵字
      
      // 🔒 步驟 5：摘要成功後 → 計算點數（因為回傳格式只有 result，需要自行計算）
      // 計算輸入和輸出字數
      const inputLength = input.length
      const outputLength = summaryText.length
      const totalUsedPoints = inputLength + outputLength
      
      // ✅ 記錄本次使用點數（用於顯示）
      setLastUsedPoints({
        inputLength,
        outputLength,
        totalUsedPoints,
      })

      // ✅ 更新本地試用點數統計（rxv_trial_summary）
      try {
        if (typeof window !== 'undefined') {
          const TRIAL_KEY = 'rxv_trial_summary'
          const total = totalTrialChars

          let used = 0
          const raw = window.localStorage.getItem(TRIAL_KEY)
          if (raw) {
            try {
              const parsed = JSON.parse(raw)
              if (typeof parsed?.used === 'number') {
                used = parsed.used
              }
            } catch {
              // 解析失敗時忽略，使用預設 0
            }
          }

          // 本次消耗：輸入字數 + 摘要輸出字數
          used = Math.max(0, used + totalUsedPoints)
          if (used > total) used = total

          const remaining = Math.max(0, total - used)

          window.localStorage.setItem(
            TRIAL_KEY,
            JSON.stringify({
              total,
              used,
              remaining,
            }),
          )
        }
      } catch (e) {
        console.warn('⚠️ 無法更新本地試用點數統計 rxv_trial_summary：', e)
      }
      
      // 🔒 步驟 6：前端即時更新點數（僅在已登入狀態下執行）
      if (!isGuestMode) {
        // 判斷是否為本地端環境
        const isLocalhost = typeof window !== 'undefined' && (
          window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1' ||
          window.location.hostname.startsWith('127.') ||
          window.location.hostname.startsWith('192.168.')
        )
        
        // 本地端不扣點，正式網站才扣點
        if (!isLocalhost) {
          // 已登入狀態：進行扣點
          const currentRemainingPoints = creditCheck.remainingChars || 0
          
          // 🔍 偵錯顯示：扣點前後的數值
          console.log('💰 [扣點執行] 摘要成功，開始扣點：', {
            usedPoints: totalUsedPoints.toLocaleString(),
            beforeRemaining: currentRemainingPoints.toLocaleString(),
            afterRemaining: (currentRemainingPoints - totalUsedPoints).toLocaleString(),
          })
          
          // 先更新未登入狀態的 localStorage（使用計算的點數）
          updateUsedCharsAfterSuccess(totalUsedPoints)
          
          // 登入狀態：使用 refreshCredits 來更新點數（會自動更新 useAuthCredits 的狀態）
          // 這會從後端取得最新的 remainingChars（已扣點後）
          await refreshCredits()
          
          // 🔒 步驟 7：確保點數完全同步
          // refreshCredits 會更新 remainingChars，creditCheck 會在下一次渲染時自動重新計算
          // 不需要手動更新，因為 useAuthCredits 和 useCreditCheck 會自動同步
          
          console.log('✅ [扣點完成] 點數已更新')
        } else {
          // 本地端環境：不扣點
          console.log('✅ [本地端模式] 本地端測試模式，不扣點', {
            usedPoints: totalUsedPoints.toLocaleString(),
            hostname: window.location.hostname,
          })
        }
      } else {
        // 訪客試用模式：進行扣點（使用 localStorage）
        const FREE_REMAINING_KEY = 'free_characters_remaining'
        
        // 從 localStorage 讀取當前剩餘點數
        let currentGuestRemaining = FREE_TRIAL_QUOTA // 從共用配置讀取
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem(FREE_REMAINING_KEY)
          if (saved !== null) {
            currentGuestRemaining = Math.max(0, parseInt(saved, 10))
          }
        }
        
        console.log('💰 [訪客模式扣點] 摘要成功，開始扣點：', {
          usedPoints: totalUsedPoints.toLocaleString(),
          beforeRemaining: currentGuestRemaining.toLocaleString(),
          afterRemaining: (currentGuestRemaining - totalUsedPoints).toLocaleString(),
        })
        
        // 判斷是否為本地端環境
        const isLocalhost = typeof window !== 'undefined' && (
          window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1' ||
          window.location.hostname.startsWith('127.') ||
          window.location.hostname.startsWith('192.168.')
        )
        
        // 本地端不扣點，正式網站才扣點
        if (!isLocalhost) {
          // 更新 localStorage 中的剩餘點數
          const newRemaining = Math.max(0, currentGuestRemaining - totalUsedPoints)
          if (typeof window !== 'undefined') {
            localStorage.setItem(FREE_REMAINING_KEY, newRemaining.toString())
            // 觸發自定義事件通知其他組件
            window.dispatchEvent(new Event('localStorageUpdate'))
          }
          
          console.log('✅ [訪客模式] 訪客模式摘要成功，已扣點', {
            usedPoints: totalUsedPoints.toLocaleString(),
            newRemaining: newRemaining.toLocaleString(),
          })
        } else {
          // 本地端環境：不扣點
          console.log('✅ [本地端模式] 本地端測試模式，不扣點', {
            usedPoints: totalUsedPoints.toLocaleString(),
            hostname: window.location.hostname,
          })
        }
      }
      
      // 清除錯誤訊息和 403 狀態（摘要成功）
      setError('')
      setIsQuotaExhausted(false)
    } catch (e: any) {
      // 統一錯誤處理：UI 僅顯示友善錯誤訊息，不顯示 raw error string
      console.error('❌ [摘要 API] 未預期錯誤：', e)
      setError(lang === 'zh-tw' ? 'AI 服務暫時異常，請稍後再試' : 'AI service temporarily unavailable, please try again later')
      // API 失敗時清除點數資訊
      setLastUsedPoints(null)
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
      // 根據語言使用不同的分隔符：中文用「、」，英文用「, 」
      const separator = lang === 'zh-tw' ? '、' : ', '
      copyText(keywords.join(separator))
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
        onClose={() => setShowInsufficientQuotaModal(false)}
        requiredChars={input.length}
        remainingChars={remainingChars || 0}
        lang={lang}
      />
      
      <TwoColumnToolLayout
        left={
          <>
            {/* 輸入框 */}
            <div className="shadow-md border rounded-2xl p-5 bg-white transition">
              <SectionHeader title={t.inputTitle} />
              <textarea
                className="w-full h-[380px] bg-gray-50 border rounded-xl p-3 focus:ring-2 focus:ring-blue-500"
                placeholder={t.placeholder}
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>

            {/* 一鍵摘要按鈕 */}
            {(() => {
              const inputChars = input.length
              const isButtonDisabled = loading || inputChars === 0
              let buttonText = loading ? t.loading : t.btn
              if (inputChars === 0 && !loading) {
                buttonText = lang === 'zh-tw' ? '請先輸入內容' : 'Please enter content'
              }
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

            {/* 使用額度卡片（左欄專屬，只出現一次） */}
            <div className="mt-4">
              <CreditStatusBar
                inputChars={input.length}
                isLoading={loading}
                featureName="summary"
                lang={lang}
              />
            </div>

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
          </>
        }
        right={
          <>
            {/* AI 摘要結果 */}
            <div className="shadow-md border rounded-2xl p-5 bg-white transition">
              <SectionHeader
                title={t.summaryTitle}
                actionLabel={t.copySummary}
                onAction={copySummary}
              />
              <div className="text-gray-700 leading-7 whitespace-pre-line">
                {summary || (lang === 'zh-tw' ? '摘要內容將顯示於此' : 'Summary content will appear here')}
              </div>
              {/* 本次使用額度顯示 */}
              {lastUsedPoints && summary && !loading && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{lang === 'zh-tw' ? '本次使用額度：' : 'Usage This Run:'}</span>
                    <span className="text-purple-600 font-semibold ml-1">{lastUsedPoints.totalUsedPoints.toLocaleString()} {lang === 'zh-tw' ? '字' : 'chars'}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {lang === 'zh-tw' 
                      ? `（輸入 ${lastUsedPoints.inputLength.toLocaleString()} 字 + 回答 ${lastUsedPoints.outputLength.toLocaleString()} 字）`
                      : `(Input: ${lastUsedPoints.inputLength.toLocaleString()} chars + Output: ${lastUsedPoints.outputLength.toLocaleString()} chars)`}
                  </p>
                </div>
              )}
            </div>

            {/* 關鍵字建議卡片（永遠顯示，只要 keywords.length > 0） */}
            {keywords && keywords.length > 0 && (
              <div className="mt-6 shadow-md border rounded-2xl p-5 bg-white transition">
                <SectionHeader
                  title={lang === 'zh-tw' ? '關鍵字建議' : 'Keyword Suggestions'}
                  actionLabel={t.copyKeywords}
                  onAction={copyKeywords}
                />
                <p className="text-xs text-gray-500 mb-3">
                  {lang === 'zh-tw' ? '一鍵複製，適合貼到作業、報告或筆記中' : 'One-click copy, suitable for pasting into assignments, reports, or notes'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {keywords.slice(0, 5).map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-block px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200 hover:bg-blue-100 transition-colors"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 使用方案與可處理字數說明卡片 */}
            <div className="mt-6 shadow-md border rounded-2xl p-5 bg-white transition">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {lang === 'zh-tw' ? '使用方案說明' : 'Usage Plan Information'}
              </h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-medium text-gray-700 mb-1">
                    {lang === 'zh-tw' ? '🆓 免費方案' : '🆓 Free Plan'}
                  </p>
                  <p className="text-gray-600">
                    {lang === 'zh-tw' 
                      ? `可處理字數：${PLANS.free.monthlyQuota.toLocaleString()} 字`
                      : `Processable characters: ${PLANS.free.monthlyQuota.toLocaleString()} chars`}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="font-medium text-blue-700 mb-1">
                    {lang === 'zh-tw' ? '💎 標準方案（NT$99）' : '💎 Standard Plan (NT$99)'}
                  </p>
                  <p className="text-blue-600">
                    {lang === 'zh-tw' 
                      ? `可處理字數：${PLANS.plan99.monthlyQuota.toLocaleString()} 字`
                      : `Processable characters: ${PLANS.plan99.monthlyQuota.toLocaleString()} chars`}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="font-medium text-purple-700 mb-1">
                    {lang === 'zh-tw' ? '🚀 進階方案（NT$199）' : '🚀 Advanced Plan (NT$199)'}
                  </p>
                  <p className="text-purple-600">
                    {lang === 'zh-tw' 
                      ? `可處理字數：${PLANS.plan199.monthlyQuota.toLocaleString()} 字`
                      : `Processable characters: ${PLANS.plan199.monthlyQuota.toLocaleString()} chars`}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200">
                  {lang === 'zh-tw' 
                    ? '※ 本服務依實際輸入與 AI 輸出字數計算使用額度，僅供學習與內容整理輔助使用。'
                    : '※ Usage quota is calculated based on actual input and AI output characters, for learning and content organization assistance only.'}
                </p>
              </div>
            </div>

            {/* 延伸工具說明（純說明，不是功能） */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium mb-1 flex items-center gap-1">
                🧠 延伸 AI 輔助工具說明
              </h3>
              <p className="text-sm text-gray-600">
                若你常整理內容，可搭配本站其他 AI 學習與內容整理輔助工具，
                進一步進行改寫、翻譯或製作簡報。
              </p>
            </div>
          </>
        }
      />
    </div>
  )
}

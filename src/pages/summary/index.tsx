import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSummaryAction } from '@/hooks/useSummaryAction'
import SummaryLayout from './SummaryLayout'
import { supabase } from '@/lib/supabase'

export default function SummaryPage() {
  const navigate = useNavigate()
  const [lang, setLang] = useState<'zh-tw' | 'en'>('zh-tw')
  const [remainingChars, setRemainingChars] = useState<number | null>(null)

  // 登入狀態檢查：頁面載入時檢查是否有 userId
  useEffect(() => {
    const userId = localStorage.getItem('userId')
    if (!userId) {
      // 若不存在，導向登入頁
      navigate('/login')
      return
    }

    // 獲取用戶點數
    const fetchUserCredits = async () => {
      try {
        const { data, error } = await supabase
          .from('user_credits')
          .select('remaining_chars')
          .eq('user_id', userId)
          .single()

        if (error) {
          console.error('[SummaryPage] Fetch credits error:', error)
          return
        }

        if (data) {
          setRemainingChars(data.remaining_chars ?? null)
        }
      } catch (err) {
        console.error('[SummaryPage] Fetch credits error:', err)
      }
    }

    fetchUserCredits()
  }, [navigate])

  const [input, setInput] = useState('')
  const [summary, setSummary] = useState<{ content: string; isPreview?: boolean }>({ content: '' })
  const [inputLength, setInputLength] = useState<number>(0)
  const [outputLength, setOutputLength] = useState<number>(0)
  // 預設示意關鍵字（初次進入頁面時顯示）
  const defaultKeywords = [
    '重點摘要',
    '關鍵事件',
    '核心人物',
    '時間脈絡',
    '後續影響'
  ]
  // ============================================
  // 第一組：keywords（內容理解、內文標籤）
  // 用途：內容理解、內文標籤
  // 適用場景：一鍵複製，適合貼到作業、報告或筆記中
  // ============================================
  const [keywords, setKeywords] = useState<string[]>(defaultKeywords)
  
  // ============================================
  // 第二組：traffic_keywords（SEO、搜尋流量、內容延伸）
  // 用途：SEO、搜尋流量、內容延伸
  // 適用場景：模擬一般人在 Google 搜尋時會實際輸入的完整問題或敘述句
  // ============================================
  // 流量關鍵字（trafficKeywords）- 第二組關鍵字狀態
  // 與內容關鍵字（keywords）完全獨立，不共用 state
  // ⚠️ 流量關鍵字由 Supabase Edge Function + Gemini JSON Schema 生成
  // 前端不得再做任何修正、去重或補齊，避免破壞搜尋語意
  // 完全信任後端回傳，不再使用前端生成/修正/補齊/去重
  // 直接從 API 響應中獲取 traffic_keywords，不做任何處理
  // 禁止使用 slice、filter、去重（includes / startsWith）、自行產生、補齊、fallback
  // 不計算使用額度、不影響扣字、不影響免費/付費判斷
  // 不涉及金流、不涉及點數、不涉及額度
  
  // ⚠️ 已停用預設 placeholder 關鍵字，改為空陣列
  // 示範用 placeholder 關鍵字已移除，避免與後端回傳混淆
  const [trafficKeywords, setTrafficKeywords] = useState<string[]>([])
  const [trafficKeywordsReady, setTrafficKeywordsReady] = useState<boolean>(false)
  
  // 高轉換關鍵字（conversionKeywords）- 第二組關鍵字狀態（關鍵字按鈕）
  // ⚠️ 高轉換關鍵字由 Supabase Edge Function + Gemini JSON Schema 生成
  // 前端不得再做任何修正、去重或補齊，避免破壞搜尋語意
  // 完全信任後端回傳，不再使用前端生成/修正/補齊/去重
  // 直接從 API 響應中獲取 conversion_keywords，不做任何處理
  const [conversionKeywords, setConversionKeywords] = useState<string[]>([])
  const [conversionKeywordsReady, setConversionKeywordsReady] = useState<boolean>(false)
  
  const [error, setError] = useState('')
  
  // 本次使用字數（含 AI 回覆）- 直接使用後端回傳的 usage_chars
  const [usageChars, setUsageChars] = useState<number | null>(null)

  // ⚠️ 絕對不能因為字數為 0 而 return / disable / 擋畫面
  // 頁面一進來就 render 完整 UI
  // ✅ 所有阻擋只能發生在「使用者按下摘要之後」

  // 使用 useSummaryAction hook 取得 runSummary 函式和相關狀態
  const { runSummary, loading, error: summaryError } = useSummaryAction()

  // 包裝 runSummary 以傳入 input，並處理響應結果
  const handleSummary = async () => {
    setInputLength(input.length)
    const result = await runSummary(input)
    if (result) {
      // 更新 summary
      if (result.summary) {
        setSummary({ content: result.summary })
        setOutputLength(result.summary.length)
      }
      // 更新 keywords
      if (result.keywords && Array.isArray(result.keywords)) {
        setKeywords(result.keywords)
      }
      // 更新 trafficKeywords
      if (result.traffic_keywords && Array.isArray(result.traffic_keywords)) {
        setTrafficKeywords(result.traffic_keywords)
        setTrafficKeywordsReady(true)
      }
      // 更新 remaining_chars（如果 API 有返回）
      if (typeof result.remaining_chars === 'number') {
        setRemainingChars(result.remaining_chars)
      }
      // 注意：這裡不更新 usageChars，因為規格中沒有要求
    }
  }

  // 同步 error 到本地 state
  useEffect(() => {
    if (summaryError) {
      setError(summaryError)
    }
  }, [summaryError])

  // 計算已用點數（初始 10000 - 剩餘點數）
  const INITIAL_CREDITS = 10000
  const usedChars = remainingChars !== null ? INITIAL_CREDITS - remainingChars : 0

  return (
    <SummaryLayout
      lang={lang}
      showInsufficientQuotaModal={false}
      onCloseInsufficientQuotaModal={() => {}}
      showInsufficientCreditsPrompt={false}
      input={input}
      onInputChange={(value) => setInput(value)}
      loading={loading}
      onSubmit={handleSummary}
      remainingChars={remainingChars}
      summary={summary}
      lastUsedPoints={inputLength > 0 || outputLength > 0 ? {
        inputLength,
        outputLength,
        totalUsedPoints: inputLength + outputLength
      } : null}
      usageChars={usageChars}
      usedChars={usedChars}
      keywords={keywords}
      trafficKeywords={trafficKeywords}
      trafficKeywordsReady={trafficKeywordsReady}
      highIntentContent={[]}
      conversionKeywords={conversionKeywords}
      conversionKeywordsReady={conversionKeywordsReady}
      error={error}
      trialRemaining={null}
      paidRemaining={null}
      totalRemaining={null}
      anonRemainingChars={null}
      planLimit={INITIAL_CREDITS}
    />
  )
}

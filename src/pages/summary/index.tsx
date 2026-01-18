import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSummaryAction } from '@/hooks/useSummaryAction'
import SummaryLayout from './SummaryLayout'
import { supabase } from '@/lib/supabase'
import { isLoggedIn, getCurrentUserId } from '@/lib/auth'
import { trackEvent } from '@/utils/analytics'
import { useFreeTrialCheck } from '@/hooks/useFreeTrialCheck'
import FreeTrialExhaustedPrompt from '@/components/FreeTrialExhaustedPrompt'

export default function SummaryPage() {
  const navigate = useNavigate()
  const [lang, setLang] = useState<'zh-tw' | 'en'>('zh-tw')
  const [remainingChars, setRemainingChars] = useState<number | null>(null)
  const [totalPurchasedPoints, setTotalPurchasedPoints] = useState<number>(0)
  const [totalUsedChars, setTotalUsedChars] = useState<number>(0)

  // 獲取用戶點數和購買總額（僅在有 userId 時執行）
  useEffect(() => {
    const userId = localStorage.getItem('userId')
    if (!userId) {
      // 未登入時不執行查詢
      return
    }

    // 獲取用戶點數和購買總額
    const fetchUserCredits = async () => {
      try {
        // 1. 查詢剩餘點數
        const { data: creditsData, error: creditsError } = await supabase
          .from('user_credits')
          .select('remaining_chars')
          .eq('user_id', userId)
          .maybeSingle()

        if (creditsError) {
          console.error('[SummaryPage] Fetch credits error:', creditsError)
          return
        }

        if (creditsData) {
          setRemainingChars(creditsData.remaining_chars ?? null)
        } else {
          // 如果沒有記錄，設為 null（可能是新用戶）
          setRemainingChars(null)
        }

        // 2. 查詢用戶購買的總點數（從 purchase_logs 累加所有成功購買的 points）
        const { data: purchaseLogs, error: purchaseError } = await supabase
          .from('purchase_logs')
          .select('points')
          .eq('user_id', userId)
          .in('status', ['success', 'paid'])

        if (purchaseError) {
          console.error('[SummaryPage] Fetch purchase logs error:', purchaseError)
          // 如果查詢失敗，使用預設值 0，但繼續執行後續查詢
          setTotalPurchasedPoints(0)
        }

        // 計算總購買點數
        const totalPoints = purchaseLogs
          ? purchaseLogs.reduce((sum, log) => sum + (log.points || 0), 0)
          : 0

        setTotalPurchasedPoints(totalPoints)

        // 3. 查詢已用點數（從 usage_logs 累加）
        const { data: usageLogs, error: usageError } = await supabase
          .from('usage_logs')
          .select('total_chars')
          .eq('user_id', userId)

        if (usageError) {
          console.error('[SummaryPage] Fetch usage logs error:', usageError)
          setTotalUsedChars(0)
        } else {
          // 計算總已用點數
          const totalUsed = usageLogs
            ? usageLogs.reduce((sum, log) => sum + (log.total_chars || 0), 0)
            : 0
          setTotalUsedChars(totalUsed)
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
  // ✅ 傳入 setState 函數，讓 hook 可以直接操作 UI state
  const { runSummary, loading, error: summaryError } = useSummaryAction({
    setSummary,
    setKeywords,
    setTrafficKeywords,
    setTrafficKeywordsReady,
  })
  
  // 使用免費試用檢查 hook
  const freeTrialCheck = useFreeTrialCheck()
  
  // 使用 ref 避免重複觸發 reach_free_limit 事件
  const hasTrackedFreeLimit = useRef(false)

  // 包裝 runSummary 以傳入 input，並處理響應結果
  const handleSummary = async () => {
    // 重置追蹤標記
    hasTrackedFreeLimit.current = false
    // ✅ API 呼叫前檢查：免費試用或登入狀態
    if (!freeTrialCheck.checkBeforeApiCall()) {
      // 免費試用已用完，提示已由 hook 處理
      return
    }
    
    setInputLength(input.length)
    const result = await runSummary(input)
    if (result) {
      // ✅ useSummaryAction 已經在 API 成功後自動 setState
      // 這裡只需要處理其他邏輯（點數、追蹤等）
      
      // 取得摘要內容用於計算長度
      const finalSummary = result.summary || result.result || ''
      
      // 更新 outputLength
      if (finalSummary) {
        setOutputLength(finalSummary.length)
        
        // ✅ 記錄免費試用使用（僅在 API 成功回傳後）
        freeTrialCheck.recordSuccessfulUse()
        
        // 追蹤摘要成功產出事件
        trackEvent('use_ai_summary', {
          input_chars: input.length,
          output_chars: finalSummary.length,
          is_logged_in: isLoggedIn(),
        })
      }
      // 更新點數（如果 API 有返回）
      const updateUsageStats = async (userId: string) => {
        const { data: usageLogs, error: usageError } = await supabase
          .from('usage_logs')
          .select('total_chars')
          .eq('user_id', userId)
 
        if (usageError) {
          console.error('[SummaryPage] Fetch usage logs error:', usageError)
        } else {
          const totalUsed = usageLogs
            ? usageLogs.reduce((sum, log) => sum + (log.total_chars || 0), 0)
            : 0
          setTotalUsedChars(totalUsed)
        }
      }

      const currentUserId = getCurrentUserId()
      if (typeof result.balance === 'number') {
        setRemainingChars(result.balance)
        if (currentUserId) {
          await updateUsageStats(currentUserId)
        }
      } else if (typeof result.remaining_chars === 'number') {
        setRemainingChars(result.remaining_chars)
        if (currentUserId) {
          await updateUsageStats(currentUserId)
        }
      } else if (currentUserId) {
        try {
          const { data: consumeResult, error: consumeError } = await supabase.rpc('consume_credits', {
            p_user_id: currentUserId,
            p_feature: 'summary',
            p_input_chars: input.length,
            p_output_chars: finalSummary.length,
          })
          if (consumeError) {
            console.warn('[SummaryPage] consume_credits error:', consumeError)
          } else {
            const remainingFromRpc = Array.isArray(consumeResult)
              ? consumeResult[0]?.remaining_chars
              : (consumeResult as any)?.remaining_chars
            if (typeof remainingFromRpc === 'number') {
              setRemainingChars(remainingFromRpc)
              await updateUsageStats(currentUserId)
            }
          }
        } catch (rpcError) {
          console.error('[SummaryPage] consume_credits RPC failed:', rpcError)
        }
      }
      // 注意：這裡不更新 usageChars，因為規格中沒有要求
    } else {
      // 如果 result 為 null，可能是因為額度不足或其他錯誤
      // 檢查錯誤訊息是否包含額度不足的關鍵字
      if (summaryError && !hasTrackedFreeLimit.current) {
        const errorMessage = summaryError.toLowerCase()
        const isInsufficientCredits = 
          errorMessage.includes('insufficient credits') ||
          errorMessage.includes('insufficient') ||
          (errorMessage.includes('credits') && (errorMessage.includes('not enough') || errorMessage.includes('不足'))) ||
          errorMessage.includes('quota') ||
          errorMessage.includes('額度不足') ||
          errorMessage.includes('點數不足')
        
        if (isInsufficientCredits) {
          // 追蹤免費額度不足事件（只追蹤一次）
          trackEvent('reach_free_limit')
          hasTrackedFreeLimit.current = true
        }
      }
    }
  }

  // 同步 error 到本地 state
  useEffect(() => {
    if (summaryError) {
      setError(summaryError)
      
      // 檢查是否為額度不足錯誤（更精確的判斷，只追蹤一次）
      if (!hasTrackedFreeLimit.current) {
        const errorMessage = summaryError.toLowerCase()
        const isInsufficientCredits = 
          errorMessage.includes('insufficient credits') ||
          errorMessage.includes('insufficient') ||
          (errorMessage.includes('credits') && (errorMessage.includes('not enough') || errorMessage.includes('不足'))) ||
          errorMessage.includes('quota') ||
          errorMessage.includes('額度不足') ||
          errorMessage.includes('點數不足')
        
        if (isInsufficientCredits) {
          // 追蹤免費額度不足事件（只追蹤一次）
          trackEvent('reach_free_limit')
          hasTrackedFreeLimit.current = true
        }
      }
    } else {
      // 當錯誤清除時，重置追蹤標記
      hasTrackedFreeLimit.current = false
    }
  }, [summaryError])

  // 計算已用點數和方案上限
  const FREE_TRIAL_CREDITS = 10000
  
  // 總方案上限計算：
  // 1. 如果有購買記錄，則總額 = 購買總額 + 免費體驗額度
  // 2. 如果沒有購買記錄但剩餘點數 > 免費額度，則總額 = 剩餘點數 + 已用點數（從 usage_logs）
  // 3. 否則總額 = 免費體驗額度
  const totalPlanLimit = totalPurchasedPoints > 0
    ? totalPurchasedPoints + FREE_TRIAL_CREDITS  // 購買的點數 + 免費體驗額度
    : (remainingChars !== null && remainingChars > FREE_TRIAL_CREDITS)
    ? remainingChars + totalUsedChars  // 沒有購買記錄但剩餘點數超過免費額度，使用剩餘點數 + 已用點數作為上限
    : FREE_TRIAL_CREDITS  // 沒有購買，只顯示免費體驗額度
  
  // 已用點數計算：
  // 1. 優先使用從 usage_logs 查詢的已用點數（如果 > 0）
  // 2. 如果 usage_logs 沒有資料或為 0，但 remainingChars 有值，則計算已用點數
  // 3. 計算邏輯：
  //    - 如果有購買記錄：已用 = (購買點數 + 免費額度) - 剩餘點數
  //    - 如果沒有購買記錄但剩餘點數 > 免費額度：無法準確計算，顯示 0（需要從 purchase_logs 查詢）
  //    - 如果剩餘點數 <= 免費額度：已用 = 免費額度 - 剩餘點數
  let usedChars = 0
  
  if (totalUsedChars > 0) {
    // 優先使用從 usage_logs 查詢的已用點數
    usedChars = totalUsedChars
  } else if (remainingChars !== null) {
    if (totalPurchasedPoints > 0) {
      // 如果有購買記錄，使用購買點數 + 免費額度作為總額
      const totalLimit = totalPurchasedPoints + FREE_TRIAL_CREDITS
      const calculatedUsed = totalLimit - remainingChars
      usedChars = Math.max(0, calculatedUsed)
    } else if (remainingChars <= FREE_TRIAL_CREDITS) {
      // 如果剩餘點數 <= 免費額度，使用免費額度計算
      const calculatedUsed = FREE_TRIAL_CREDITS - remainingChars
      usedChars = Math.max(0, calculatedUsed)
    } else {
      // 如果沒有購買記錄但剩餘點數 > 免費額度
      // 這種情況下，我們無法準確知道用戶購買了多少點數
      // 但可以嘗試從 totalPlanLimit 計算（如果 totalPlanLimit > remainingChars）
      // 注意：totalPlanLimit 在這種情況下 = remainingChars + totalUsedChars
      // 如果 totalUsedChars = 0，則 totalPlanLimit = remainingChars，無法計算
      // 所以這種情況下，我們需要等待 purchase_logs 查詢成功
      // 暫時顯示 0，等查詢成功後會自動更新
      if (totalPlanLimit > remainingChars) {
        const calculatedUsed = totalPlanLimit - remainingChars
        usedChars = Math.max(0, calculatedUsed)
      } else {
        // 如果無法計算，嘗試從常見的購買方案推斷（僅作為備用方案）
        // 常見方案：100000 點或 300000 點
        // 如果 remainingChars 接近這些值，可能是購買了對應方案
        const possiblePurchases = [100000, 300000]
        for (const purchase of possiblePurchases) {
          const totalLimit = purchase + FREE_TRIAL_CREDITS
          if (remainingChars <= totalLimit && remainingChars > purchase) {
            // 剩餘點數在這個範圍內，可能是購買了這個方案
            const calculatedUsed = totalLimit - remainingChars
            if (calculatedUsed > 0) {
              usedChars = calculatedUsed
              break
            }
          }
        }
        // 如果還是無法計算，顯示 0
        if (usedChars === 0) {
          usedChars = 0
        }
      }
    }
  } else {
    // 如果 remainingChars 為 null，顯示 0
    usedChars = 0
  }

  // 檢查是否應該顯示升級提示
  const shouldShowUpgradePrompt = 
    (remainingChars !== null && remainingChars <= 0) ||
    (remainingChars !== null && remainingChars < 5000)

  return (
    <>
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
        planLimit={totalPlanLimit}
        freeTrialUsedCount={!isLoggedIn() ? freeTrialCheck.usedCount : null}
        freeTrialRemainingCount={!isLoggedIn() ? freeTrialCheck.remainingCount : null}
      />
      
      {/* 免費試用用完提示 */}
      {freeTrialCheck.showExhaustedPrompt && (
        <FreeTrialExhaustedPrompt
          onDismiss={freeTrialCheck.dismissPrompt}
        />
      )}
    </>
  )
}

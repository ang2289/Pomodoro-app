// ============================================================
// 🔧 /api/ai - 統一 AI 服務入口（Serverless Function）
// ============================================================
// 目前只實作 action = "homework"
// 其餘 action 僅預留，不實作
// ============================================================

import { calculateAICredits } from './utils/creditCalculator'

const MODEL = 'gemini-2.0-flash'

// 過濾敏感資訊（API key）的輔助函數
function sanitizeDataForLogging(data: any): any {
  try {
    if (!data || typeof data !== 'object') {
      return data
    }

    const sanitized = JSON.parse(JSON.stringify(data))

    function removeSensitiveFields(obj: any): void {
      if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
        return
      }

      for (const key in obj) {
        const lowerKey = key.toLowerCase()
        if (
          lowerKey.includes('key') ||
          lowerKey.includes('api') ||
          lowerKey.includes('token') ||
          lowerKey.includes('secret') ||
          lowerKey.includes('password') ||
          lowerKey.includes('auth')
        ) {
          delete obj[key]
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          removeSensitiveFields(obj[key])
        }
      }
    }

    removeSensitiveFields(sanitized)
    return sanitized
  } catch {
    return { error: 'Failed to sanitize data for logging' }
  }
}

// 共用回傳型別
interface AiResponse {
  success: boolean
  data?: any
  error?: string
}

export default async function handler(req: any, res: any) {
  // 外層總是 try/catch，避免 500
  try {
    console.log('[ai] handler entered', { method: req.method })

    if (req.method !== 'POST') {
      const resp: AiResponse = {
        success: false,
        error: 'METHOD_NOT_ALLOWED',
      }
      return res.status(200).json(resp)
    }

    // 所有環境變數存取都集中在 handler 的 try 區塊內
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY
    if (!GEMINI_API_KEY || typeof GEMINI_API_KEY !== 'string' || GEMINI_API_KEY.trim().length === 0) {
      console.error('❌ [ai] Missing GEMINI_API_KEY')
      const resp: AiResponse = {
        success: false,
        error: 'Missing GEMINI_API_KEY',
      }
      return res.status(200).json(resp)
    }

    console.log('[ai] env check passed')

    const body = req.body || {}
    const action = body.action

    if (action === 'homework') {
      const result = await handleHomeworkAction(body, {
        apiKey: GEMINI_API_KEY,
        model: MODEL,
      })
      return res.status(200).json(result)
    }

    if (action === 'summary') {
      // 取得與 api/summary.ts 相同的設定與行為
      const SUPABASE_FUNCTION_URL =
        process.env.VITE_SUMMARY_FUNCTION_URL ||
        'https://icuxwmpdpsfhztsbyeds.supabase.co/functions/v1/auto-summary'
      const SUPABASE_ANON_KEY =
        process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

      const { status, body: summaryBody } = await handleSummaryAction(body, {
        functionUrl: SUPABASE_FUNCTION_URL,
        anonKey: SUPABASE_ANON_KEY,
      })

      return res.status(status).json(summaryBody)
    }

    // 其他 action 預留
    console.warn('⚠️ [ai] 未支援的 action', { action })
    const resp: AiResponse = {
      success: false,
      error: 'UNSUPPORTED_ACTION',
    }
    return res.status(200).json(resp)
  } catch (err: any) {
    console.error('❌ [ai] 未預期錯誤：', {
      message: err?.message || 'Unknown error',
      stack: err?.stack,
      name: err?.name,
      error: err,
    })

    // 任何錯誤一律 200 + success:false
    const resp: AiResponse = {
      success: false,
      error: 'INTERNAL_ERROR',
    }
    return res.status(200).json(resp)
  }
}

// ============================================================
// action = "homework" 的主要邏輯
// 來源：原 api/homework-helper.ts 的核心流程，調整為統一回傳格式
// ============================================================

async function handleHomeworkAction(
  body: any,
  opts: { apiKey: string; model: string },
): Promise<AiResponse> {
  const { apiKey, model } = opts

  // 2️⃣ 解析請求內容
  let prompt: string = ''
  let mode: string = 'easy'

  try {
    prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''
    mode = typeof body.mode === 'string' ? body.mode : 'easy'
  } catch (parseBodyError) {
    console.error('❌ [homework-helper] 解析 body 失敗')
    return {
      success: false,
      error: 'BAD_REQUEST',
    }
  }

  // 檢查 prompt
  if (!prompt) {
    return {
      success: false,
      error: 'EMPTY_PROMPT',
    }
  }

  // 3️⃣ 點數預檢查（保留原有邏輯與 log，但不回傳 403）
  const remainingChars = typeof body.remainingChars === 'number' ? body.remainingChars : null
  const estimatedMinCost = prompt.length + 50

  if (remainingChars !== null && remainingChars < estimatedMinCost) {
    console.log('⚠️ [homework-helper] 點數不足，阻止呼叫 AI', {
      remainingChars,
      estimatedMinCost,
      promptLength: prompt.length,
    })
    return {
      success: false,
      error: 'INSUFFICIENT_CREDITS',
      data: {
        remainingChars,
        estimatedMinCost,
      },
    }
  }

  // 4️⃣ 準備呼叫 Gemini（保留原本 log）
  console.log('🤖 [homework-helper] 準備呼叫 Gemini', {
    model,
    promptLength: prompt.length,
    mode: mode,
    remainingChars: remainingChars !== null ? remainingChars : '未提供',
    estimatedMinCost,
  })

  const systemPromptMap: Record<string, string> = {
    // 🎯 只秀答案（預設）- 直接給答案
    answerOnly: '請直接給出這個問題的答案，簡潔明瞭。只需要答案，不需要解釋過程。',
    // 👶 簡單解釋 - 用小孩能懂的方式
    simple:
      '請用兒童可以理解的方式，用非常白話的語氣回答這個問題。禁止使用專業詞彙，請用故事＋比喻說明。',
    // 📘 詳細說明 - 完整解題過程
    detailed:
      '請用專業邏輯的語氣，完整逐步說明這個問題的解題過程與答案。請分段寫出解題過程。',
    // ✨ 舉例模式 - 用例子說明
    examples:
      '請用具體的例子來解釋這個問題，讓學生更容易理解。先給答案，再用生活中的例子說明。',
    // 舊版相容
    kid: '請用兒童可以理解的方式，用非常白話的語氣回答這個問題。禁止使用專業詞彙，請用故事＋比喻說明。',
    easy: '請直接給出這個問題的答案，簡潔明瞭。只需要答案，不需要解釋過程。',
    pro: '請用專業邏輯的語氣，完整逐步說明這個問題的解題過程與答案。請分段寫出解題過程。',
  }
  const promptInstruction = systemPromptMap[mode] || systemPromptMap['answerOnly']

  const geminiBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: `${promptInstruction}\n\n${prompt}` }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      candidateCount: 1,
    },
  }

  // 5️⃣ 呼叫 Gemini API
  let geminiRes: Response
  let errorDetail = ''

  try {
    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    console.log('🚀 [homework-helper] 準備呼叫 Gemini API', {
      url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=***`,
      model,
      hasApiKey: Boolean(apiKey),
      requestPayload: sanitizeDataForLogging(geminiBody),
    })

    geminiRes = await fetch(geminiApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody),
    })

    console.log('📡 [homework-helper] Gemini 回應狀態：', geminiRes.status)

    if (!geminiRes.ok) {
      try {
        errorDetail = await geminiRes.text()
        console.error('❌ [homework-helper] Gemini API 回應錯誤（response.ok 為 false）', {
          status: geminiRes.status,
          statusText: geminiRes.statusText,
          errorText: errorDetail.substring(0, 500),
        })
      } catch (textError) {
        console.error('❌ [homework-helper] Gemini API 回應錯誤（無法讀取 response.text）', {
          status: geminiRes.status,
          statusText: geminiRes.statusText,
          textError,
        })
      }
    }
  } catch (fetchError: any) {
    console.error('❌ [homework-helper] fetch 失敗：', fetchError?.message || fetchError)
    return {
      success: false,
      error: 'AI_FETCH_FAILED',
    }
  }

  if (!geminiRes.ok) {
    console.error(
      '❌ [homework-helper] Gemini HTTP 錯誤：',
      geminiRes.status,
      errorDetail || '(無法讀取錯誤詳情)',
    )
    return {
      success: false,
      error: 'AI_HTTP_ERROR',
      data: {
        status: geminiRes.status,
        detail: errorDetail,
      },
    }
  }

  // 6️⃣ 解析 JSON 回應
  let data: any
  try {
    data = await geminiRes.json()
  } catch (jsonError) {
    console.error('❌ [homework-helper] JSON 解析失敗')
    return {
      success: false,
      error: 'AI_RESPONSE_PARSE_ERROR',
    }
  }

  if (data?.error) {
    console.error('❌ [homework-helper] Gemini API 錯誤：', data.error?.message || data.error)
    return {
      success: false,
      error: 'AI_RESPONSE_ERROR',
      data: data.error,
    }
  }

  // 7️⃣ 完整防呆檢查（維持原本邏輯，只改成回傳物件）
  if (!data || data === null || data === undefined) {
    console.warn('Gemini returned unexpected structure', sanitizeDataForLogging(data))
    console.error('❌ [homework-helper] data 不存在')
    return {
      success: false,
      error: 'AI_EMPTY_RESPONSE',
    }
  }

  if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
    console.warn('Gemini returned unexpected structure', sanitizeDataForLogging(data))
    try {
      const dataPreview = JSON.stringify(data || {}).substring(0, 200)
      console.error('❌ [homework-helper] candidates 不存在或不是陣列', dataPreview)
    } catch {
      console.error('❌ [homework-helper] candidates 不存在或不是陣列（無法序列化 data）')
    }
    return {
      success: false,
      error: 'AI_EMPTY_CANDIDATES',
    }
  }

  const firstCandidate = data.candidates?.[0]
  if (
    !firstCandidate ||
    firstCandidate === null ||
    firstCandidate === undefined ||
    typeof firstCandidate !== 'object'
  ) {
    console.warn('Gemini returned unexpected structure', sanitizeDataForLogging(data))
    try {
      const dataPreview = JSON.stringify(data || {}).substring(0, 200)
      console.error('❌ [homework-helper] candidates[0] 不存在或不是物件', dataPreview)
    } catch {
      console.error('❌ [homework-helper] candidates[0] 不存在或不是物件（無法序列化 data）')
    }
    return {
      success: false,
      error: 'AI_INVALID_CANDIDATE',
    }
  }

  if (!firstCandidate?.content || firstCandidate.content === null || firstCandidate.content === undefined) {
    console.warn('Gemini returned unexpected structure', sanitizeDataForLogging(data))
    try {
      const dataPreview = JSON.stringify(data || {}).substring(0, 200)
      console.error('❌ [homework-helper] content 不存在', dataPreview)
    } catch {
      console.error('❌ [homework-helper] content 不存在（無法序列化 data）')
    }
    return {
      success: false,
      error: 'AI_EMPTY_CONTENT',
    }
  }

  const parts = firstCandidate?.content?.parts
  if (!parts || !Array.isArray(parts) || parts.length === 0) {
    console.warn('Gemini returned unexpected structure', sanitizeDataForLogging(data))
    try {
      const dataPreview = JSON.stringify(data || {}).substring(0, 200)
      console.error('❌ [homework-helper] parts 不存在或不是陣列', dataPreview)
    } catch {
      console.error('❌ [homework-helper] parts 不存在或不是陣列（無法序列化 data）')
    }
    return {
      success: false,
      error: 'AI_EMPTY_PARTS',
    }
  }

  const firstPart = parts?.[0]
  if (!firstPart || firstPart === null || firstPart === undefined) {
    console.warn('Gemini returned unexpected structure', sanitizeDataForLogging(data))
    try {
      const dataPreview = JSON.stringify(data || {}).substring(0, 200)
      console.error('❌ [homework-helper] parts[0] 不存在', dataPreview)
    } catch {
      console.error('❌ [homework-helper] parts[0] 不存在（無法序列化 data）')
    }
    return {
      success: false,
      error: 'AI_EMPTY_FIRST_PART',
    }
  }

  const text = firstPart?.text
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    console.warn('Gemini returned unexpected structure', sanitizeDataForLogging(data))
    try {
      const dataPreview = JSON.stringify(data || {}).substring(0, 200)
      console.error('❌ [homework-helper] text 不存在或為空字串', dataPreview)
    } catch {
      console.error('❌ [homework-helper] text 不存在或為空字串（無法序列化 data）')
    }
    return {
      success: false,
      error: 'AI_EMPTY_TEXT',
    }
  }

  const safeText = text as string

  // 8️⃣ 計算點數（沿用共用工具）
  try {
    const inputText = typeof prompt === 'string' ? prompt : ''
    const outputText = typeof safeText === 'string' ? safeText : ''
    const creditResult = calculateAICredits(inputText, outputText)

    console.log('✅ [homework-helper] 解題成功', {
      inputLength: creditResult.inputLength,
      outputLength: creditResult.outputLength,
      totalUsedPoints: creditResult.totalUsedPoints,
    })

    return {
      success: true,
      data: {
        result: safeText,
        inputLength: creditResult.inputLength,
        outputLength: creditResult.outputLength,
        totalUsedPoints: creditResult.totalUsedPoints,
      },
    }
  } catch (creditError: any) {
    console.error('❌ [homework-helper] 點數計算失敗：', creditError?.message || creditError)
    return {
      success: false,
      error: 'CREDIT_CALCULATION_FAILED',
    }
  }
}

// ============================================================
// action = "summary" 的主要邏輯
// 行為需與 api/summary.ts 的 generate 分支一致
// ============================================================

interface SummaryHandlerResult {
  status: number
  body: any
}

async function handleSummaryAction(
  body: any,
  opts: { functionUrl?: string; anonKey?: string | undefined },
): Promise<SummaryHandlerResult> {
  const { functionUrl, anonKey } = opts
  const { content, lang } = body || {}

  // 與 api/summary.ts 相同的輸入檢查
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return {
      status: 400,
      body: {
        error: '缺少內容',
        message: '請提供要摘要的內容',
      },
    }
  }

  if (!functionUrl) {
    return {
      status: 500,
      body: {
        error: 'SUMMARY FUNCTION URL 未設定',
        message: '請確認環境變數 VITE_SUMMARY_FUNCTION_URL 已設定',
      },
    }
  }

  if (!anonKey) {
    return {
      status: 500,
      body: {
        error: 'SUPABASE_ANON_KEY 未設定',
        message: '請確認環境變數 VITE_SUPABASE_ANON_KEY 已設定',
      },
    }
  }

  try {
    // 代理請求到 Supabase Edge Function（與 api/summary.ts 相同）
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ content, lang }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        status: response.status,
        body: data,
      }
    }

    // 取得摘要結果（可能在不同欄位中）
    const summaryText: string = data.summary || data.result || data.text || ''

    // 使用共用扣點工具計算 input / output / totalUsedPoints（與 api/summary.ts 一致）
    const { inputLength, outputLength, totalUsedPoints } = calculateAICredits(content, summaryText)

    // Debug log（沿用 api/summary.ts）
    console.log('✅ [summary] 摘要成功', {
      inputLength,
      outputLength,
      totalUsedPoints,
    })

    // 回傳結果格式與 api/summary.ts 保持一致
    return {
      status: 200,
      body: {
        ...data,
        inputLength,
        outputLength,
        totalUsedPoints,
        // 確保有 summary 和 result 欄位（向後相容）
        summary: summaryText || data.summary,
        result: summaryText || data.result || data.summary,
      },
    }
  } catch (err: any) {
    console.error('❌ Summary API 錯誤：', err)
    return {
      status: 500,
      body: {
        error: '伺服器錯誤',
        message: err?.message || '未知錯誤',
      },
    }
  }
}



// ============================================
// Summary 模組：已穩定 ✅
// 問題排除完成日期：2024-12-19
// ============================================
// ⚠️ 重要：此模組已完成重構，請勿回退
// 
// 資料來源：Supabase Edge Function (auto-summary)
// 呼叫方式：fetch（非 invoke）
// 
// 備註：不可回退使用 invoke
// ============================================
// 摘要服務層：純邏輯，不包含任何 React、state、UI、hook
// 負責用 fetch 直接呼叫 Supabase Edge Function auto-summary

interface CallSummaryParams {
  content: string
  lang: string
}

export async function callSummaryService(params: CallSummaryParams): Promise<any> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !anonKey) {
    throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY")
  }

  const url = `${supabaseUrl}/functions/v1/auto-summary`

  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 60000) // 60 秒 timeout

  try {
    console.log("[SUMMARY][SERVICE] start")

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": anonKey,
        "Authorization": `Bearer ${anonKey}`,
      },
      body: JSON.stringify({
        content: params.content,
        lang: params.lang,
      }),
      signal: controller.signal,
    })

    console.log("[SUMMARY][SERVICE] status", res.status)

    const text = await res.text()
    console.log("[SUMMARY][SERVICE] rawText", text)

    let json: any = null
    try {
      json = text ? JSON.parse(text) : null
    } catch (e) {
      // 嘗試 JSON.parse，失敗也不能 throw
      // keep json null
    }

    console.log("[SUMMARY][SERVICE] json", json)

    // 若 HTTP status 非 2xx，丟出 Error
    if (!res.ok) {
      throw new Error(`auto-summary HTTP ${res.status}: ${text}`)
    }

    // 確保返回的 JSON 包含 summary 欄位
    if (!json || !json.summary) {
      throw new Error('API response missing summary field')
    }

    // 最後只 return 解析後的 JSON（確保包含 summary）
    return json
  } finally {
    window.clearTimeout(timeout)
  }
}

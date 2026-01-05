// 摘要 API
// 實現扣點邏輯：檢查點數 → 呼叫 AI → 扣點 → 記錄使用紀錄

import { createClient } from '@supabase/supabase-js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

// 在函數內部初始化 Supabase（確保環境變數已載入）
function getSupabaseClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''
  
  // 後端 API 必須使用 SERVICE_ROLE_KEY 來繞過 RLS（因為不使用 Supabase Auth）
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  }
  
  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL or VITE_SUPABASE_URL environment variable is required')
  }
  
  // 使用 SERVICE_ROLE_KEY 可以繞過 RLS 政策
  return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

interface SummaryRequest {
  userId: string
  text: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 直接設定 CORS headers（不依賴外部函數）
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // 只接受 POST 請求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let supabase: any
  try {
    // 初始化 Supabase 客戶端
    supabase = getSupabaseClient()
  } catch (envError: any) {
    console.error('[summary] Supabase initialization error:', envError)
    return res.status(500).json({ 
      error: 'Server configuration error',
      details: envError.message 
    })
  }

  // 取得 Supabase URL 和 ANON_KEY（用於呼叫 Edge Function）
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''

  try {
    const body: SummaryRequest = req.body
    const { userId, text } = body

    // 1. 檢查必要參數
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' })
    }

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'text is required' })
    }

    // 2. 查詢 user_credits
    const { data: creditsData, error: creditsError } = await supabase
      .from('user_credits')
      .select('remaining_chars')
      .eq('user_id', userId)
      .single()

    if (creditsError || !creditsData) {
      console.error('[summary] Query user_credits error:', {
        code: creditsError?.code,
        message: creditsError?.message,
        details: creditsError?.details
      })
      return res.status(404).json({ error: 'User credits not found' })
    }

    const beforeRemaining = creditsData.remaining_chars || 0

    // 3. 若 remaining_chars <= 0 → 回傳錯誤（點數不足）
    if (beforeRemaining <= 0) {
      return res.status(403).json({ error: 'Insufficient credits' })
    }

    // 4. 呼叫 AI 產生摘要
    const supabaseFunctionUrl = `${supabaseUrl}/functions/v1/auto-summary`
    let aiResponse: any
    let summaryResult: any
    let inputChars: number
    let outputChars: number
    let totalChars: number

    try {
      const aiRes = await fetch(supabaseFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          content: text,
          lang: 'zh-TW', // 預設中文，可根據需求調整
        }),
      })

      if (!aiRes.ok) {
        const errorText = await aiRes.text()
        console.error('[summary] AI call failed:', errorText)
        return res.status(500).json({ error: 'AI service failed' })
      }

      aiResponse = await aiRes.json()
      
      // 計算字數（包含所有回傳內容）
      inputChars = text.length
      // output_chars 包含 summary + keywords + traffic_keywords 的總字數
      const outputText = JSON.stringify(aiResponse)
      outputChars = outputText.length
      totalChars = inputChars + outputChars

    } catch (aiError: any) {
      console.error('[summary] AI call error:', aiError)
      return res.status(500).json({ error: 'AI service error: ' + aiError.message })
    }

    // 5. 計算扣點字數並更新 user_credits
    const afterRemaining = Math.max(0, beforeRemaining - totalChars)

    const { error: updateError } = await supabase
      .from('user_credits')
      .update({
        remaining_chars: afterRemaining,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    if (updateError) {
      console.error('[summary] Update user_credits error:', {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details
      })
      // 即使更新失敗，也回傳摘要結果（但記錄錯誤）
    }

    // 6. 寫入 usage_logs
    const { error: logError } = await supabase
      .from('usage_logs')
      .insert({
        user_id: userId,
        feature: 'summary',
        input_chars: inputChars,
        output_chars: outputChars,
        total_chars: totalChars,
        before_remaining: beforeRemaining,
        after_remaining: afterRemaining,
        created_at: new Date().toISOString(),
      })

    if (logError) {
      console.error('[summary] Insert usage_logs error:', {
        code: logError.code,
        message: logError.message,
        details: logError.details
      })
      // 即使記錄失敗，也回傳摘要結果（但記錄錯誤）
    }

    // 7. 回傳摘要結果（包含所有 AI 回傳的欄位）
    return res.status(200).json({
      summary: aiResponse.summary || '',
      keywords: aiResponse.keywords || [],
      traffic_keywords: aiResponse.traffic_keywords || [],
      remaining_chars: afterRemaining,
    })
  } catch (error: any) {
    console.error('[summary] Error:', error)
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}

// AI 工具統一 API（合併 summary、ai、homework）
// 使用 req.body.action 判斷要執行哪個功能

import { createClient } from '@supabase/supabase-js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

// ===== 共用函數 =====

/**
 * 初始化 Supabase 客戶端（確保環境變數已載入）
 */
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

// ===== 處理函數：摘要功能 =====

interface SummaryRequest {
  userId: string
  text: string
}

async function handleSummary(req: VercelRequest, res: VercelResponse, supabase: any) {
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
      console.error('[ai-tools/summary] Query user_credits error:', {
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
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
    const supabaseFunctionUrl = `${supabaseUrl}/functions/v1/auto-summary`
    let aiResponse: any
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
        console.error('[ai-tools/summary] AI call failed:', errorText)
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
      console.error('[ai-tools/summary] AI call error:', aiError)
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
      console.error('[ai-tools/summary] Update user_credits error:', {
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
      console.error('[ai-tools/summary] Insert usage_logs error:', {
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
    console.error('[ai-tools/summary] Error:', error)
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}

// ===== 處理函數：AI 任務功能（已 deprecated，保留結構）=====

async function handleAiTask(req: VercelRequest, res: VercelResponse) {
  // ⚠️ 此功能已 deprecated，不再使用 Vercel Serverless 作為 AI 代理層
  // 建議所有 AI 功能直接呼叫 Supabase Edge Function
  return res.status(400).json({
    error: 'Deprecated',
    message: '此 API 已停用，請直接使用 Supabase Edge Functions'
  })
}

// ===== 處理函數：作業解答功能 =====

interface HomeworkRequest {
  userId: string
  inputText: string
  outputText: string
  inputChars: number
  outputChars: number
}

async function handleHomework(req: VercelRequest, res: VercelResponse, supabase: any) {
  try {
    // ===== body parse =====
    const body: HomeworkRequest = typeof req.body === 'string' ? JSON.parse(req.body) : req.body

    const { userId, inputChars, outputChars } = body

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' })
    }

    if (typeof inputChars !== 'number' || typeof outputChars !== 'number') {
      return res.status(400).json({ error: 'inputChars and outputChars are required' })
    }

    // ===== 計算總使用字數 =====
    const totalChars = inputChars + outputChars

    // ===== 查詢 user_credits =====
    const { data: creditsData, error: creditsError } = await supabase
      .from('user_credits')
      .select('remaining_chars')
      .eq('user_id', userId)
      .single()

    if (creditsError || !creditsData) {
      console.error('[ai-tools/homework] Query user_credits error:', {
        code: creditsError?.code,
        message: creditsError?.message,
        details: creditsError?.details
      })
      return res.status(404).json({ error: 'User credits not found' })
    }

    const beforeRemaining = creditsData.remaining_chars || 0

    // ===== 計算扣點後剩餘點數 =====
    const afterRemaining = Math.max(0, beforeRemaining - totalChars)

    // ===== 更新 user_credits =====
    const { error: updateError } = await supabase
      .from('user_credits')
      .update({
        remaining_chars: afterRemaining,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    if (updateError) {
      console.error('[ai-tools/homework] Update user_credits error:', {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details
      })
      // 即使更新失敗，也繼續記錄使用紀錄
    }

    // ===== 寫入 usage_logs =====
    const { error: logError } = await supabase
      .from('usage_logs')
      .insert({
        user_id: userId,
        feature: 'homework',
        input_chars: inputChars,
        output_chars: outputChars,
        total_chars: totalChars,
        before_remaining: beforeRemaining,
        after_remaining: afterRemaining,
        created_at: new Date().toISOString(),
      })

    if (logError) {
      console.error('[ai-tools/homework] Insert usage_logs error:', {
        code: logError.code,
        message: logError.message,
        details: logError.details
      })
      // 即使記錄失敗，也回傳成功（扣點已執行）
    }

    // ===== 回傳成功 =====
    return res.status(200).json({
      success: true,
      remaining_chars: afterRemaining,
    })
  } catch (error: any) {
    console.error('[ai-tools/homework] Error:', error)
    return res.status(500).json({
      error: error.message || 'Internal server error',
    })
  }
}

// ===== 主 Handler =====

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ===== CORS =====
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // ===== 初始化 Supabase =====
  let supabase: any
  try {
    supabase = getSupabaseClient()
  } catch (envError: any) {
    console.error('[ai-tools] Supabase initialization error:', envError)
    return res.status(500).json({ 
      error: 'Server configuration error',
      details: envError.message 
    })
  }

  // ===== 解析 action =====
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  const { action } = body

  if (!action) {
    return res.status(400).json({
      error: 'Missing action parameter',
      message: 'Expected action: summary, ai-task, or homework'
    })
  }

  // ===== 路由到對應的處理函數 =====
  try {
    switch (action) {
      case 'summary':
        return await handleSummary(req, res, supabase)

      case 'ai-task':
        return await handleAiTask(req, res)

      case 'homework':
        return await handleHomework(req, res, supabase)

      default:
        return res.status(400).json({
          error: 'Invalid action',
          message: `Unknown action: ${action}. Expected: summary, ai-task, or homework`
        })
    }
  } catch (error: any) {
    console.error(`[ai-tools/${action}] Error:`, error)
    return res.status(500).json({
      error: error.message || 'Internal server error'
    })
  }
}

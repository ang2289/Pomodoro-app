// Supabase 保活 API
// 定期對 Supabase 專案送出 GET 請求以保持連線活躍

import type { VercelRequest, VercelResponse } from '@vercel/node'

const SUPABASE_URL = 'https://icuxwmpdpsfhztsbyeds.supabase.co/rest/v1/users'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // 只允許 GET 請求
    if (req.method !== 'GET') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed. Only GET requests are supported.',
      })
    }

    console.log(`[ping-supabase] 開始對 Supabase 送出保活請求：${SUPABASE_URL}`)
    const startTime = Date.now()

    // 對 Supabase 送出 GET 請求
    const response = await fetch(SUPABASE_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''}`,
      },
    })

    const endTime = Date.now()
    const duration = endTime - startTime

    // 記錄請求結果
    const result = {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      url: SUPABASE_URL,
    }

    console.log('[ping-supabase] 請求完成：', result)

    // 如果請求失敗，記錄詳細資訊
    if (!response.ok) {
      const errorText = await response.text().catch(() => '無法讀取錯誤訊息')
      console.error('[ping-supabase] 請求失敗：', {
        ...result,
        error: errorText,
      })
    }

    // 回傳 JSON 結果
    return res.status(200).json({
      success: response.ok,
      message: response.ok ? 'Supabase 保活請求成功' : 'Supabase 保活請求失敗',
      ...result,
    })
  } catch (error: any) {
    // 捕獲並記錄錯誤
    const errorResult = {
      success: false,
      error: error?.message || 'Unknown error',
      stack: error?.stack,
      timestamp: new Date().toISOString(),
      url: SUPABASE_URL,
    }

    console.error('[ping-supabase] 發生錯誤：', errorResult)

    // 回傳錯誤結果
    return res.status(500).json({
      success: false,
      message: 'Supabase 保活請求發生錯誤',
      ...errorResult,
    })
  }
}

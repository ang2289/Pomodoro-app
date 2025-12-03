/**
 * Vercel Serverless Function: Auto Summary API Proxy
 * 使用 SUPABASE_SERVICE_KEY 呼叫 Supabase Edge Function
 * 這樣可以避免在前端暴露 Service Key
 */

export default async function handler(req: any, res: any) {
  // 只允許 POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { text, lang = 'zh-TW' } = req.body

    if (!text || !text.trim()) {
      return res.status(400).json({ 
        error: req.headers['accept-language']?.includes('zh') 
          ? '缺少內容' 
          : 'Missing content' 
      })
    }

    // 獲取環境變數
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 
                       process.env.VITE_SUPABASE_URL ||
                       'https://icuxwmpdpsfhztsbyeds.supabase.co'
    
    const serviceKey = process.env.SUPABASE_SERVICE_KEY

    if (!serviceKey) {
      console.error('SUPABASE_SERVICE_KEY is not configured')
      return res.status(500).json({ 
        error: req.headers['accept-language']?.includes('zh')
          ? '伺服器設定錯誤：缺少 SUPABASE_SERVICE_KEY'
          : 'Server configuration error: SUPABASE_SERVICE_KEY is missing'
      })
    }

    // 呼叫 Supabase Edge Function
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/auto-summary`
    
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ 
        text,
        lang,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`
      
      console.error('Edge Function Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorMessage,
      })
      
      return res.status(response.status).json({ 
        error: errorMessage 
      })
    }

    const data = await response.json()
    
    return res.status(200).json({
      summary: data.summary || data.content || '',
      keywords: data.keywords || [],
    })
  } catch (err: any) {
    console.error('Auto Summary API Error:', err)
    return res.status(500).json({ 
      error: err.message || 'Internal server error' 
    })
  }
}












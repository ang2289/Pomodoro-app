// 管理者查詢用量 API（客服糾紛處理用）
// GET /api/admin/usage?userId=xxx
// 僅限 admin role 存取

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

/**
 * 驗證是否為管理者
 * 可透過以下方式驗證：
 * 1. 環境變數 ADMIN_EMAILS（逗號分隔的管理者 email 列表）
 * 2. Supabase user metadata 中的 admin role
 */
async function verifyAdmin(userEmail?: string, userId?: string): Promise<boolean> {
  // 方式 1：環境變數檢查（最簡單）
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || []
  
  if (userEmail && adminEmails.includes(userEmail.toLowerCase())) {
    return true
  }

  // 方式 2：從 Supabase 檢查（如果有設定 user metadata）
  // 這部分需要根據你的實際資料庫結構調整
  // 例如在 user_profiles 表中設定 is_admin 欄位
  
  // 暫時只使用 email 檢查
  return false
}

/**
 * 取得使用者的使用紀錄
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 只接受 GET 請求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // ==========================================
    // 1. 驗證管理者權限
    // ==========================================
    
    // 從 Authorization header 取得 token
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header' 
      })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // 初始化 Supabase 客戶端（使用 anon key 來驗證 token）
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Supabase 環境變數未設定')
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'Supabase credentials not configured' 
      })
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // 驗證 token 並取得使用者資訊
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid or expired token' 
      })
    }

    // 檢查是否為管理者
    const isAdmin = await verifyAdmin(user.email, user.id)
    
    if (!isAdmin) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Admin access required' 
      })
    }

    // ==========================================
    // 2. 取得查詢參數
    // ==========================================
    const { userId } = req.query

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Missing or invalid userId parameter' 
      })
    }

    // ==========================================
    // 3. 查詢使用紀錄（使用 service_role key 繞過 RLS）
    // ==========================================
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseServiceKey) {
      console.error('❌ SUPABASE_SERVICE_ROLE_KEY 未設定')
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'Service role key not configured' 
      })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // 查詢最近 100 筆使用紀錄
    const { data: usageLogs, error: queryError } = await supabaseAdmin
      .from('usage_logs')
      .select('feature, input_chars, output_chars, total_chars, before_remaining, after_remaining, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100)

    if (queryError) {
      console.error('❌ 查詢使用紀錄失敗：', queryError)
      return res.status(500).json({ 
        error: 'Database error',
        message: queryError.message 
      })
    }

    // ==========================================
    // 4. 格式化並回傳結果
    // ==========================================
    const formattedLogs = (usageLogs || []).map(log => ({
      feature: log.feature,
      total_chars: log.total_chars,
      input_chars: log.input_chars || 0,
      output_chars: log.output_chars || 0,
      before_remaining: log.before_remaining,
      after_remaining: log.after_remaining,
      created_at: log.created_at,
    }))

    // 同時查詢使用者目前的剩餘點數
    const { data: userCredits } = await supabaseAdmin
      .from('user_credits')
      .select('remaining_chars, updated_at')
      .eq('user_id', userId)
      .single()

    return res.status(200).json({
      success: true,
      userId,
      currentCredits: userCredits?.remaining_chars || 0,
      creditsUpdatedAt: userCredits?.updated_at || null,
      totalLogs: formattedLogs.length,
      logs: formattedLogs,
    })

  } catch (error: any) {
    console.error('❌ 管理者查詢用量 API 錯誤：', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'Unknown error' 
    })
  }
}


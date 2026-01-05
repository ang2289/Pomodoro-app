// 登入 API
// 不使用 Supabase Auth，僅使用資料表 CRUD

import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
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

interface LoginRequest {
  email: string
  password: string
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
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  let supabase: any
  try {
    // 初始化 Supabase 客戶端
    supabase = getSupabaseClient()
  } catch (envError: any) {
    console.error('[login] Supabase initialization error:', envError)
    return res.status(500).json({ 
      success: false, 
      error: 'Server configuration error',
      details: envError.message 
    })
  }

  try {
    // 解析請求 body
    const body: LoginRequest = req.body
    const { email, password } = body

    // 檢查 email / password 是否存在
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' })
    }

    // 正規化 email（轉為小寫並去除空白）
    const normalizedEmail = email.toLowerCase().trim()

    // 1. 從 public.users 表查詢該 email
    const { data: user, error: queryError } = await supabase
      .from('users')
      .select('id, password_hash')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (queryError) {
      console.error('[login] Query users error:', {
        code: queryError.code,
        message: queryError.message,
        details: queryError.details
      })
      // 查詢錯誤，回傳通用錯誤訊息（不洩露使用者是否存在）
      return res.status(401).json({ success: false, error: 'Invalid email or password' })
    }

    if (!user) {
      // 使用者不存在
      return res.status(401).json({ success: false, error: 'Invalid email or password' })
    }

    // 2. 使用 bcrypt.compare 驗證密碼
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)

    if (!isPasswordValid) {
      // 密碼錯誤
      return res.status(401).json({ success: false, error: 'Invalid email or password' })
    }

    // 3. 成功回傳（規格：{ "success": true, "userId": "<users.id>" }）
    console.log('[login] SUCCESS userId:', user.id)
    console.log('[login] response payload:', { success: true, userId: user.id })
    return res.status(200).json({ success: true, userId: user.id })
  } catch (error: any) {
    console.error('[login] Error:', error)
    console.error('[login] Error stack:', error.stack)
    return res.status(500).json({ success: false, error: error.message || 'Internal server error' })
  }
}

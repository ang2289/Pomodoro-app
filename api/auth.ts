// 統一認證 API（合併 login / register / reset-password）
// 使用 req.body.action 判斷要執行哪個功能

import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import type { VercelRequest, VercelResponse } from '@vercel/node'

// ===== 共用函數 =====

/**
 * 初始化 Supabase 客戶端（確保環境變數已載入）
 */
function getSupabaseClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  }

  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL or VITE_SUPABASE_URL environment variable is required')
  }

  // 使用 SERVICE_ROLE_KEY 可以繞過 RLS 政策
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

// ===== 處理函數：登入 =====

interface LoginRequest {
  email: string
  password: string
}

async function handleLogin(req: VercelRequest, res: VercelResponse, supabase: any) {
  const body: LoginRequest = req.body
  const { email, password } = body

  // 檢查 email / password 是否存在
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' })
  }

  // 正規化 email（轉為小寫並去除空白）
  const normalizedEmail = email.toLowerCase().trim()

  // 1. 從 public.users 表查詢該 email
  const user = await (async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, password_hash')
      .eq('email', normalizedEmail)
    if (error) throw new Error('查詢失敗: ' + error.message)
    if (!data || data.length === 0) throw new Error('使用者不存在')
    return data[0]
  })().catch((err) => {
    // 查詢錯誤或使用者不存在，回傳通用錯誤訊息（不洩露使用者是否存在）
    console.error('[auth/login] Query users error:', err.message)
    return null
  })

  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid email or password' })
  }

  // 2. 使用 bcrypt.compare 驗證密碼
  const isPasswordValid = await bcrypt.compare(password, user.password_hash)

  if (!isPasswordValid) {
    // 密碼錯誤
    return res.status(401).json({ success: false, error: 'Invalid email or password' })
  }

  // 3. 檢查並初始化點數（如果是首次登入）
  const { data: existingCredits } = await supabase
    .from('user_credits')
    .select('balance')
    .eq('user_id', user.id)
    .maybeSingle()

  // 如果沒有點數記錄，初始化為 10,000 點（首次登入贈送）
  if (!existingCredits) {
    const { error: creditsError } = await supabase
      .from('user_credits')
      .insert({
        user_id: user.id,
        balance: 10000,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (creditsError) {
      console.error('[auth/login] INIT CREDITS ERROR:', creditsError)
      // 點數初始化失敗不影響登入，僅記錄錯誤
    } else {
      console.log('[auth/login] Initialized credits for user:', user.id)
    }
  }

  // 4. 成功回傳（規格：{ "success": true, "userId": "<users.id>" }）
  console.log('[auth/login] SUCCESS userId:', user.id)
  console.log('[auth/login] response payload:', { success: true, userId: user.id })
  return res.status(200).json({ success: true, userId: user.id })
}

// ===== 處理函數：註冊 =====

interface RegisterRequest {
  email: string
  password: string
}

async function handleRegister(req: VercelRequest, res: VercelResponse, supabase: any) {
  const body: RegisterRequest = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  const { email, password } = body

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required',
    })
  }

  const normalizedEmail = email.toLowerCase().trim()

  // ===== check user =====
  const { data: existingUser, error: checkError } = await supabase
    .from('users')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (checkError && checkError.code !== 'PGRST116') {
    console.error('[auth/register] CHECK USER ERROR:', checkError)
    return res.status(500).json({
      success: false,
      error: 'Database query failed',
    })
  }

  if (existingUser) {
    return res
      .status(409)
      .json({ success: false, error: 'Email already registered' })
  }

  // ===== create user =====
  const passwordHash = await bcrypt.hash(password, 10)
  const userId = uuidv4()

  const { error: insertUserError } = await supabase.from('users').insert({
    id: userId,
    email: normalizedEmail,
    password_hash: passwordHash,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  if (insertUserError) {
    console.error('[auth/register] INSERT USER ERROR:', insertUserError)
    return res.status(500).json({
      success: false,
      error: 'Failed to create user',
    })
  }

  // ===== init credits =====
  const { error: creditsError } = await supabase
    .from('user_credits')
    .insert({
      user_id: userId,
      remaining_chars: 10000,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

  if (creditsError) {
    console.error('[auth/register] CREDITS ERROR:', {
      userId,
      error: creditsError,
      code: creditsError.code,
      message: creditsError.message,
      details: creditsError.details,
      hint: creditsError.hint
    })
    return res.status(500).json({
      success: false,
      error: 'Failed to create user credits',
    })
  }

  return res.status(200).json({ userId })
}

// ===== 處理函數：重設密碼 =====

interface ResetPasswordRequest {
  email: string
  password?: string
}

async function handleResetPassword(req: VercelRequest, res: VercelResponse, supabase: any) {
  const body: ResetPasswordRequest = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  const { email, password } = body

  if (!email) {
    return res.status(400).json({ error: 'Missing email' })
  }

  const normalizedEmail = email.trim().toLowerCase()

  // ===== check user =====
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (userError && userError.code !== 'PGRST116') {
    console.error('[auth/reset-password] Query user error:', userError)
    return res.status(500).json({ error: 'Database query failed' })
  }

  if (!user) {
    return res.status(404).json({ error: '找不到該使用者' })
  }

  // ===== 如果有 password，直接更新密碼 =====
  if (password) {
    if (password.length < 6) {
      return res.status(400).json({ error: '密碼長度至少需要 6 個字元' })
    }

    // 加密新密碼
    const passwordHash = await bcrypt.hash(password, 10)

    // 更新密碼
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('[auth/reset-password] Update password error:', updateError)
      return res.status(500).json({ error: '密碼更新失敗' })
    }

    // 刪除所有該使用者的重設 token（安全考量）
    await supabase
      .from('password_resets')
      .delete()
      .eq('user_id', user.id)

    return res.status(200).json({ success: true, message: '密碼已更新' })
  }

  // ===== 如果沒有 password，生成 token（原本的流程）=====
  const token = uuidv4()
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString() // 30 分鐘內有效

  // ===== insert reset token =====
  const { error: insertError } = await supabase.from('password_resets').insert({
    user_id: user.id,
    token,
    expires_at: expiresAt,
    created_at: new Date().toISOString(),
  })

  if (insertError) {
    console.error('[auth/reset-password] Insert token error:', insertError)
    return res.status(500).json({ error: 'Failed to create reset token' })
  }

  // ===== output reset link to console (for development) =====
  const resetLink = `https://yourdomain.com/reset-confirm?token=${token}`
  console.log('[auth/reset-password] Reset Link:', resetLink)

  return res.status(200).json({ success: true, message: '重設連結已發送' })
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
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  // ===== 初始化 Supabase =====
  let supabase: any
  try {
    supabase = getSupabaseClient()
  } catch (envError: any) {
    console.error('[auth] Supabase initialization error:', envError)
    return res.status(500).json({
      success: false,
      error: 'Server configuration error',
      details: envError.message
    })
  }

  // ===== 解析 action =====
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  const { action } = body

  if (!action) {
    return res.status(400).json({
      success: false,
      error: 'Missing action parameter. Expected: login, register, or reset-password'
    })
  }

  // ===== 路由到對應的處理函數 =====
  try {
    switch (action) {
      case 'login':
        return await handleLogin(req, res, supabase)

      case 'register':
        return await handleRegister(req, res, supabase)

      case 'reset-password':
        return await handleResetPassword(req, res, supabase)

      default:
        return res.status(400).json({
          success: false,
          error: `Invalid action: ${action}. Expected: login, register, or reset-password`
        })
    }
  } catch (error: any) {
    console.error(`[auth/${action}] Error:`, error)
    console.error(`[auth/${action}] Error stack:`, error.stack)
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    })
  }
}

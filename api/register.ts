import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import type { VercelRequest, VercelResponse } from '@vercel/node'

interface RegisterRequest {
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

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    // ===== ENV CHECK（只能在 handler 內）=====
    const supabaseUrl =
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      console.error('[REGISTER] ENV Missing:', {
        hasSupabaseUrl: !!supabaseUrl,
        hasServiceKey: !!serviceKey,
        envKeys: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
      })
      return res.status(500).json({
        success: false,
        error: 'Server configuration error',
        message: 'Missing required environment variables',
      })
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    })

    // ===== body parse =====
    const body: RegisterRequest =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body

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
      console.error('[CHECK USER ERROR]', checkError)
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
      console.error('[INSERT USER ERROR]', insertUserError)
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
      console.error('[CREDITS ERROR]', {
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
  } catch (err: any) {
    console.error('[REGISTER ERROR]', err)
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error',
    })
  }
}

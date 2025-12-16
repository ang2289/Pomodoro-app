// 前端點數服務封裝
// 提供簡潔的 API 供前端使用

import { supabase } from '../utils/supabaseClient'

export interface ConsumeCreditsResponse {
  success: boolean
  remainingChars: number
  usedChars: number
  error?: string
}

export class InsufficientCreditsError extends Error {
  constructor(
    public remaining: number,
    public requested: number
  ) {
    super(`點數不足：剩餘 ${remaining} 字，需要 ${requested} 字`)
    this.name = 'InsufficientCreditsError'
  }
}

/**
 * 扣點數（前端封裝）
 * @param userId 使用者 ID
 * @param usedChars 使用的字數
 * @param serviceType 服務類型（'summary', 'homework' 等）
 * @param contentPreview 內容預覽（可選）
 * @returns 扣點結果
 */
export async function consumeCredits(
  userId: string,
  usedChars: number,
  serviceType: string = 'unknown',
  contentPreview?: string
): Promise<ConsumeCreditsResponse> {
  try {
    // 取得 Supabase Edge Function URL
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
    const functionUrl = `${supabaseUrl}/functions/v1/consume-credits`

    // 取得 Supabase Auth Token
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token || ''

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({
        userId,
        usedChars,
        serviceType,
        contentPreview,
      }),
    })

    const data: ConsumeCreditsResponse = await response.json()

    if (!response.ok || !data.success) {
      if (data.error === 'INSUFFICIENT_CREDITS') {
        throw new InsufficientCreditsError(data.remainingChars, usedChars)
      }
      throw new Error(data.error || '扣點數失敗')
    }

    return data
  } catch (error: any) {
    if (error instanceof InsufficientCreditsError) {
      throw error
    }
    console.error('❌ 扣點數失敗：', error)
    throw new Error(error.message || '扣點數時發生錯誤')
  }
}

/**
 * 取得使用者剩餘點數
 * @param userId 使用者 ID（可選，如果不提供則使用當前登入使用者）
 * @returns 剩餘點數
 */
export async function getRemainingCredits(userId?: string): Promise<number> {
  try {
    // 如果沒有提供 userId，嘗試從 Supabase Auth 取得
    let targetUserId = userId

    if (!targetUserId) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.warn('⚠️ 未登入使用者，無法取得點數')
        return 0
      }
      targetUserId = user.id
    }

    // 查詢 user_credits 表
    const { data, error } = await supabase
      .from('user_credits')
      .select('remaining_chars')
      .eq('user_id', targetUserId)
      .single()

    if (error) {
      // 如果記錄不存在，可能是新使用者，觸發初始化
      if (error.code === 'PGRST116') {
        console.log('🆕 使用者點數記錄不存在，觸發初始化...')
        await initializeUserCredits(targetUserId)
        // 重新查詢
        const { data: retryData } = await supabase
          .from('user_credits')
          .select('remaining_chars')
          .eq('user_id', targetUserId)
          .single()
        return retryData?.remaining_chars || 10000
      }
      console.error('❌ 取得剩餘點數失敗：', error)
      return 0
    }

    return data?.remaining_chars || 0
  } catch (error) {
    console.error('❌ 取得剩餘點數失敗：', error)
    return 0
  }
}

/**
 * 初始化使用者點數（如果不存在）
 * @param userId 使用者 ID（可選，如果不提供則使用當前登入使用者）
 * @returns 剩餘點數
 */
export async function initializeUserCredits(userId?: string): Promise<number> {
  try {
    // 如果沒有提供 userId，嘗試從 Supabase Auth 取得
    let targetUserId = userId

    if (!targetUserId) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('未登入使用者，無法初始化點數')
      }
      targetUserId = user.id
    }

    // 呼叫 Supabase RPC 函數初始化點數
    const { data, error } = await supabase.rpc('init_user_credits_if_not_exists', {
      p_user_id: targetUserId,
      p_initial_chars: 10000,
    })

    if (error) {
      console.error('❌ 初始化點數失敗：', error)
      // 如果 RPC 函數不存在或失敗，嘗試直接插入
      const { error: insertError } = await supabase
        .from('user_credits')
        .upsert({
          user_id: targetUserId,
          remaining_chars: 10000,
        }, {
          onConflict: 'user_id',
        })

      if (insertError) {
        throw insertError
      }

      return 10000
    }

    return data || 10000
  } catch (error: any) {
    console.error('❌ 初始化點數失敗：', error)
    throw new Error(error.message || '初始化點數時發生錯誤')
  }
}

/**
 * 檢查並初始化使用者點數（用於登入後檢查）
 * 如果使用者點數記錄不存在，自動建立
 * @returns 剩餘點數
 */
export async function ensureUserCreditsInitialized(): Promise<number> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.warn('⚠️ 未登入使用者，跳過點數初始化')
      return 0
    }

    // 檢查點數是否存在
    const { data: creditsData, error } = await supabase
      .from('user_credits')
      .select('remaining_chars')
      .eq('user_id', user.id)
      .single()

    if (error && error.code === 'PGRST116') {
      // 記錄不存在，進行初始化
      console.log('🆕 使用者首次使用，初始化免費試用點數...')
      return await initializeUserCredits(user.id)
    }

    if (error) {
      console.error('❌ 檢查點數失敗：', error)
      return 0
    }

    return creditsData?.remaining_chars || 0
  } catch (error) {
    console.error('❌ 確保點數初始化失敗：', error)
    return 0
  }
}

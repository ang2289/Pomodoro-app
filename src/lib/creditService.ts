// 前端使用額度服務封裝
// 提供簡潔的 API 供前端使用

import { supabase } from '../utils/supabaseClient'
import { FREE_TRIAL_QUOTA } from '../config'

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
    super(`使用額度不足：剩餘 ${remaining} 字，需要 ${requested} 字`)
    this.name = 'InsufficientCreditsError'
  }
}

/**
 * 使用額度計算（前端封裝）
 * @param userId 使用者 ID
 * @param usedChars 使用的字數
 * @param serviceType 服務類型（'summary', 'homework' 等）
 * @param contentPreview 內容預覽（可選）
 * @returns 使用額度結果
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

    const data: any = await response.json()

    if (!response.ok || !data?.success) {
      // 使用額度不足錯誤維持拋出，讓呼叫端可以特別處理（顯示升級提示等）
      if (data?.error === 'INSUFFICIENT_CREDITS') {
        throw new InsufficientCreditsError(Number(data.remainingChars) || 0, usedChars)
      }

      // 其他錯誤（包含 401 / 500 等），安全回傳失敗結果，避免中斷整頁渲染
      console.error('❌ 使用額度計算失敗（HTTP 或後端錯誤）：', {
        status: response.status,
        data,
      })

      return {
        success: false,
        remainingChars: Number(data?.remainingChars) || 0,
        usedChars,
        error: data?.error || data?.message || `使用額度計算失敗（HTTP ${response.status})`,
      }
    }

    // 正常成功情況
    return {
      success: true,
      remainingChars: Number(data.remainingChars) || 0,
      usedChars,
    }
  } catch (error: any) {
    if (error instanceof InsufficientCreditsError) {
      throw error
    }
    console.error('❌ 使用額度計算失敗：', error)
    // 其他錯誤安全回傳失敗結果（不再拋出），避免整頁中斷
    return {
      success: false,
      remainingChars: 0,
      usedChars,
      error: error?.message || '使用額度計算時發生錯誤',
    }
  }
}

/**
 * 取得使用者剩餘可用額度
 * @param userId 使用者 ID（可選，如果不提供則使用當前登入使用者）
 * @returns 剩餘可用額度
 */
export async function getRemainingCredits(userId?: string): Promise<number> {
  try {
    // 如果沒有提供 userId，嘗試從 Supabase Auth 取得
    let targetUserId = userId

    if (!targetUserId) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.warn('⚠️ 未登入使用者，無法取得使用額度')
        return 0
      }
      targetUserId = user.id
    }

    // 查詢 user_credits 表（存放剩餘可用額度）
    const { data, error } = await supabase
      .from('user_credits')
      .select('remaining_chars')
      .eq('user_id', targetUserId)
      .single()

    if (error) {
      // 如果記錄不存在，可能是新使用者，觸發初始化
      if (error.code === 'PGRST116') {
        console.log('🆕 使用者額度記錄不存在，觸發初始化...')
        await initializeUserCredits(targetUserId)
        // 重新查詢
        const { data: retryData } = await supabase
          .from('user_credits')
          .select('remaining_chars')
          .eq('user_id', targetUserId)
          .single()
        return retryData?.remaining_chars || FREE_TRIAL_QUOTA
      }
      console.error('❌ 取得剩餘可用額度失敗：', error)
      return 0
    }

    return data?.remaining_chars || 0
  } catch (error) {
    console.error('❌ 取得剩餘可用額度失敗：', error)
    return 0
  }
}

/**
 * 初始化使用者免費體驗額度（如果不存在）
 * @param userId 使用者 ID（可選，如果不提供則使用當前登入使用者）
 * @returns 剩餘可用額度
 */
export async function initializeUserCredits(userId?: string): Promise<number> {
  try {
    // 如果沒有提供 userId，嘗試從 Supabase Auth 取得
    let targetUserId = userId

    if (!targetUserId) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.warn('⚠️ 未登入使用者，無法初始化免費體驗額度')
        return 0
      }
      targetUserId = user.id
    }

    // 呼叫 Supabase RPC 函數初始化免費體驗額度
    const { data, error } = await supabase.rpc('init_user_credits_if_not_exists', {
      p_user_id: targetUserId,
      p_initial_chars: FREE_TRIAL_QUOTA, // 從共用配置讀取
    })

    if (error) {
      console.error('❌ 初始化免費體驗額度失敗：', error)
      // 如果 RPC 函數不存在或失敗，嘗試直接插入
      const { error: insertError } = await supabase
        .from('user_credits')
        .upsert({
          user_id: targetUserId,
          remaining_chars: FREE_TRIAL_QUOTA, // 從共用配置讀取
        }, {
          onConflict: 'user_id',
        })

      if (insertError) {
        console.error('❌ 直接插入額度記錄仍然失敗：', insertError)
        return 0
      }

      return FREE_TRIAL_QUOTA // 從共用配置讀取
    }

    return data || FREE_TRIAL_QUOTA // 從共用配置讀取
  } catch (error: any) {
    console.error('❌ 初始化免費體驗額度失敗：', error)
    // 避免拋出錯誤導致整頁中斷，改回傳 0
    return 0
  }
}

/**
 * 檢查並初始化使用者使用額度（用於登入後檢查）
 * 如果使用者額度記錄不存在，自動建立
 * @returns 剩餘可用額度
 */
export async function ensureUserCreditsInitialized(): Promise<number> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.warn('⚠️ 未登入使用者，跳過額度初始化')
      return 0
    }

    // 檢查額度是否存在
    const { data: creditsData, error } = await supabase
      .from('user_credits')
      .select('remaining_chars')
      .eq('user_id', user.id)
      .single()

    if (error && error.code === 'PGRST116') {
      // 記錄不存在，進行初始化
      console.log('🆕 使用者首次使用，初始化免費體驗額度...')
      return await initializeUserCredits(user.id)
    }

    if (error) {
      console.error('❌ 檢查使用額度失敗：', error)
      return 0
    }

    return creditsData?.remaining_chars || 0
  } catch (error) {
    console.error('❌ 確保額度初始化失敗：', error)
    return 0
  }
}

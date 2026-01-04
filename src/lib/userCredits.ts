// 最終定案版：使用者點數資料存取層
// 規則：
// - 只使用 users.id（不使用 auth.users）
// - 只讀寫 user_credits.balance（不使用 remaining_chars）
// - 不使用 Supabase Auth
// - 不使用 RPC

import { supabase } from '@/lib/supabase'

const INITIAL_BALANCE = 10000

/**
 * 取得使用者點數餘額
 * @param userId - 使用者 ID（來自 users.id，非 auth.users）
 * @returns 點數餘額，若不存在則返回 null
 */
export async function getUserBalance(userId: string): Promise<number | null> {
  if (!userId) return null

  const { data, error } = await supabase
    .from('user_credits')
    .select('balance')
    .eq('user_id', userId)
    .single()

  if (error && error.code === 'PGRST116') {
    // 記錄不存在，返回 null（不自動建立）
    return null
  }

  if (error) {
    console.error('[userCredits] getUserBalance error', error)
    return null
  }

  return data?.balance ?? null
}

/**
 * 初始化使用者點數（僅在註冊成功時呼叫）
 * @param userId - 使用者 ID（來自 users.id）
 * @returns 是否成功
 */
export async function initUserCredits(userId: string): Promise<boolean> {
  if (!userId) return false

  const { error } = await supabase
    .from('user_credits')
    .insert({
      user_id: userId,
      balance: INITIAL_BALANCE,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

  if (error) {
    console.error('[userCredits] initUserCredits failed', error)
    return false
  }

  return true
}

/**
 * 記錄使用紀錄到 usage_logs
 * @param userId - 使用者 ID
 * @param feature - 功能名稱（如 'summary', 'homework'）
 * @param inputChars - 輸入字數
 * @param outputChars - 輸出字數
 * @param totalChars - 總使用字數
 */
export async function logUsage(
  userId: string,
  feature: string,
  inputChars: number,
  outputChars: number,
  totalChars: number
): Promise<void> {
  if (!userId) return

  const { error } = await supabase.from('usage_logs').insert({
    user_id: userId,
    feature,
    input_chars: inputChars,
    output_chars: outputChars,
    total_chars: totalChars,
    created_at: new Date().toISOString(),
  })

  if (error) {
    console.error('[userCredits] logUsage failed', error)
  }
}

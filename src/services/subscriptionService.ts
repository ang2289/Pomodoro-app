import { supabase } from '../utils/supabaseClient'

export interface WebSubscriptionStatus {
  is_web_subscribed: boolean
  user_id?: string
}

/**
 * 取得當前使用者的網站訂閱狀態
 */
export async function getWebSubscriptionStatus(): Promise<boolean> {
  try {
    // 獲取當前使用者
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      // 未登入，預設未訂閱
      return false
    }

    // 查詢使用者的訂閱狀態
    // 假設有個 profiles 或 user_profiles 表儲存使用者資料
    const { data, error } = await supabase
      .from('profiles')  // 若表名不同，請修改此處
      .select('is_web_subscribed')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('查詢訂閱狀態失敗:', error)
      // 查詢失敗，預設未訂閱
      return false
    }

    return data?.is_web_subscribed ?? false
  } catch (error) {
    console.error('取得訂閱狀態異常:', error)
    return false
  }
}

/**
 * 更新網站訂閱狀態
 */
export async function updateWebSubscriptionStatus(isSubscribed: boolean): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.error('未登入無法更新訂閱狀態')
      return false
    }

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        is_web_subscribed: isSubscribed,
        updated_at: new Date().toISOString()
      })

    if (error) {
      console.error('更新訂閱狀態失敗:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('更新訂閱狀態異常:', error)
    return false
  }
}

/**
 * 新增或更新訂閱資料
 * @param email 使用者信箱
 * @param subscriptionId PayPal 訂閱 ID
 */
export async function upsertSubscription(email: string, subscriptionId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .upsert({
      email,
      subscription_id: subscriptionId,
      is_active: true,
      updated_at: new Date().toISOString()
    })
  if (error) console.error('上傳訂閱資料失敗:', error.message)
  return data
}

/**
 * 取消訂閱（設定為無效）
 * @param email 使用者信箱
 */
export async function cancelSubscription(email: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq('email', email)
  if (error) console.error('取消訂閱失敗:', error.message)
  return data
}

/**
 * 查詢使用者的訂閱狀態
 * @param email 使用者信箱
 */
export async function getSubscriptionStatus(email: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('is_active, subscription_id, updated_at')
    .eq('email', email)
    .maybeSingle()
  if (error) console.error('查詢訂閱狀態失敗:', error.message)
  return data
}


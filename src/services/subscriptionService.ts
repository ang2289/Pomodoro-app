// ⚠️ 已停用：此服務已不再使用
// 原因：移除 Supabase Auth 和 subscriptions/profiles 表

import { supabase } from '../lib/supabase'

export interface WebSubscriptionStatus {
  is_web_subscribed: boolean
  user_id?: string
}

/**
 * @deprecated 已停用，不再支援 Supabase Auth
 */
export async function getWebSubscriptionStatus(): Promise<boolean> {
  console.warn('[subscriptionService] getWebSubscriptionStatus 已停用')
  return false
}

/**
 * @deprecated 已停用，不再支援 Supabase Auth
 */
export async function updateWebSubscriptionStatus(isSubscribed: boolean): Promise<boolean> {
  console.warn('[subscriptionService] updateWebSubscriptionStatus 已停用')
  return false
}

/**
 * @deprecated 已停用，不再支援 subscriptions 表
 */
export async function upsertSubscription(email: string, subscriptionId: string) {
  console.warn('[subscriptionService] upsertSubscription 已停用')
  return null
}

/**
 * @deprecated 已停用，不再支援 subscriptions 表
 */
export async function cancelSubscription(email: string) {
  console.warn('[subscriptionService] cancelSubscription 已停用')
  return null
}

/**
 * @deprecated 已停用，不再支援 subscriptions 表
 */
export async function getSubscriptionStatus(email: string) {
  console.warn('[subscriptionService] getSubscriptionStatus 已停用')
  return null
}

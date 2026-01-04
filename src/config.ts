// 網站配置
export const config = {
  baseUrl: window.location.origin,
  // ❌ 已移除：summaryFunctionUrl - 現在統一使用 supabase.functions.invoke('auto-summary', ...)
  // summaryFunctionUrl: import.meta.env.VITE_SUMMARY_FUNCTION_URL,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

// ============================================
// 方案與額度配置（單一來源）
// ============================================

/**
 * 免費體驗額度（內部點數：10,000 點）
 * UI 顯示為「可處理約 10,000 字」
 */
export const FREE_TRIAL_QUOTA = 10000

/**
 * 方案定義
 * 內部使用點數計算，UI 顯示為「可處理字數 / 使用上限」
 */
export const PLANS = {
  free: {
    name: '免費方案',
    nameEn: 'Free Plan',
    price: 0,
    monthlyQuota: FREE_TRIAL_QUOTA, // 免費體驗：10,000 字
  },
  plan99: {
    name: '服務方案',
    nameEn: 'Service Plan',
    price: 99,
    monthlyQuota: 100000, // NT$99 方案：100,000 字
  },
  plan199: {
    name: '服務方案',
    nameEn: 'Service Plan',
    price: 199,
    monthlyQuota: 300000, // NT$199 方案：300,000 字
  },
} as const

/**
 * 取得免費體驗額度（供其他模組使用）
 */
export function getFreeTrialQuota(): number {
  return FREE_TRIAL_QUOTA
}

/**
 * 取得指定方案的額度
 */
export function getPlanQuota(planKey: keyof typeof PLANS): number {
  return PLANS[planKey].monthlyQuota
}

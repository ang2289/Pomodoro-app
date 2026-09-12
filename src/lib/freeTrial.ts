// 免費試用管理工具（全站共用）
// 規則：
// - 未登入使用者：全站共用 3 次免費試用
// - 已登入使用者：使用點數系統
// - 試用次數記錄於 localStorage

const FREE_TRIAL_STORAGE_KEY = 'free_trial_used_count'
const FREE_TRIAL_MAX_COUNT = 3

/**
 * 取得已使用的免費試用次數
 */
export function getFreeTrialUsedCount(): number {
  if (typeof window === 'undefined') return 0
  
  const stored = localStorage.getItem(FREE_TRIAL_STORAGE_KEY)
  if (!stored) return 0
  
  try {
    const count = parseInt(stored, 10)
    return isNaN(count) ? 0 : Math.max(0, count)
  } catch {
    return 0
  }
}

/**
 * 增加免費試用次數（僅在 API 成功回傳後呼叫）
 */
export function incrementFreeTrialCount(): number {
  if (typeof window === 'undefined') return 0
  
  const currentCount = getFreeTrialUsedCount()
  const newCount = Math.min(currentCount + 1, FREE_TRIAL_MAX_COUNT)
  
  localStorage.setItem(FREE_TRIAL_STORAGE_KEY, newCount.toString())
  return newCount
}

/**
 * 檢查是否還有免費試用次數
 */
export function hasFreeTrialRemaining(): boolean {
  return getFreeTrialUsedCount() < FREE_TRIAL_MAX_COUNT
}

/**
 * 取得剩餘免費試用次數
 */
export function getRemainingFreeTrialCount(): number {
  return Math.max(0, FREE_TRIAL_MAX_COUNT - getFreeTrialUsedCount())
}

/**
 * 重置免費試用次數（僅用於測試或特殊情況）
 */
export function resetFreeTrialCount(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(FREE_TRIAL_STORAGE_KEY)
}

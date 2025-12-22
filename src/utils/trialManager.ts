/**
 * 免費體驗起始時間管理工具
 * 
 * 功能：
 * - 使用 localStorage 儲存 trial_start_at
 * - 若不存在，第一次使用任何 AI 模組時自動寫入當前時間
 * - 一旦寫入，不可被重置
 * - 不會因為切換模組而重設
 */

import { isDevelopment } from './envUtils'

const TRIAL_START_AT_KEY = 'trial_start_at'

/**
 * 取得免費體驗起始時間
 * @returns ISO time string 或 null（如果尚未初始化）
 */
export function getTrialStartAt(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const stored = localStorage.getItem(TRIAL_START_AT_KEY)
    if (stored) {
      // 驗證是否為有效的 ISO 時間字串
      const date = new Date(stored)
      if (!isNaN(date.getTime())) {
        return stored
      }
      // 如果儲存的值無效，清除它並返回 null
      localStorage.removeItem(TRIAL_START_AT_KEY)
      return null
    }
    return null
  } catch (error) {
    console.error('[trialManager] 讀取 trial_start_at 時發生錯誤:', error)
    return null
  }
}

/**
 * 確保免費體驗起始時間已初始化
 * 如果不存在，則寫入當前時間（ISO 格式）
 * 一旦寫入，不可被重置
 * 
 * @returns ISO time string（已存在的或新建立的）
 */
export function ensureTrialStartAt(): string {
  if (typeof window === 'undefined') {
    // SSR 環境下返回當前時間（但不會儲存）
    return new Date().toISOString()
  }

  try {
    // 先檢查是否已存在
    const existing = getTrialStartAt()
    if (existing) {
      return existing
    }

    // 如果不存在，寫入當前時間
    const now = new Date().toISOString()
    localStorage.setItem(TRIAL_START_AT_KEY, now)
    console.log('[trialManager] 初始化免費體驗起始時間:', now)
    return now
  } catch (error) {
    console.error('[trialManager] 寫入 trial_start_at 時發生錯誤:', error)
    // 即使寫入失敗，也返回當前時間（用於計算）
    return new Date().toISOString()
  }
}

/**
 * 檢查免費體驗是否已過期（7 日內需使用完畢）
 * 
 * 規則：
 * - 若為開發環境（localhost），一律回傳 false（不計算過期）
 * - 若不存在 trial_start_at，視為尚未開始體驗，回傳 false
 * - 若目前時間 - trial_start_at >= 7 天，回傳 true
 * - 否則回傳 false
 * 
 * @returns 是否已過期
 */
export function isTrialExpired(): boolean {
  // ✅ 使用統一的環境判斷函數，正式網域（非 localhost）時強制視為 production
  // 開發環境下，一律回傳 false（不計算過期）
  if (isDevelopment()) {
    return false
  }

  // 取得 trial_start_at
  const trialStartAt = getTrialStartAt()

  // 若不存在 trial_start_at，視為尚未開始體驗，回傳 false
  if (!trialStartAt) {
    return false
  }

  try {
    const startDate = new Date(trialStartAt)
    const now = new Date()
    const diffTime = now.getTime() - startDate.getTime()
    const diffDays = diffTime / (1000 * 60 * 60 * 24)
    
    // 若目前時間 - trial_start_at >= 7 天，回傳 true
    return diffDays >= 7
  } catch (error) {
    console.error('[trialManager] 計算體驗過期時間時發生錯誤:', error)
    return false
  }
}

/**
 * 取得免費體驗剩餘天數
 * @param trialStartAt - 免費體驗起始時間（ISO string）
 * @param daysLimit - 天數限制（預設 7 天）
 * @returns 剩餘天數（如果已過期則返回 0）
 */
export function getTrialRemainingDays(trialStartAt: string | null, daysLimit: number = 7): number {
  if (!trialStartAt) {
    return daysLimit // 尚未初始化，返回完整天數
  }

  try {
    const startDate = new Date(trialStartAt)
    const now = new Date()
    const diffTime = now.getTime() - startDate.getTime()
    const diffDays = diffTime / (1000 * 60 * 60 * 24)
    const remaining = daysLimit - diffDays
    return Math.max(0, Math.ceil(remaining))
  } catch (error) {
    console.error('[trialManager] 計算體驗剩餘天數時發生錯誤:', error)
    return daysLimit
  }
}


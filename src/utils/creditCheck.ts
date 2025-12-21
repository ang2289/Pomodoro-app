/**
 * 統一點數檢查流程
 * 在所有 AI 模組「實際呼叫 Edge Function 前」使用
 * 
 * 流程順序：
 * 1. 如果是 DEV 模式 → 直接放行
 * 2. 如果是付費點數 > 0 → 直接放行
 * 3. 如果是體驗點數：
 *    - 若 isTrialExpired() === true → 阻止執行
 *    - 若尚未過期 → 允許並扣體驗點數
 */

import { isTrialExpired, ensureTrialStartAt } from './trialManager'

const FREE_TRIAL_QUOTA = 10000 // 免費體驗額度：10,000 字

interface CreditCheckResult {
  /** 是否允許執行 */
  allowed: boolean
  /** 原因說明 */
  reason?: string
  /** 是否需要初始化 trial_start_at */
  shouldInitTrial?: boolean
}

/**
 * 統一點數檢查流程
 * 
 * @param remainingChars - 剩餘點數（null 表示未登入，使用體驗點數）
 * @returns 檢查結果
 */
export function checkCreditBeforeApiCall(remainingChars: number | null): CreditCheckResult {
  // 1. 如果是 DEV 模式 → 直接放行
  if (import.meta.env.DEV === true) {
    return {
      allowed: true,
      reason: 'DEV_MODE',
    }
  }

  // 2. 如果是付費點數 > 0 → 直接放行
  // 判斷邏輯：如果 remainingChars > FREE_TRIAL_QUOTA，視為付費點數
  if (remainingChars !== null && remainingChars > FREE_TRIAL_QUOTA) {
    return {
      allowed: true,
      reason: 'PAID_CREDITS',
    }
  }

  // 3. 如果是體驗點數（remainingChars === null 或 remainingChars <= FREE_TRIAL_QUOTA）
  // 確保 trial_start_at 已初始化
  ensureTrialStartAt()

  // 檢查是否過期
  if (isTrialExpired()) {
    return {
      allowed: false,
      reason: 'TRIAL_EXPIRED',
    }
  }

  // 體驗尚未過期，允許執行
  return {
    allowed: true,
    reason: 'TRIAL_ACTIVE',
  }
}


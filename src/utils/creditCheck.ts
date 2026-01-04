/**
 * ⚠️ 已停用：此檔案已不再使用，改為在每個功能中直接檢查登入狀態
 * @deprecated 已停用，請使用 user_credits 系統
 */

import { FREE_TRIAL_QUOTA } from '@/config'

interface CreditCheckResult {
  /** 是否允許執行 */
  allowed: boolean
  /** 原因說明 */
  reason?: string
  /** 是否需要初始化 trial_start_at */
  shouldInitTrial?: boolean
}

/**
 * ⚠️ 已停用：此函數已不再使用，改為在每個功能中直接檢查登入狀態
 * @deprecated 已停用，請使用 user_credits 系統
 * 
 * @param remainingChars - 剩餘點數（null 表示未登入，使用體驗點數）
 * @returns 檢查結果
 */
export function checkCreditBeforeApiCall(remainingChars: number | null): CreditCheckResult {
  // ⚠️ 已停用：此函數會拋出錯誤，提醒開發者改用登入檢查
  throw new Error('checkCreditBeforeApiCall 已停用，請在功能中直接檢查登入狀態並使用 user_credits 系統')
}


// 共用的扣點檢查邏輯 Hook
// 用於摘要和解題功能，在送出請求前檢查字數是否足夠

import { useAuthCredits } from './useAuthCredits'

const FREE_TRIAL_QUOTA = 10000 // 免費體驗額度：10,000 字
const FREE_REMAINING_KEY = 'free_characters_remaining' // localStorage key（儲存剩餘點數）

interface CreditCheckResult {
  /** 是否可以送出請求 */
  canProceed: boolean
  /** 剩餘可用字數 */
  remainingChars: number
  /** 已使用字數 */
  usedChars: number
  /** 錯誤訊息（如果無法送出） */
  errorMessage?: string
}

/**
 * 共用的扣點檢查 Hook
 * @param inputLength 使用者輸入的字數
 * @returns 檢查結果
 */
export function useCreditCheck(inputLength: number): CreditCheckResult {
  const { remainingChars, loading: creditsLoading } = useAuthCredits()

  // 計算剩餘可用字數（優先使用登入狀態的 remainingChars，否則使用免費額度計算）
  // ⚠️ 不在渲染階段寫入 localStorage，避免 side effect
  const getRemainingChars = (): number => {
    if (remainingChars !== null) {
      return remainingChars
    }
    // 未登入時從 localStorage 讀取剩餘點數
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(FREE_REMAINING_KEY)
      if (saved !== null) {
        const remaining = parseInt(saved, 10)
        // 確保不會是負數
        return Math.max(0, remaining)
      }
      // 如果沒有值，回傳預設額度（不在這裡寫入 localStorage）
      return FREE_TRIAL_QUOTA
    }
    return FREE_TRIAL_QUOTA
  }

  // 計算已使用字數
  const getUsedChars = (): number => {
    if (remainingChars !== null && remainingChars < FREE_TRIAL_QUOTA) {
      // 登入狀態：已使用 = 免費額度 - 剩餘
      return FREE_TRIAL_QUOTA - remainingChars
    }
    // 未登入狀態：已使用 = 免費額度 - 剩餘
    const remaining = getRemainingChars()
    return FREE_TRIAL_QUOTA - remaining
  }

  const currentRemaining = getRemainingChars()
  const currentUsed = getUsedChars()

  // 如果正在載入點數，暫時允許（避免在載入時阻擋）
  if (creditsLoading) {
    return {
      canProceed: true,
      remainingChars: currentRemaining,
      usedChars: currentUsed,
    }
  }

  // 檢查字數是否足夠（剩餘點數 <= 0 時也阻擋）
  if (currentRemaining <= 0) {
    return {
      canProceed: false,
      remainingChars: currentRemaining,
      usedChars: currentUsed,
      errorMessage: '點數已用完，請升級方案（尚未開放）',
    }
  }

  // 檢查字數是否足夠
  if (inputLength > 0 && inputLength > currentRemaining) {
    return {
      canProceed: false,
      remainingChars: currentRemaining,
      usedChars: currentUsed,
      errorMessage: '剩餘字數不足，請升級方案（尚未開放）',
    }
  }

  return {
    canProceed: true,
    remainingChars: currentRemaining,
    usedChars: currentUsed,
  }
}

/**
 * 更新未登入使用者的剩餘點數（扣點後呼叫）
 * @param deductedChars 扣除的字數
 */
export function updateFreeRemainingChars(deductedChars: number): void {
  if (typeof window === 'undefined') return
  
  const saved = localStorage.getItem(FREE_REMAINING_KEY)
  const currentRemaining = saved !== null ? parseInt(saved, 10) : FREE_TRIAL_QUOTA
  const newRemaining = Math.max(0, currentRemaining - deductedChars)
  localStorage.setItem(FREE_REMAINING_KEY, newRemaining.toString())
}


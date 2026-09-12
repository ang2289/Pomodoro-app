// ⚠️ 已停用：此 Hook 已不再使用
// 原因：移除 Supabase Auth 和舊點數系統
// 如需檢查點數，請使用 src/lib/userCredits.ts

interface CreditCheckResult {
  canProceed: boolean
  remainingChars: number
  usedChars: number
  errorMessage?: string
  reason?: string
}

/**
 * @deprecated 已停用，不再支援舊點數系統
 */
export function useCreditCheck(inputLength: number): CreditCheckResult {
  // 已停用：不再進行任何檢查
  return {
    canProceed: true,
    remainingChars: 0,
    usedChars: 0,
  }
}

/**
 * @deprecated 已停用
 */
export function updateFreeRemainingChars(deductedChars: number): void {
  // 已停用
}

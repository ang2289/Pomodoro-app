// ⚠️ 已停用：此 Hook 已不再使用
// 原因：移除 Supabase Auth 和舊點數系統（trial_*, paid_*）
// 如需取得使用者點數，請使用 src/lib/userCredits.ts

import { useState } from 'react'

interface UseUserCreditsResult {
  trialRemaining: number | null
  paidRemaining: number | null
  totalRemaining: number | null
  loading: boolean
  error: string | null
}

/**
 * @deprecated 已停用，請使用 src/lib/userCredits.ts
 */
export function useUserCredits(): UseUserCreditsResult {
  const [trialRemaining] = useState<number | null>(null)
  const [paidRemaining] = useState<number | null>(null)
  const [totalRemaining] = useState<number | null>(null)
  const [loading] = useState(false)
  const [error] = useState<string | null>(null)

  return {
    trialRemaining,
    paidRemaining,
    totalRemaining,
    loading,
    error,
  }
}

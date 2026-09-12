// ⚠️ 已停用：此 Hook 已不再使用
// 原因：移除 Supabase Auth 相關邏輯
// 如需取得使用者點數，請使用 src/lib/userCredits.ts

import { useState } from 'react'

interface UseAuthCreditsResult {
  remainingChars: number | null
  loading: boolean
  error: string | null
  refresh: (backendRemainingChars?: number) => Promise<void>
  showUpgradeSuccess: boolean
  onCloseUpgradeSuccess: () => void
}

/**
 * @deprecated 已停用，請使用 src/lib/userCredits.ts
 */
export function useAuthCredits(): UseAuthCreditsResult {
  const [remainingChars] = useState<number | null>(null)
  const [loading] = useState(false)
  const [error] = useState<string | null>(null)
  const [showUpgradeSuccess] = useState(false)

  const refresh = async () => {
    // 已停用
  }

  return {
    remainingChars,
    loading,
    error,
    refresh,
    showUpgradeSuccess,
    onCloseUpgradeSuccess: () => {},
  }
}

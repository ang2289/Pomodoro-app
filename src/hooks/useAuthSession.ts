// ⚠️ 已停用：此 Hook 已不再使用
// 原因：移除 Supabase Auth
// 如需檢查使用者登入狀態，請使用本地登入狀態（users.id）

import { useState } from 'react'

interface UseAuthSessionResult {
  session: any | null
  user: any | null
  loading: boolean
  refresh: () => Promise<void>
}

/**
 * @deprecated 已停用，不再支援 Supabase Auth
 */
export function useAuthSession(): UseAuthSessionResult {
  const [session] = useState<any | null>(null)
  const [user] = useState<any | null>(null)
  const [loading] = useState(false)

  const refresh = async () => {
    // 已停用
  }

  return {
    session,
    user,
    loading,
    refresh,
  }
}

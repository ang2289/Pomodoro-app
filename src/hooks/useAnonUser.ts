// ⚠️ 已停用：匿名使用者功能已移除
// 原因：不再支援匿名使用者，只支援正式登入使用者

import { useState } from 'react'

/**
 * @deprecated 已停用，不再支援匿名使用者
 */
export async function ensureAnonUser(): Promise<string> {
  console.warn('[useAnonUser] ensureAnonUser 已停用，不再支援匿名使用者')
  return ''
}

/**
 * @deprecated 已停用，不再支援匿名使用者
 */
export function useAnonUser() {
  const [userId] = useState<string | null>(null)
  const [ready] = useState(true)

  return { userId, ready }
}

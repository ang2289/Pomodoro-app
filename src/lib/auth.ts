// 最小登入狀態工具
// 不使用 Supabase Auth，不使用任何 Auth SDK
// 僅使用 localStorage 管理使用者登入狀態

const USER_ID_KEY = 'userId'

/**
 * 取得當前使用者 ID
 * @returns 使用者 ID，若未登入則返回 null
 */
export function getCurrentUserId(): string | null {
  return localStorage.getItem(USER_ID_KEY)
}

/**
 * 檢查使用者是否已登入
 * @returns 若已登入返回 true，否則返回 false
 */
export function isLoggedIn(): boolean {
  const userId = getCurrentUserId()
  return Boolean(userId)
}

/**
 * 登出使用者
 * 移除 localStorage 中的 userId
 */
export function logout(): void {
  localStorage.removeItem(USER_ID_KEY)
}

// 最小登入狀態工具
// 不使用 Supabase Auth，不使用任何 Auth SDK
// 僅使用 localStorage 管理使用者登入狀態

const USER_ID_KEY = 'userId'
const IS_LOGGED_IN_KEY = 'isLoggedIn'

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
  const flag = localStorage.getItem(IS_LOGGED_IN_KEY)
  if (flag === 'true') return true
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
  if (token?.trim()) return true
  const userId = getCurrentUserId()
  return Boolean(userId)
}

/**
 * 登出使用者
 * 移除 localStorage 中的 userId
 */
export function logout(): void {
  const keys = [
    USER_ID_KEY,
    'user_id',
    IS_LOGGED_IN_KEY,
    'rxv_logged_in',
    'token',
    'auth_token',
    'user',
    'user_email',
    'email',
    'userEmail',
    'rxv_user_email',
    'currentUserEmail',
    'loginEmail',
    'authUser',
    'currentUser',
    'rxv_user',
    'rxv_auth_user',
    'rxv_current_user',
  ]

  for (const key of keys) {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth-changed'))
    window.dispatchEvent(new Event('storage'))
    window.dispatchEvent(new CustomEvent('rxv-auth-changed'))
  }
}

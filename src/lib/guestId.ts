// Guest ID 管理工具
// 用於未登入使用者的唯一識別

const GUEST_ID_KEY = 'guestId'

/**
 * 取得或生成 Guest ID
 * 如果 localStorage 中已有 guestId，則返回現有的
 * 如果沒有，則生成新的 UUID 並存儲
 */
export function getOrCreateGuestId(): string {
  if (typeof window === 'undefined') {
    // SSR 環境，返回空字串
    return ''
  }

  let guestId = localStorage.getItem(GUEST_ID_KEY)
  
  if (!guestId) {
    // 生成新的 UUID v4
    guestId = generateUUID()
    localStorage.setItem(GUEST_ID_KEY, guestId)
  }
  
  return guestId
}

/**
 * 生成 UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * 清除 Guest ID（用於測試或特殊情況）
 */
export function clearGuestId(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(GUEST_ID_KEY)
}

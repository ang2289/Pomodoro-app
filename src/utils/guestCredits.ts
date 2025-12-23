/**
 * 訪客點數管理工具
 * 使用 localStorage 管理訪客試用點數
 * 
 * 規則：
 * - 初次使用時初始化：guest_total = 10000, guest_used = 0, guest_start_at = 現在時間
 * - 每次使用前檢查：若超過 7 天，清空所有資料並回傳錯誤
 * - 扣點方式：guest_used += 使用字數，若 guest_used > guest_total 則阻止使用
 */

const GUEST_TOTAL_KEY = 'guest_total'
const GUEST_USED_KEY = 'guest_used'
const GUEST_START_AT_KEY = 'guest_start_at'

// 試用總額（字數）
const FREE_TRIAL_QUOTA = 10000

// 試用期限（天數）
const TRIAL_PERIOD_DAYS = 7

/**
 * 初始化訪客點數（如果不存在）
 */
function initializeGuestCredits(): void {
  if (typeof window === 'undefined') {
    return
  }

  const now = Date.now()

  // 檢查是否已初始化
  const existingTotal = localStorage.getItem(GUEST_TOTAL_KEY)
  const existingUsed = localStorage.getItem(GUEST_USED_KEY)
  const existingStartAt = localStorage.getItem(GUEST_START_AT_KEY)

  if (!existingTotal || !existingUsed || !existingStartAt) {
    // 初次使用，初始化所有值
    localStorage.setItem(GUEST_TOTAL_KEY, FREE_TRIAL_QUOTA.toString())
    localStorage.setItem(GUEST_USED_KEY, '0')
    localStorage.setItem(GUEST_START_AT_KEY, now.toString())
    console.log('🆕 [guestCredits] 初始化訪客點數:', {
      total: FREE_TRIAL_QUOTA,
      used: 0,
      startAt: new Date(now).toISOString(),
    })
  }
}

/**
 * 檢查試用是否已過期
 * @returns true 表示已過期，false 表示未過期
 */
function isTrialExpired(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  const startAtStr = localStorage.getItem(GUEST_START_AT_KEY)
  if (!startAtStr) {
    return false // 尚未初始化，視為未過期
  }

  const startAt = parseInt(startAtStr, 10)
  const now = Date.now()
  const diffTime = now - startAt
  const diffDays = diffTime / (1000 * 60 * 60 * 24)

  return diffDays > TRIAL_PERIOD_DAYS
}

/**
 * 清空所有訪客點數資料
 */
function clearGuestCredits(): void {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.removeItem(GUEST_TOTAL_KEY)
  localStorage.removeItem(GUEST_USED_KEY)
  localStorage.removeItem(GUEST_START_AT_KEY)
  console.log('🗑️ [guestCredits] 已清空訪客點數資料')
}

/**
 * 取得訪客剩餘點數
 * @returns 剩餘點數，若試用已過期則回傳 0
 */
export function getGuestRemaining(): number {
  if (typeof window === 'undefined') {
    return 0
  }

  // 初始化（如果不存在）
  initializeGuestCredits()

  // 檢查是否過期
  if (isTrialExpired()) {
    clearGuestCredits()
    return 0
  }

  const totalStr = localStorage.getItem(GUEST_TOTAL_KEY)
  const usedStr = localStorage.getItem(GUEST_USED_KEY)

  if (!totalStr || !usedStr) {
    // 資料異常，重新初始化
    initializeGuestCredits()
    return FREE_TRIAL_QUOTA
  }

  const total = parseInt(totalStr, 10)
  const used = parseInt(usedStr, 10)

  const remaining = Math.max(0, total - used)
  return remaining
}

/**
 * 檢查訪客是否可以使用指定點數
 * @param requiredPoints 需要的點數
 * @returns 檢查結果物件 { allowed: boolean, reason?: string, remaining?: number }
 */
export function canGuestUse(requiredPoints: number): {
  allowed: boolean
  reason?: string
  remaining?: number
} {
  if (typeof window === 'undefined') {
    return {
      allowed: false,
      reason: '僅在瀏覽器環境中可用',
    }
  }

  // 初始化（如果不存在）
  initializeGuestCredits()

  // 檢查是否過期
  if (isTrialExpired()) {
    clearGuestCredits()
    return {
      allowed: false,
      reason: '訪客試用已到期，請登入或購買點數',
      remaining: 0,
    }
  }

  const remaining = getGuestRemaining()

  if (remaining < requiredPoints) {
    return {
      allowed: false,
      reason: remaining === 0
        ? '訪客試用額度已使用完畢，請登入或購買點數'
        : `剩餘點數不足（需要 ${requiredPoints.toLocaleString()} 字，僅剩 ${remaining.toLocaleString()} 字）`,
      remaining,
    }
  }

  return {
    allowed: true,
    remaining,
  }
}

/**
 * 扣除訪客點數
 * @param points 要扣除的點數
 * @returns 扣除結果物件 { success: boolean, remaining?: number, error?: string }
 */
export function consumeGuestPoints(points: number): {
  success: boolean
  remaining?: number
  error?: string
} {
  if (typeof window === 'undefined') {
    return {
      success: false,
      error: '僅在瀏覽器環境中可用',
    }
  }

  // 初始化（如果不存在）
  initializeGuestCredits()

  // 檢查是否過期
  if (isTrialExpired()) {
    clearGuestCredits()
    return {
      success: false,
      error: '訪客試用已到期，請登入或購買點數',
      remaining: 0,
    }
  }

  // 檢查點數是否足夠
  const checkResult = canGuestUse(points)
  if (!checkResult.allowed) {
    return {
      success: false,
      error: checkResult.reason || '點數不足',
      remaining: checkResult.remaining,
    }
  }

  // 讀取當前值
  const usedStr = localStorage.getItem(GUEST_USED_KEY)
  const totalStr = localStorage.getItem(GUEST_TOTAL_KEY)

  if (!usedStr || !totalStr) {
    // 資料異常，重新初始化
    initializeGuestCredits()
    return {
      success: false,
      error: '點數資料異常，已重新初始化',
      remaining: FREE_TRIAL_QUOTA,
    }
  }

  const currentUsed = parseInt(usedStr, 10)
  const total = parseInt(totalStr, 10)

  // 計算新的已使用點數
  const newUsed = currentUsed + points

  // 再次檢查是否超過總額
  if (newUsed > total) {
    return {
      success: false,
      error: '點數不足，無法扣除',
      remaining: Math.max(0, total - currentUsed),
    }
  }

  // 更新 localStorage
  localStorage.setItem(GUEST_USED_KEY, newUsed.toString())

  // 計算剩餘點數
  const remaining = total - newUsed

  console.log('💰 [guestCredits] 扣除訪客點數:', {
    points: points.toLocaleString(),
    beforeUsed: currentUsed.toLocaleString(),
    afterUsed: newUsed.toLocaleString(),
    remaining: remaining.toLocaleString(),
  })

  // 觸發自定義事件通知其他組件
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('localStorageUpdate'))
  }

  return {
    success: true,
    remaining,
  }
}

/**
 * 取得訪客點數詳細資訊（用於除錯或顯示）
 * @returns 點數資訊物件
 */
export function getGuestCreditsInfo(): {
  total: number
  used: number
  remaining: number
  startAt: number | null
  daysRemaining: number | null
  isExpired: boolean
} {
  if (typeof window === 'undefined') {
    return {
      total: 0,
      used: 0,
      remaining: 0,
      startAt: null,
      daysRemaining: null,
      isExpired: false,
    }
  }

  initializeGuestCredits()

  const totalStr = localStorage.getItem(GUEST_TOTAL_KEY)
  const usedStr = localStorage.getItem(GUEST_USED_KEY)
  const startAtStr = localStorage.getItem(GUEST_START_AT_KEY)

  const total = totalStr ? parseInt(totalStr, 10) : FREE_TRIAL_QUOTA
  const used = usedStr ? parseInt(usedStr, 10) : 0
  const remaining = Math.max(0, total - used)
  const startAt = startAtStr ? parseInt(startAtStr, 10) : null

  let daysRemaining: number | null = null
  if (startAt) {
    const now = Date.now()
    const diffTime = startAt + (TRIAL_PERIOD_DAYS * 24 * 60 * 60 * 1000) - now
    daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
  }

  const isExpired = isTrialExpired()

  return {
    total,
    used,
    remaining,
    startAt,
    daysRemaining,
    isExpired,
  }
}

/**
 * 重置訪客點數（用於測試或管理）
 */
export function resetGuestCredits(): void {
  clearGuestCredits()
  initializeGuestCredits()
  console.log('🔄 [guestCredits] 已重置訪客點數')
}


// 共用的字數 / 使用額度狀態列元件
// 用於摘要和解題頁面，提供即時的字數狀態顯示

import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthCredits } from '@/hooks/useAuthCredits'
import { FREE_TRIAL_QUOTA } from '@/config'

interface CreditStatusBarProps {
  /** 當前輸入字數 */
  inputChars: number
  /** 是否正在處理中（API 請求中） */
  isLoading: boolean
  /** 功能名稱（用於顯示文案） */
  featureName: 'summary' | 'homework'
  /** 語言設定 */
  lang?: 'zh-tw' | 'en'
}

const FREE_REMAINING_KEY = 'free_characters_remaining' // localStorage key（儲存剩餘可用額度）

export default function CreditStatusBar({
  inputChars,
  isLoading,
  featureName,
  lang = 'zh-tw',
}: CreditStatusBarProps) {
  const navigate = useNavigate()
  // 不讀取 creditsLoading，避免初始畫面顯示載入中
  const { remainingChars } = useAuthCredits()
  
  // 從 localStorage 讀取剩餘可用額度（未登入時使用）
  const [freeRemainingChars, setFreeRemainingChars] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(FREE_REMAINING_KEY)
      if (saved !== null) {
        const remaining = parseInt(saved, 10)
        return Math.max(0, remaining)
      }
      // 如果沒有值，初始化為 10,000
      localStorage.setItem(FREE_REMAINING_KEY, FREE_TRIAL_QUOTA.toString())
      return FREE_TRIAL_QUOTA
    }
    return FREE_TRIAL_QUOTA
  })

  // 監聽 localStorage 變化（當其他組件更新時同步）
  useEffect(() => {
    if (typeof window === 'undefined' || remainingChars !== null) return

    const handleStorageChange = () => {
      const saved = localStorage.getItem(FREE_REMAINING_KEY)
      if (saved !== null) {
        const remaining = parseInt(saved, 10)
        setFreeRemainingChars((prev) => {
          const newValue = Math.max(0, remaining)
          // 只有值真的改變時才更新，避免無限循環
          return prev !== newValue ? newValue : prev
        })
      }
    }

    // 監聽 storage 事件（跨標籤頁同步）
    window.addEventListener('storage', handleStorageChange)
    // 監聽自定義事件（同標籤頁內更新）
    window.addEventListener('localStorageUpdate', handleStorageChange)
    
    // 定期檢查 localStorage（處理同標籤頁內的更新）
    const interval = setInterval(() => {
      const saved = localStorage.getItem(FREE_REMAINING_KEY)
      if (saved !== null) {
        const remaining = parseInt(saved, 10)
        const newValue = Math.max(0, remaining)
        setFreeRemainingChars((prev) => {
          // 只有值真的改變時才更新，避免無限循環
          return prev !== newValue ? newValue : prev
        })
      }
    }, 500)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('localStorageUpdate', handleStorageChange)
      clearInterval(interval)
    }
  }, [remainingChars]) // 移除 freeRemainingChars 從依賴項，避免無限循環

  // 計算剩餘可用字數（優先使用登入狀態的 remainingChars，否則使用免費額度計算）
  const getRemainingChars = () => {
    if (remainingChars !== null) {
      return remainingChars
    }
    // 未登入時從 localStorage 讀取
    return freeRemainingChars
  }

  // 計算已使用字數（登入時從 API，未登入時從 localStorage）
  const getUsedChars = () => {
    if (remainingChars !== null && remainingChars < FREE_TRIAL_QUOTA) {
      // 登入狀態：已使用 = 免費額度 - 剩餘
      return FREE_TRIAL_QUOTA - remainingChars
    }
    // 未登入狀態：已使用 = 免費額度 - 剩餘
    return FREE_TRIAL_QUOTA - freeRemainingChars
  }

  const currentRemaining = getRemainingChars()
  const currentUsed = getUsedChars()

  // 更新剩餘可用額度（API 成功後呼叫）
  const updateRemainingChars = (usedPoints: number) => {
    if (remainingChars === null) {
      // 未登入：更新 localStorage
      const newRemaining = Math.max(0, freeRemainingChars - usedPoints)
      setFreeRemainingChars(newRemaining)
      localStorage.setItem(FREE_REMAINING_KEY, newRemaining.toString())
      // 觸發自定義事件通知其他組件
      window.dispatchEvent(new Event('localStorageUpdate'))
    }
    // 登入狀態：由 useAuthCredits Hook 自動更新
  }

  // 暴露給父元件使用的方法（透過 ref 或 callback）
  useEffect(() => {
    // 將更新方法存到 window 供父元件呼叫
    ;(window as any).__updateRemainingChars = updateRemainingChars
    return () => {
      delete (window as any).__updateRemainingChars
    }
  }, [freeRemainingChars, remainingChars])

  // 固定顯示三項：可處理字數、已使用、剩餘可用
  // 不顯示 loading、空白或「—」，頁面載入時即顯示
  // 若使用者尚未輸入內容：已使用字數顯示為 0，剩餘字數顯示為 10,000
  
  // 計算顯示用的數值（確保不為 null 或 undefined）
  const displayTotal = FREE_TRIAL_QUOTA
  const displayUsed = currentUsed
  const displayRemaining = currentRemaining

  // 檢查是否為開發模式
  const isDevMode = import.meta.env.DEV === true
  
  // 檢查是否為可處理字數且剩餘低於 2,000 字
  const isLowBalance = displayRemaining < 2000 && displayRemaining > 0
  // 檢查可處理字數是否已用完
  const isExhausted = displayRemaining === 0

  return (
    <div className="relative">
      <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="space-y-1.5">
          <p className="text-sm text-gray-700">
            {lang === 'zh-tw' 
              ? `可處理字數：${displayTotal.toLocaleString()} 字`
              : `Processable Characters: ${displayTotal.toLocaleString()} characters`}
          </p>
          <p className="text-sm text-gray-700">
            {lang === 'zh-tw' 
              ? `已使用：${displayUsed.toLocaleString()} 字`
              : `Used: ${displayUsed.toLocaleString()} characters`}
          </p>
          <p className="text-sm text-gray-700">
            {lang === 'zh-tw' 
              ? `剩餘可用：${displayRemaining.toLocaleString()} 字`
              : `Remaining: ${displayRemaining.toLocaleString()} characters`}
          </p>
        </div>
      </div>
      
      {/* 開發模式提示（畫面角落小字） */}
      {isDevMode && (
        <div className="absolute top-0 right-0 mt-1 mr-1">
          <p className="text-[10px] text-gray-400 font-mono">
            {lang === 'zh-tw' ? '開發模式：不計算使用額度' : 'Dev Mode: No Usage Deduction'}
          </p>
        </div>
      )}
      
      {/* 可處理字數即將用完提示（非彈窗）- 開發模式下不顯示 */}
      {!isDevMode && isLowBalance && !isExhausted && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800 text-center">
            {lang === 'zh-tw' 
              ? '你的可處理字數即將用完，歡迎繼續試用或之後再回來使用 😊'
              : 'Your processable characters are running low. Feel free to continue or come back later 😊'}
          </p>
        </div>
      )}

      {/* 可處理字數已用完提示（友善說明，非錯誤訊息）- 開發模式下不顯示 */}
      {!isDevMode && isExhausted && (
        <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="space-y-3">
            <p className="text-sm text-blue-800 text-center leading-relaxed">
              {lang === 'zh-tw' 
                ? (
                  <>
                    可處理字數已使用完畢 🎉<br />
                    如果你覺得這個功能對你有幫助，<br />
                    之後可購買 AI 服務使用方案繼續使用。<br />
                    付費方案為一次性服務，無訂閱、無自動扣款。
                  </>
                )
                : (
                  <>
                    Processable characters have been used up 🎉<br />
                    If you find this feature helpful,<br />
                    you can purchase an AI service plan to continue.<br />
                    Paid plans are one-time; no subscription or auto-billing.
                  </>
                )}
            </p>
            <div className="flex justify-center">
              <Link
                to="/points"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                {lang === 'zh-tw' ? '了解使用方案' : 'Learn About Plans'}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 導出更新剩餘點數的方法（供 API 成功後呼叫）
// 只接受後端實際回傳的 usedPoints，不再自行計算
export const updateUsedCharsAfterSuccess = (usedPoints: number) => {
  if (typeof window !== 'undefined' && (window as any).__updateRemainingChars) {
    ;(window as any).__updateRemainingChars(usedPoints)
  }
}


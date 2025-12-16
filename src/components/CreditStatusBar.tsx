// 共用的字數 / 點數狀態列元件
// 用於摘要和解題頁面，提供即時的字數狀態顯示

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthCredits } from '@/hooks/useAuthCredits'

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

const FREE_TRIAL_QUOTA = 10000 // 免費體驗額度：10,000 字
const FREE_REMAINING_KEY = 'free_characters_remaining' // localStorage key（儲存剩餘點數）

export default function CreditStatusBar({
  inputChars,
  isLoading,
  featureName,
  lang = 'zh-tw',
}: CreditStatusBarProps) {
  const navigate = useNavigate()
  // 不讀取 creditsLoading，避免初始畫面顯示載入中
  const { remainingChars } = useAuthCredits()
  
  // 從 localStorage 讀取剩餘點數（未登入時使用）
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
        setFreeRemainingChars(Math.max(0, remaining))
      }
    }

    // 監聽 storage 事件（跨標籤頁同步）
    window.addEventListener('storage', handleStorageChange)
    
    // 定期檢查 localStorage（處理同標籤頁內的更新）
    const interval = setInterval(() => {
      const saved = localStorage.getItem(FREE_REMAINING_KEY)
      if (saved !== null) {
        const remaining = parseInt(saved, 10)
        if (remaining !== freeRemainingChars) {
          setFreeRemainingChars(Math.max(0, remaining))
        }
      }
    }, 500)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [freeRemainingChars, remainingChars])

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

  // 更新剩餘點數（API 成功後呼叫）
  const updateRemainingChars = (deductedChars: number) => {
    if (remainingChars === null) {
      // 未登入：更新 localStorage
      const newRemaining = Math.max(0, freeRemainingChars - deductedChars)
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

  // 固定顯示三項：試用總額、已使用、剩餘可用
  // 不顯示 loading、空白或「—」，頁面載入時即顯示
  // 若使用者尚未輸入內容：已使用字數顯示為 0，剩餘字數顯示為 10,000
  
  // 計算顯示用的數值（確保不為 null 或 undefined）
  const displayTotal = FREE_TRIAL_QUOTA
  const displayUsed = currentUsed
  const displayRemaining = currentRemaining

  return (
    <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="space-y-1.5">
        <p className="text-sm text-gray-700">
          {lang === 'zh-tw' 
            ? `試用總額：${displayTotal.toLocaleString()} 字`
            : `Trial Total: ${displayTotal.toLocaleString()} characters`}
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
  )
}

// 導出更新剩餘點數的方法（供 API 成功後呼叫）
export const updateUsedCharsAfterSuccess = (deductedChars: number) => {
  if (typeof window !== 'undefined' && (window as any).__updateRemainingChars) {
    ;(window as any).__updateRemainingChars(deductedChars)
  }
}


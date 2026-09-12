import { useState, useEffect } from 'react'

export const useAdFree = () => {
  const [isAdFree, setIsAdFree] = useState(false)

  // 載入時檢查 localStorage 中的訂閱狀態
  useEffect(() => {
    const adFreeStatus = localStorage.getItem('isAdFree')
    setIsAdFree(adFreeStatus === 'true')
  }, [])

  // 訂閱去廣告功能
  const subscribeAdFree = () => {
    if (isAdFree) return false // 如果已經訂閱，返回 false

    const confirmed = window.confirm('您確定要訂閱並移除廣告嗎？')
    if (confirmed) {
      localStorage.setItem('isAdFree', 'true')
      setIsAdFree(true)
      return true
    }
    return false
  }

  // 取消訂閱（可選功能）
  const unsubscribeAdFree = () => {
    const confirmed = window.confirm('您確定要取消訂閱嗎？取消後將重新顯示廣告。')
    if (confirmed) {
      localStorage.removeItem('isAdFree')
      setIsAdFree(false)
      return true
    }
    return false
  }

  return {
    isAdFree,
    subscribeAdFree,
    unsubscribeAdFree
  }
}









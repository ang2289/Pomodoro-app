// 免費試用檢查 Hook（全站共用）
// 用於在 API 呼叫前檢查免費試用次數

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isLoggedIn } from '@/lib/auth'
import { getFreeTrialUsedCount, hasFreeTrialRemaining, incrementFreeTrialCount } from '@/lib/freeTrial'
import { trackEvent } from '@/utils/analytics'

interface UseFreeTrialCheckResult {
  canProceed: boolean
  showExhaustedPrompt: boolean
  usedCount: number
  remainingCount: number
  checkBeforeApiCall: () => boolean
  recordSuccessfulUse: () => void
  dismissPrompt: () => void
}

/**
 * 免費試用檢查 Hook
 * 用於在 API 呼叫前檢查，並在成功後記錄使用次數
 */
export function useFreeTrialCheck(): UseFreeTrialCheckResult {
  const navigate = useNavigate()
  const [showExhaustedPrompt, setShowExhaustedPrompt] = useState(false)
  const [usedCount, setUsedCount] = useState(getFreeTrialUsedCount())
  const remainingCount = 3 - usedCount

  /**
   * 在 API 呼叫前檢查是否可以繼續
   * @returns true 如果可以繼續，false 如果應該阻擋
   */
  const checkBeforeApiCall = (): boolean => {
    // 如果已登入，不需要檢查免費試用
    if (isLoggedIn()) {
      return true
    }

    // 未登入：檢查免費試用次數
    const currentCount = getFreeTrialUsedCount()
    setUsedCount(currentCount)

    if (currentCount >= 3) {
      // 試用已用完，顯示提示並阻擋 API 呼叫
      setShowExhaustedPrompt(true)
      trackEvent('free_trial_exhausted', {
        source: 'api_call_blocked'
      })
      return false
    }

    return true
  }

  /**
   * 記錄成功使用（僅在 API 成功回傳後呼叫）
   */
  const recordSuccessfulUse = () => {
    // 如果已登入，不需要記錄免費試用
    if (isLoggedIn()) {
      return
    }

    const newCount = incrementFreeTrialCount()
    setUsedCount(newCount)

    // 追蹤免費試用使用事件
    trackEvent('free_trial_used', {
      count: newCount
    })

    // 如果是第 3 次，追蹤試用用完事件
    if (newCount >= 3) {
      trackEvent('free_trial_exhausted', {
        source: 'successful_use'
      })
    }
  }

  /**
   * 關閉試用用完提示
   */
  const dismissPrompt = () => {
    setShowExhaustedPrompt(false)
  }

  const canProceed = isLoggedIn() || hasFreeTrialRemaining()

  return {
    canProceed,
    showExhaustedPrompt,
    usedCount,
    remainingCount,
    checkBeforeApiCall,
    recordSuccessfulUse,
    dismissPrompt,
  }
}

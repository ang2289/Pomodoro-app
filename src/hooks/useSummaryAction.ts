import { useState } from 'react'

export function useSummaryAction() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runSummary = async (inputText: string) => {
    console.log('[SUMMARY] click')

    // 登入判斷：檢查是否有使用者 ID
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId')
    if (!userId) {
      const errorMsg = '請先登入'
      console.error('[SUMMARY]', errorMsg)
      setError(errorMsg)
      return null
    }

    if (!inputText || inputText.trim().length === 0) {
      console.warn('[SUMMARY] empty input')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      console.log('[SUMMARY] request start')

      const payload = {
        userId: userId,
        text: inputText,
      }
      console.log('[SUMMARY] payload', payload)

      const res = await fetch('/api/summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      console.log('[SUMMARY] response status', res.status)

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`API error ${res.status}: ${text}`)
      }

      const data = await res.json()
      console.log('[SUMMARY] response data', data)

      return data
    } catch (error: any) {
      console.error('[SUMMARY] error', error)
      setError(error.message || 'Unknown error')
      return null
    } finally {
      setLoading(false)
      console.log('[SUMMARY] finished')
    }
  }

  return {
    runSummary,
    loading,
    error,
  }
}

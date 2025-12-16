// 認證後自動初始化點數的 Hook
// 在使用者登入後，自動檢查並初始化免費試用點數

import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabaseClient'
import { ensureUserCreditsInitialized, getRemainingCredits } from '../lib/creditService'

interface UseAuthCreditsResult {
  remainingChars: number | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * 監聽使用者認證狀態，並自動初始化點數
 * 
 * 使用方式：
 * ```tsx
 * const { remainingChars, loading } = useAuthCredits()
 * ```
 */
export function useAuthCredits(): UseAuthCreditsResult {
  const [remainingChars, setRemainingChars] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = async () => {
    try {
      setLoading(true)
      setError(null)

      // 檢查是否已登入
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // 未登入，設為 null
        setRemainingChars(null)
        setLoading(false)
        return
      }

      // 確保點數已初始化（如果不存在則建立）
      const credits = await ensureUserCreditsInitialized()
      setRemainingChars(credits)
    } catch (err: any) {
      console.error('❌ 初始化點數失敗：', err)
      setError(err.message || '初始化點數失敗')
      setRemainingChars(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // 初始載入
    refresh()

    // 監聽認證狀態變更（登入/登出）
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 認證狀態變更：', event, session?.user?.id)

      if (event === 'SIGNED_IN' && session?.user) {
        // 使用者登入，初始化點數
        console.log('✅ 使用者登入，初始化點數...')
        await refresh()
      } else if (event === 'SIGNED_OUT') {
        // 使用者登出，清除點數
        setRemainingChars(null)
        setLoading(false)
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Token 刷新，檢查點數
        await refresh()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    remainingChars,
    loading,
    error,
    refresh,
  }
}


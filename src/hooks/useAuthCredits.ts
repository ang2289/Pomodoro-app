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
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      // 🔍 DEBUG: 檢查使用者狀態
      console.log('🔍 [useAuthCredits] refresh() 檢查使用者:', {
        hasUser: !!user,
        userId: user?.id,
        userEmail: user?.email,
        error: userError,
      })

      if (!user) {
        // 未登入，設為 null
        console.log('🔍 [useAuthCredits] 未登入，點數設為 null')
        setRemainingChars(null)
        setLoading(false)
        return
      }

      // 確保點數已初始化（如果不存在則建立）
      const credits = await ensureUserCreditsInitialized()
      console.log('🔍 [useAuthCredits] 點數初始化完成:', { credits, userId: user.id })
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
      console.log('🔐 [useAuthCredits] 認證狀態變更：', {
        event,
        hasSession: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        provider: session?.user?.app_metadata?.provider,
      })

      if (event === 'SIGNED_IN' && session?.user) {
        // 使用者登入，初始化點數
        console.log('✅ [useAuthCredits] SIGNED_IN 事件觸發，開始初始化點數...', {
          userId: session.user.id,
          email: session.user.email,
        })
        await refresh()
      } else if (event === 'SIGNED_OUT') {
        // 使用者登出，清除點數
        console.log('🔍 [useAuthCredits] SIGNED_OUT 事件觸發，清除點數')
        setRemainingChars(null)
        setLoading(false)
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Token 刷新，檢查點數
        console.log('🔍 [useAuthCredits] TOKEN_REFRESHED 事件觸發，重新檢查點數')
        await refresh()
      } else {
        console.log('🔍 [useAuthCredits] 其他認證事件:', event)
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


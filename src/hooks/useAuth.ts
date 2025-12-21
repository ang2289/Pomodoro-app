import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import type { Session, User } from '@supabase/supabase-js'

interface UseAuthResult {
  session: Session | null
  user: User | null
  loading: boolean
}

/**
 * 最小登入狀態 Hook
 * 僅用於檢查使用者是否已登入，不處理扣點或點數相關邏輯
 * 
 * 使用方式：
 * ```tsx
 * const { session, user, loading } = useAuth()
 * 
 * if (loading) {
 *   return <div>載入中...</div>
 * }
 * 
 * if (!user) {
 *   return <div>請先登入</div>
 * }
 * 
 * return <div>歡迎，{user.email}</div>
 * ```
 */
export function useAuth(): UseAuthResult {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 初始載入：取得當前 session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('取得 session 失敗：', error)
        setSession(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // 監聽認證狀態變更（登入/登出/Token 刷新）
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    session,
    user,
    loading,
  }
}





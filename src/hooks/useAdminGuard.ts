import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const ADMIN_EMAILS = new Set(['ang2289@gmail.com', 'ang2289@yahoo.com.tw'])

interface UseAdminGuardResult {
  user: any | null
  isAdmin: boolean
  loading: boolean
  isAuthenticated: boolean
}

/**
 * Admin Guard Hook
 * 檢查使用者是否為指定的管理員 email
 */
export function useAdminGuard(): UseAdminGuardResult {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser(session.user)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('檢查登入狀態失敗:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // 監聽認證狀態變化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const isAuthenticated = user !== null
  const isAdmin = ADMIN_EMAILS.has(String(user?.email || '').trim().toLowerCase())

  return {
    user,
    isAdmin,
    loading,
    isAuthenticated,
  }
}

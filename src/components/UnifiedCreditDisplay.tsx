/**
 * 統一點數顯示組件
 * 用於作業和摘要頁面，統一顯示邏輯
 */

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/utils/supabaseClient'
import { getGuestCreditsInfo } from '@/utils/guestCredits'

interface UnifiedCreditDisplayProps {
  lang?: 'zh-tw' | 'en'
}

export default function UnifiedCreditDisplay({ lang = 'zh-tw' }: UnifiedCreditDisplayProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [creditData, setCreditData] = useState<{
    total: number
    used: number
    remaining: number
    isGuest: boolean
    daysRemaining?: number | null
  } | null>(null)

  useEffect(() => {
    const fetchCreditData = async () => {
      setLoading(true)
      try {
        if (!user) {
          // 未登入：使用訪客點數
          const guestInfo = getGuestCreditsInfo()
          setCreditData({
            total: guestInfo.total,
            used: guestInfo.used,
            remaining: guestInfo.remaining,
            isGuest: true,
            daysRemaining: guestInfo.daysRemaining,
          })
        } else {
          // 已登入：查詢資料庫
          const { data, error } = await supabase
            .from('user_credits')
            .select('total_credits, used_credits, remaining_chars')
            .eq('user_id', user.id)
            .single()

          if (error) {
            console.error('❌ 查詢點數失敗：', error)
            // 如果記錄不存在，視為尚未購買點數
            setCreditData({
              total: 0,
              used: 0,
              remaining: 0,
              isGuest: false,
            })
          } else {
            setCreditData({
              total: data.total_credits || 0,
              used: data.used_credits || 0,
              remaining: data.remaining_chars || 0,
              isGuest: false,
            })
          }
        }
      } catch (err) {
        console.error('❌ 取得點數資訊失敗：', err)
        setCreditData({
          total: 0,
          used: 0,
          remaining: 0,
          isGuest: false,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCreditData()

    // 監聽 localStorage 變化（訪客模式）
    const handleStorageUpdate = () => {
      if (!user) {
        const guestInfo = getGuestCreditsInfo()
        setCreditData({
          total: guestInfo.total,
          used: guestInfo.used,
          remaining: guestInfo.remaining,
          isGuest: true,
          daysRemaining: guestInfo.daysRemaining,
        })
      }
    }

    window.addEventListener('localStorageUpdate', handleStorageUpdate)
    return () => {
      window.removeEventListener('localStorageUpdate', handleStorageUpdate)
    }
  }, [user])

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-xl p-4 mb-5">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!creditData) {
    return null
  }

  // 1. 未登入：顯示訪客試用
  if (creditData.isGuest) {
    return (
      <div className="bg-gray-50 rounded-xl p-4 mb-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">👤</span>
            <span className="text-sm text-gray-700">
              {lang === 'zh-tw' 
                ? `訪客試用：剩餘 ${creditData.remaining.toLocaleString()} / ${creditData.total.toLocaleString()}`
                : `Guest Trial: ${creditData.remaining.toLocaleString()} / ${creditData.total.toLocaleString()} remaining`}
              {creditData.daysRemaining !== null && (
                <span className="text-xs text-gray-500 ml-1">
                  {lang === 'zh-tw' 
                    ? `（${creditData.daysRemaining} 天內有效）`
                    : `（Valid for ${creditData.daysRemaining} days）`}
                </span>
              )}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // 2. 已登入但 total_credits = 0：顯示尚未購買點數
  if (creditData.total === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-4 mb-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">💳</span>
            <span className="text-sm text-gray-700">
              {lang === 'zh-tw' ? '尚未購買點數' : 'No credits purchased'}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // 3. 已登入且有點數：顯示總點數、已使用、剩餘可用
  return (
    <div className="bg-gray-50 rounded-xl p-4 mb-5">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <span className="text-sm text-gray-700">
            {lang === 'zh-tw' 
              ? <>總點數：<span className="font-medium">{creditData.total.toLocaleString()} 字</span></>
              : <>Total Credits: <span className="font-medium">{creditData.total.toLocaleString()}</span></>}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-lg">📝</span>
          <span className="text-sm text-gray-700">
            {lang === 'zh-tw' 
              ? <>已使用：<span className="font-medium">{creditData.used.toLocaleString()} 字</span></>
              : <>Used: <span className="font-medium">{creditData.used.toLocaleString()}</span></>}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-lg">💎</span>
          <span className="text-sm text-gray-700">
            {lang === 'zh-tw' 
              ? <>剩餘可用：<span className={`font-medium ${creditData.remaining > 0 ? 'text-green-600' : 'text-red-600'}`}>{creditData.remaining.toLocaleString()} 字</span></>
              : <>Remaining: <span className={`font-medium ${creditData.remaining > 0 ? 'text-green-600' : 'text-red-600'}`}>{creditData.remaining.toLocaleString()}</span></>}
          </span>
        </div>
      </div>
    </div>
  )
}


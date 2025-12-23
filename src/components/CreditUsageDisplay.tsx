// 點數使用紀錄顯示組件
// 顯示目前剩餘點數和最近使用紀錄

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthCredits } from '../hooks/useAuthCredits'
import { supabase } from '../utils/supabaseClient'

interface UsageLog {
  id: string
  feature: 'summary' | 'homework'
  total_chars: number
  input_chars: number
  output_chars: number
  before_remaining: number
  after_remaining: number
  created_at: string
}

interface CreditUsageDisplayProps {
  lang?: 'zh-tw' | 'en'
}

export default function CreditUsageDisplay({ lang = 'zh-tw' }: CreditUsageDisplayProps) {
  const navigate = useNavigate()
  const { remainingChars, loading: creditsLoading, refresh: refreshCredits } = useAuthCredits()
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>([])
  const [loading, setLoading] = useState(true)

  // 載入使用紀錄
  useEffect(() => {
    const loadUsageLogs = async () => {
      try {
        setLoading(true)

        // 檢查是否已登入
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          // 未登入，不顯示使用紀錄
          setUsageLogs([])
          setLoading(false)
          return
        }

        // 查詢最近 10 筆使用紀錄
        const { data, error } = await supabase
          .from('usage_logs')
          .select('id, feature, total_chars, input_chars, output_chars, before_remaining, after_remaining, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)

        if (error) {
          console.error('❌ 載入使用紀錄失敗：', error)
          setUsageLogs([])
        } else {
          setUsageLogs(data || [])
        }
      } catch (error) {
        console.error('❌ 載入使用紀錄失敗：', error)
        setUsageLogs([])
      } finally {
        setLoading(false)
      }
    }

    loadUsageLogs()
  }, [])

  // 格式化功能名稱
  const getFeatureLabel = (feature: string) => {
    if (lang === 'zh-tw') {
      return feature === 'summary' ? '摘要' : '作業解題'
    }
    return feature === 'summary' ? 'Summary' : 'Homework'
  }

  // 格式化時間
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    if (lang === 'zh-tw') {
      return date.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    }
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // 如果未登入，不顯示
  if (creditsLoading || loading) {
    return (
      <div className="card" style={{ backgroundColor: '#ffffff', color: '#213547' }}>
        <h2 className="text-lg sm:text-xl font-medium text-gray-700 mb-4 sm:mb-6">
          💳 {lang === 'zh-tw' ? '使用額度狀況' : 'Usage Quota Status'}
        </h2>
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">
            {lang === 'zh-tw' ? '載入中…' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card" style={{ backgroundColor: '#ffffff', color: '#213547' }}>
      <h2 className="text-lg sm:text-xl font-medium text-gray-700 mb-4 sm:mb-6">
        💳 {lang === 'zh-tw' ? '使用額度狀況' : 'Usage Quota Status'}
      </h2>

      {/* 目前剩餘點數 */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">
              {lang === 'zh-tw' ? '目前剩餘可用字數' : 'Remaining Available Characters'}
            </p>
            <p className="text-2xl font-bold text-blue-700">
              {remainingChars !== null ? remainingChars.toLocaleString() : '0'} 
              <span className="text-base font-normal ml-1">
                {lang === 'zh-tw' ? '字' : 'chars'}
              </span>
            </p>
            <p className="text-[10px] text-gray-400 mt-1">
              {lang === 'zh-tw' 
                ? '※ 實際扣除字數以系統計算為準'
                : '※ Actual deduction is based on system calculation'}
            </p>
          </div>
          <button
            onClick={() => navigate('/pricing')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {lang === 'zh-tw' ? '購買使用方案' : 'Purchase Usage Plan'}
          </button>
        </div>
      </div>

      {/* 最近使用紀錄 */}
      <div>
        <h3 className="text-base font-semibold text-gray-700 mb-3">
          {lang === 'zh-tw' ? '最近使用紀錄' : 'Recent Usage History'}
        </h3>

        {usageLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">
              {lang === 'zh-tw' 
                ? '尚無使用紀錄' 
                : 'No usage history yet'}
            </p>
            <p className="text-xs mt-2 text-gray-400">
              {lang === 'zh-tw'
                ? '開始使用 AI 功能後，使用紀錄會顯示在這裡'
                : 'Usage history will appear here after using AI features'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {usageLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {getFeatureLabel(log.feature)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTime(log.created_at)}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600">
                      {lang === 'zh-tw' ? '使用字數：' : 'Used: '}
                    </span>
                    <span className="font-semibold text-gray-800">
                      {log.total_chars.toLocaleString()} 
                      {lang === 'zh-tw' ? ' 字' : ' chars'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">
                      {lang === 'zh-tw' ? '剩餘：' : 'Remaining: '}
                    </span>
                    <span className="font-semibold text-gray-800">
                      {log.after_remaining.toLocaleString()} 
                      {lang === 'zh-tw' ? ' 字' : ' chars'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


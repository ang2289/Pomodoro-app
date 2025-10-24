import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'
import ChantSummaryItem from '../components/ChantSummaryItem'

interface ChantLog {
  id: string
  wish_id: string
  user_name: string
  chanted_count: number
  created_at: string
}

interface ChantWish {
  id: string
  title: string
}

export default function ChantStatsPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<ChantLog[]>([])
  const [wishes, setWishes] = useState<ChantWish[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)

        // 獲取唸經記錄
        const { data: chantLogs, error: logsError } = await supabase
          .from('chant_logs')
          .select('*')
          .order('created_at', { ascending: false })

        if (logsError) {
          console.error('讀取統計失敗:', logsError)
          setError('讀取統計失敗：' + logsError.message)
          return
        }

        // 獲取所有 wishes 資料
        const { data: wishesData, error: wishesError } = await supabase
          .from('wishes')
          .select('id, title')

        if (wishesError) {
          console.error('讀取願望資料失敗:', wishesError)
          // 即使 wishes 讀取失敗，仍然顯示 chant logs
        }

        setStats(chantLogs || [])
        setWishes(wishesData || [])
      } catch (err) {
        console.error('讀取統計失敗:', err)
        setError('讀取統計失敗，請重試')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTotalChanted = () => {
    return stats.reduce((total, stat) => total + stat.chanted_count, 0)
  }

  const getUniqueUsers = () => {
    const uniqueUsers = new Set(stats.map(stat => stat.user_name))
    return uniqueUsers.size
  }

  const getWishTitle = (wishId: string) => {
    const wish = wishes.find(w => w.id === wishId)
    return wish?.title
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="responsive-container">
          <div className="card" style={{ backgroundColor: '#ffffff', color: '#213547' }}>
            <div className="flex items-center justify-center">
              <svg className="animate-spin h-8 w-8 text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="ml-3 text-base sm:text-lg text-gray-600">載入統計資料中...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="responsive-container">
          <div className="card" style={{ backgroundColor: '#ffffff', color: '#213547' }}>
            <div className="text-center">
              <div className="text-red-500 text-lg sm:text-xl mb-2">❌</div>
              <p className="text-red-600 mb-4 text-sm sm:text-base">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg transition-colors text-sm sm:text-base"
              >
                重新載入
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="responsive-container">
      {/* 返回按鈕 */}
      <div className="mb-4 sm:mb-6">
        <button
          onClick={() => navigate('/chant')}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors text-base sm:text-lg"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回唸經頁
        </button>
      </div>

      {/* 頁面標題 */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">📊 唸經統計報表</h1>
        <p className="text-sm sm:text-base text-gray-600">查看大家的集氣助念記錄</p>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="card text-center" style={{ backgroundColor: '#ffffff', color: '#213547' }}>
          <div className="text-2xl sm:text-3xl font-bold text-pink-600 mb-2">{getTotalChanted()}</div>
          <div className="text-sm sm:text-base text-gray-600">總念誦次數</div>
        </div>
        <div className="card text-center" style={{ backgroundColor: '#ffffff', color: '#213547' }}>
          <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">{stats.length}</div>
          <div className="text-sm sm:text-base text-gray-600">記錄筆數</div>
        </div>
        <div className="card text-center" style={{ backgroundColor: '#ffffff', color: '#213547' }}>
          <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">{getUniqueUsers()}</div>
          <div className="text-sm sm:text-base text-gray-600">參與人數</div>
        </div>
      </div>

      {/* 詳細記錄 */}
      <div className="card mb-6" style={{ backgroundColor: '#ffffff', color: '#213547' }}>
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">📋 詳細記錄</h2>
        
        {stats.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <div className="text-3xl sm:text-4xl mb-4">📊</div>
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2">還沒有統計資料</h3>
            <p className="text-sm sm:text-base text-gray-600">開始念誦後，統計資料會顯示在這裡</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {stats.map((stat) => (
              <ChantSummaryItem
                key={stat.id}
                log={stat}
                wishTitle={getWishTitle(stat.wish_id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 說明區塊 */}
      <div className="card" style={{ backgroundColor: '#ffffff', color: '#213547' }}>
        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">ℹ️ 說明</h3>
        <div className="text-sm sm:text-base text-gray-600 space-y-2">
          <p>• 此頁面顯示所有用戶的念誦記錄</p>
          <p>• 每次念誦完成後會自動記錄到統計中</p>
          <p>• 可以查看總念誦次數、參與人數等統計資訊</p>
          <p>• 記錄按時間降序排列，最新的記錄在最上方</p>
        </div>
      </div>
      </div>
    </div>
  )
}
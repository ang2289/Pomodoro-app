import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import i18n from '../i18n'
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
  const { t } = useTranslation()
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
          setError(t('failed_to_load_stats') + ': ' + logsError.message)
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
        setError(t('failed_to_load_stats_retry'))
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const formatDate = (dateString: string) => {
    const locale = i18n.language === 'zh_TW' ? 'zh-TW' : 'en-US'
    return new Date(dateString).toLocaleDateString(locale, {
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
              <span className="ml-3 text-base sm:text-lg text-gray-600">{t('loading_stats_data')}</span>
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
                {t('reload')}
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
          {t('back_to_chant_page')}
        </button>
      </div>

      {/* 頁面標題 */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">📊 {t('chant_stats_report')}</h1>
        <p className="text-sm sm:text-base text-gray-600">{t('chant_stats_subtitle')}</p>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="card text-center" style={{ backgroundColor: '#ffffff', color: '#213547' }}>
          <div className="text-2xl sm:text-3xl font-bold text-pink-600 mb-2">{getTotalChanted()}</div>
          <div className="text-sm sm:text-base text-gray-600">{t('total_chant_count')}</div>
        </div>
        <div className="card text-center" style={{ backgroundColor: '#ffffff', color: '#213547' }}>
          <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">{stats.length}</div>
          <div className="text-sm sm:text-base text-gray-600">{t('number_of_records')}</div>
        </div>
        <div className="card text-center" style={{ backgroundColor: '#ffffff', color: '#213547' }}>
          <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">{getUniqueUsers()}</div>
          <div className="text-sm sm:text-base text-gray-600">{t('number_of_participants')}</div>
        </div>
      </div>

      {/* 詳細記錄 */}
      <div className="card mb-6" style={{ backgroundColor: '#ffffff', color: '#213547' }}>
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">📋 {t('detailed_records')}</h2>
        
        {stats.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <div className="text-3xl sm:text-4xl mb-4">📊</div>
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2">{t('no_stats_data')}</h3>
            <p className="text-sm sm:text-base text-gray-600">{t('stats_will_appear_after_chanting')}</p>
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
        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">ℹ️ {t('instructions')}</h3>
        <div className="text-sm sm:text-base text-gray-600 space-y-2">
          <p>• {t('stats_instruction_1')}</p>
          <p>• {t('stats_instruction_2')}</p>
          <p>• {t('stats_instruction_3')}</p>
          <p>• {t('stats_instruction_4')}</p>
        </div>
      </div>
      </div>
    </div>
  )
}
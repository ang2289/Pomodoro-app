import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../utils/supabaseClient'

export default function SupportRankingPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [rankings, setRankings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserSupportRanking = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 從 chant_wish_supports 表取得所有支持記錄
      const { data, error } = await supabase
        .from('chant_wish_supports')
        .select('*')
      
      if (error) {
        console.error('讀取支持記錄失敗:', error)
        setError(t('support_ranking_fetch_error', { error: error.message }))
        return
      }
      
      // 按 user_id 分組統計支持次數
      const userSupportCounts = new Map()
      data?.forEach((record: any, index: number) => {
        // 暫時使用索引作為使用者識別（等 anon_id 欄位建立後再改回）
        const userId = `user_${index}`
        const userName = t('anonymous_user')
        
        if (userSupportCounts.has(userId)) {
          userSupportCounts.get(userId).count += 1
        } else {
          userSupportCounts.set(userId, { user_name: userName, count: 1 })
        }
      })
      
      // 轉換為陣列並排序
      const rankingList = Array.from(userSupportCounts.entries())
        .map(([user_id, data]: [string, any]) => ({
          user_id,
          user_name: data.user_name,
          support_count: data.count
        }))
        .sort((a, b) => b.support_count - a.support_count)
        .slice(0, 100) // 取前100名
      
      setRankings(rankingList)
    } catch (err) {
      console.error('讀取支持排行榜失敗:', err)
      setError(t('support_ranking_load_error'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserSupportRanking()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <main className="flex-1 p-4 max-w-4xl mx-auto w-full">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center">
              <svg className="animate-spin h-8 w-8 text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="ml-3 text-gray-600">{t('loading_support_ranking')}</span>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <main className="flex-1 p-4 max-w-4xl mx-auto w-full">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="text-red-500 text-lg mb-2">❌</div>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {t('reload')}
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 p-4 max-w-4xl mx-auto w-full">
        {/* 返回按鈕 */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/chant')}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('back_to_chant_page')}
          </button>
        </div>

        {/* 標題 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">💖 {t('support_ranking_title')}</h1>
          <p className="text-gray-600">{t('support_ranking_sort_by')}</p>
        </div>

        {/* 篩選條件 */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-2">📅 {t('filter_conditions')}</h3>
          <p className="text-gray-500 text-sm">{t('date_filter_coming_soon')}</p>
        </div>

        {/* 排行榜 */}
        {rankings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center py-8">
              <div className="text-4xl mb-4">💖</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{t('no_support_records')}</h3>
              <p className="text-gray-600">{t('support_ranking_empty_message')}</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">🏆 {t('support_ranking_top_100')}</h2>
              <div className="space-y-3">
                {rankings.map((user: any, index: number) => (
                  <div
                    key={user.user_id}
                    className={`flex justify-between items-center px-4 py-3 rounded-lg border-l-4 ${
                      index % 2 === 0
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-white border-blue-100'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">
                        {medals[index] || '🏅'}
                      </span>
                      <div>
                        <span className="font-bold text-gray-800">
                          {t('ranking_position_template', { position: index + 1 })}
                        </span>
                        <div className="text-sm text-gray-600">
                          {user.user_name || t('anonymous_user')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-pink-600">
                        ❤️ {user.support_count} {t('times')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}


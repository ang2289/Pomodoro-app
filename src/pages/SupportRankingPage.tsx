import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'

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
      
      // 獲取所有集氣願望（chant_wishes）
      const { data: wishes, error: wishesError } = await supabase
        .from('chant_wishes')
        .select('id, title, wish_no')
        .order('created_at', { ascending: false })
      
      if (wishesError) {
        console.error('讀取願望失敗:', wishesError)
        setError(t('support_ranking_fetch_error', { error: wishesError.message }))
        return
      }
      
      if (!wishes || wishes.length === 0) {
        setRankings([])
        return
      }
      
      // 為每個願望統計愛心支持數量（與集氣詳情頁的計算方式一致）
      const wishesWithSupportCount = await Promise.all(
        wishes.map(async (wish) => {
          // 使用與集氣詳情頁相同的查詢方式
          const { count, error: countError } = await supabase
            .from('chant_wish_supports')
            .select('*', { count: 'exact', head: true })
            .eq('chant_wish_id', wish.id)
          
          if (countError) {
            console.error(`查詢願望 ${wish.id} 支持數量失敗:`, countError)
            // 如果 count 查詢失敗，嘗試直接查詢資料（與集氣詳情頁的容錯機制一致）
            const { data: supportData, error: supportDataError } = await supabase
              .from('chant_wish_supports')
              .select('*')
              .eq('chant_wish_id', wish.id)
            
            const manualCount = supportData?.length || 0
            return {
              wish_id: wish.id,
              wish_title: wish.title,
              wish_no: wish.wish_no,
              support_count: manualCount
            }
          }
          
          return {
            wish_id: wish.id,
            wish_title: wish.title,
            wish_no: wish.wish_no,
            support_count: count || 0
          }
        })
      )
      
      // 按支持數量排序，只顯示有支持的願望
      const sortedRanking = wishesWithSupportCount
        .filter(wish => wish.support_count > 0) // 只顯示有支持的願望
        .sort((a, b) => b.support_count - a.support_count)
        .slice(0, 100) // 取前100名
      
      setRankings(sortedRanking)
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
                {rankings.map((wish: any, index: number) => (
                  <div
                    key={wish.wish_id}
                    className={`bg-white rounded-lg shadow-lg p-6 border-l-4 ${
                      index % 2 === 0
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-white border-blue-100'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start flex-1 min-w-0">
                        <span className="text-3xl mr-3 flex-shrink-0">
                          {medals[index] || '🏅'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-xl font-bold text-gray-800 mb-1">
                            {t('ranking_position_template', { position: index + 1 })}: {wish.wish_title || '未命名願望'}
                          </h2>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-4 text-right">
                        <div className="text-2xl font-bold text-pink-600 whitespace-nowrap">
                          ❤️ {wish.support_count} {t('times')}
                        </div>
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


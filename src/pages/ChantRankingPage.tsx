import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import i18n from '../i18n'
import { supabase } from '../lib/supabase'

interface ChantWish {
  id: string
  wish_no: number
  title: string
  chant_text: string
  chant_target_count: number
  chant_unit: string
  for_person_name?: string
  start_date: string
  end_date: string
  description?: string
  created_by: string
  created_at: string
}

interface WishWithStats extends ChantWish {
  totalChants: number
  participants: number
}

// TODO: 為了上線摘要與作業功能，暫時隱藏 chant 模組
// 日後可透過環境變數 VITE_ENABLE_CHANT=true 或 NEXT_PUBLIC_ENABLE_CHANT=true 再次開啟
export default function ChantRankingPage() {
  if (import.meta.env.VITE_ENABLE_CHANT !== 'true' && import.meta.env.NEXT_PUBLIC_ENABLE_CHANT !== 'true') {
    return null;
  }

  const { t } = useTranslation()
  const navigate = useNavigate()
  const [ranking, setRanking] = useState<WishWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        setLoading(true)
        setError(null)

        // 獲取所有集氣活動
        const { data: wishes, error: wishesError } = await supabase
          .from('chant_wishes')
          .select('*')
          .order('created_at', { ascending: false })

        if (wishesError) {
          console.error('讀取活動失敗:', wishesError)
          setError(t('failed_to_load_activities') + ': ' + wishesError.message)
          return
        }

        if (!wishes || wishes.length === 0) {
          setRanking([])
          return
        }

        // 為每個活動獲取統計數據
        const wishesWithStats = await Promise.all(
          wishes.map(async (wish) => {
            const { data: logs, error: logsError } = await supabase
              .from('chant_logs')
              .select('user_name, chanted_count')
              .eq('wish_id', wish.id)

            if (logsError) {
              console.error(`讀取活動 ${wish.id} 統計失敗:`, logsError)
              return {
                ...wish,
                totalChants: 0,
                participants: 0
              }
            }

            const participants = new Set(logs?.map(log => log.user_name) || []).size
            const totalChants = logs?.reduce((sum, log) => sum + (log.chanted_count || 0), 0) || 0

            return {
              ...wish,
              totalChants,
              participants
            }
          })
        )

        // 按總念誦次數排序
        const sortedRanking = wishesWithStats
          .sort((a, b) => b.totalChants - a.totalChants)
          .slice(0, 10) // 只顯示前10名
        setRanking(sortedRanking)
      } catch (err) {
        console.error('讀取排行榜失敗:', err)
        setError(t('failed_to_load_ranking_retry'))
      } finally {
        setLoading(false)
      }
    }

    fetchRanking()
  }, [])

  const formatDate = (dateString: string) => {
    const locale = i18n.language === 'zh_TW' ? 'zh-TW' : 'en-US'
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const medals = ['🥇', '🥈', '🥉']

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="responsive-container">
          <main className="flex-1 w-full">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-8 w-8 text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="ml-3 text-gray-600">{t('loading_ranking')}</span>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="responsive-container">
          <main className="flex-1 w-full">
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
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="responsive-container">
        <main className="flex-1 w-full">
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

        {/* 頁面標題 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">📊 {t('chant_ranking')}</h1>
          <p className="text-gray-600">{t('chant_ranking_subtitle')}</p>
        </div>

        {/* 排行榜 */}
        {ranking.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{t('no_ranking_data')}</h3>
              <p className="text-gray-600 mb-4">{t('ranking_will_appear_after_activities')}</p>
              <Link
                to="/chant-wish-wall"
                className="inline-block bg-blue-600 text-white hover:bg-blue-700 font-bold py-3 px-6 rounded-lg transition transform hover:scale-105 shadow-lg"
                style={{ color: '#ffffff' }}
              >
                🙏 {t('create_chant_activity')}
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {ranking.map((wish, index) => (
              <div
                key={wish.id}
                className={`bg-white rounded-lg shadow-lg p-6 border-l-4 ${
                  index === 0 
                    ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50' 
                    : index === 1 
                    ? 'border-gray-400 bg-gradient-to-r from-gray-50 to-slate-50'
                    : index === 2
                    ? 'border-orange-400 bg-gradient-to-r from-orange-50 to-amber-50'
                    : 'border-pink-200'
                }`}
              >
                {/* 排名和標題 */}
                <div className="mb-4">
                  <div className="flex items-start">
                    <span className="text-3xl mr-3">
                      {medals[index] || `🏆`}
                    </span>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">
                        {t('ranking_position_template', { position: index + 1 })}: {wish.title}
                      </h2>
                      <p className="text-sm text-gray-500 mb-1">
                        {t('created')}: {formatDate(wish.created_at)}
                      </p>
                      <div className="text-2xl font-bold text-pink-600">
                        {wish.totalChants}
                      </div>
                      <div className="text-sm text-gray-600">{t('total_chant_count')}</div>
                    </div>
                  </div>
                </div>

                {/* 活動詳情 */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-700">
                    <span className="mr-2">📿</span>
                    <span className="font-medium">{t('chant')}:</span>
                    <span className="ml-1 text-pink-600 font-bold">
                      {wish.chant_text} {wish.chant_target_count}{wish.chant_unit}
                    </span>
                  </div>

                  {wish.for_person_name && (
                    <div className="flex items-center text-gray-700">
                      <span className="mr-2">🎯</span>
                      <span className="font-medium">{t('dedication_recipient')}:</span>
                      <span className="ml-1 text-blue-600 font-bold">{wish.for_person_name}</span>
                    </div>
                  )}

                  <div className="flex items-center text-gray-700">
                    <span className="mr-2">🔥</span>
                    <span className="font-medium">{t('creator_name')}:</span>
                    <span className="ml-1">{wish.created_by}</span>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <span className="mr-2">👥</span>
                    <span className="font-medium">{t('number_of_participants')}:</span>
                    <span className="ml-1 text-green-600 font-bold">{wish.participants} {t('people')}</span>
                  </div>
                </div>

                {/* 描述 */}
                {wish.description && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-gray-700 text-sm leading-relaxed">{wish.description}</p>
                  </div>
                )}

                {/* 活動期間 */}
                <div className="mb-4 text-sm text-gray-500">
                  {t('activity_period')}: {formatDate(wish.start_date)} ~ {formatDate(wish.end_date)}
                </div>
                
                {/* 操作按鈕 */}
                <div className="flex justify-center">
                  <Link
                    to={`/chant-wish-detail/${wish.wish_no}`}
                    className="bg-blue-600 hover:bg-blue-700 !text-white font-bold py-2 px-4 rounded-lg transition transform hover:scale-105 shadow-lg"
                    style={{ color: '#ffffff' }}
                  >
                    🔍 {t('view_details')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 說明區塊 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">ℹ️ {t('ranking_instructions')}</h3>
          <div className="text-gray-600 space-y-2">
            <p>• {t('ranking_instruction_1')}</p>
            <p>• {t('ranking_instruction_2')}</p>
            <p>• {t('ranking_instruction_3')}</p>
            <p>• {t('ranking_instruction_4')}</p>
          </div>
        </div>
        </main>
      </div>
    </div>
  )
}
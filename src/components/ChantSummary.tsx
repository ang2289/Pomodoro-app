import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabaseClient'

interface ChantSummaryProps {
  wishId: string
  refreshKey?: number // 用於觸發重新獲取資料
}

interface RankingItem {
  name: string
  count: number
}

export default function ChantSummary({ wishId, refreshKey }: ChantSummaryProps) {
  const [total, setTotal] = useState(0)
  const [ranking, setRanking] = useState<RankingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true)
        setError(null)

        // 總累計
        const { data: totalData, error: totalError } = await supabase
          .from('chant_logs')
          .select('chanted_count')
          .eq('wish_id', wishId)

        if (totalError) {
          console.error('讀取總計失敗:', totalError)
          setError('讀取統計失敗：' + totalError.message)
          return
        }

        const totalCount = (totalData || []).reduce((sum, item) => sum + item.chanted_count, 0)
        setTotal(totalCount)

        // 排行榜
        const { data: topData, error: rankingError } = await supabase
          .from('chant_logs')
          .select('user_name, chanted_count')
          .eq('wish_id', wishId)

        if (rankingError) {
          console.error('讀取排行榜失敗:', rankingError)
          setError('讀取排行榜失敗：' + rankingError.message)
          return
        }

        const byUser = (topData || []).reduce((acc: Record<string, number>, row) => {
          acc[row.user_name] = (acc[row.user_name] || 0) + row.chanted_count
          return acc
        }, {})

        const sorted = Object.entries(byUser)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)

        setRanking(sorted)
      } catch (err) {
        console.error('讀取統計失敗:', err)
        setError('讀取統計失敗，請重試')
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [wishId, refreshKey]) // 添加 refreshKey 作為依賴

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📈 集氣統計</h3>
        <div className="flex items-center justify-center py-4">
          <svg className="animate-spin h-6 w-6 text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-3 text-gray-600">載入統計中...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📈 集氣統計</h3>
        <div className="text-center py-4">
          <div className="text-red-500 text-lg mb-2">❌</div>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">📈 集氣統計</h3>
      
      {/* 總累計 */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg border border-pink-200">
          <div className="text-center">
            <div className="text-3xl font-bold text-pink-600 mb-2">{total}</div>
            <div className="text-gray-700 font-medium">🙌 累計念誦次數</div>
          </div>
        </div>
      </div>

      {/* 排行榜 */}
      {ranking.length > 0 ? (
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-3">🏆 集氣排行榜</h4>
          <div className="space-y-2">
            {ranking.map((r, idx) => (
              <div
                key={r.name}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  idx === 0 
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' 
                    : idx === 1 
                    ? 'bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200'
                    : idx === 2
                    ? 'bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200'
                    : 'bg-gray-50 border border-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🏅'}
                  </span>
                  <span className="font-semibold text-gray-800">{r.name}</span>
                </div>
                <span className="font-bold text-pink-600">{r.count} 遍</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-gray-500">還沒有念誦記錄</p>
          <p className="text-sm text-gray-400 mt-1">開始念誦後，排行榜會顯示在這裡</p>
        </div>
      )}

      {/* 統計說明 */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600 space-y-1">
          <p>• 排行榜按個人累計念誦次數排序</p>
          <p>• 每次念誦記錄都會自動累加到個人總數</p>
          <p>• 大家一起為願望集氣，讓能量更強大！</p>
        </div>
      </div>
    </div>
  )
}

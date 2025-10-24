import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabaseClient'
import WishLightButton from './WishLightButton'

interface Wish {
  id: string
  user_name: string
  content: string
  created_at: string
  is_public: boolean
}

export default function WishWall() {
  const [wishes, setWishes] = useState<Wish[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWishes = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('wishes')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('讀取願望失敗:', error)
        setError('讀取願望失敗：' + error.message)
        return
      }

      setWishes(data || [])
    } catch (err) {
      console.error('讀取願望失敗:', err)
      setError('讀取願望失敗，請重試')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWishes()
  }, [])

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = date.getHours()
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    
    const period = hours >= 12 ? '下午' : '上午'
    const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours)
    
    return `${year}/${month}/${day} ${period} ${displayHours}:${minutes}:${seconds}`
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center">
          <svg className="animate-spin h-8 w-8 text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-3 text-gray-600">載入願望中...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">❌</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchWishes}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            重新載入
          </button>
        </div>
      </div>
    )
  }

  if (wishes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🌟</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">願望牆</h3>
          <p className="text-gray-600">目前還沒有願望，快來許一個吧！</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🌟 願望牆</h3>
        <p className="text-gray-600 text-sm">共 {wishes.length} 個願望</p>
      </div>

      {wishes.map((wish) => (
        <div key={wish.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-start justify-between mb-3">
            <div className="font-bold text-lg text-gray-800">
              {wish.user_name || '匿名'}
            </div>
            <div className="text-sm text-gray-500">
              {formatDateTime(wish.created_at)}
            </div>
          </div>
          
          <div className="text-gray-700 leading-relaxed">
            {wish.content}
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-2">✨</span>
              <span>願望編號: {wish.id.slice(-8)}</span>
            </div>
          </div>

          {/* 點燈區域 */}
          <div className="mt-6 p-6 bg-gradient-to-br from-pink-50 via-purple-50 to-yellow-50 rounded-xl border border-pink-200">
            <h4 className="text-md font-bold text-center text-gray-800 mb-2">🙏 為此願望點燈祈福</h4>
            <p className="text-xs text-gray-600 text-center mb-3">
              點擊蓮花為此願望點燈祈福
            </p>
            <WishLightButton wishId={wish.id} />
          </div>
        </div>
      ))}
    </div>
  )
}






import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useNavigate, Link } from 'react-router-dom'
import ChantWishCard from '../components/ChantWishCard'
import SearchForm, { SearchFilters } from '../components/SearchForm'
import { loadChantList } from '../utils/chantStorage'

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
  image_url?: string | null
}

function compareBy(sortBy: 'start_desc' | 'start_asc' | 'created_desc' | 'created_asc', a: any, b: any) {
  const getTime = (d: string) => (d ? new Date(d).getTime() : 0)
  switch (sortBy) {
    case 'start_asc':
      return getTime(a.start_date) - getTime(b.start_date)
    case 'created_desc':
      return getTime(b.created_at) - getTime(a.created_at)
    case 'created_asc':
      return getTime(a.created_at) - getTime(b.created_at)
    case 'start_desc':
    default:
      return getTime(b.start_date) - getTime(a.start_date)
  }
}

export default function ChantWishWallPage() {
  const [wishes, setWishes] = useState<ChantWish[]>([])
  const [filtered, setFiltered] = useState<ChantWish[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 10
  const todayStr = new Date().toISOString().split('T')[0]
  const [_keyword, setKeyword] = useState('')
  const [_dateFrom, setDateFrom] = useState(todayStr)
  const [_dateTo, setDateTo] = useState(todayStr)
  const [_scripture, setScripture] = useState('')
  const [_sortBy, setSortBy] = useState<'start_desc' | 'start_asc' | 'created_desc' | 'created_asc'>('start_desc')

  const navigate = useNavigate()

  useEffect(() => {
    const fetchWishes = async () => {
      try {
        setLoading(true)
        setError(null)

        // 載入所有資料，不使用分頁限制
        const { data, error, count } = await supabase
          .from('chant_wishes')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })

        if (error) {
          console.error('讀取失敗:', error)
          setError('讀取集氣活動失敗：' + error.message)
          return
        }

        setWishes(data || [])
        setFiltered(data || [])
        ;(window as any).__chant_wish_total__ = count || 0
      } catch (err) {
        console.error('讀取失敗:', err)
        setError('讀取集氣活動失敗，請重試')
      } finally {
        setLoading(false)
      }
    }

    fetchWishes()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <main className="flex-1 p-4 w-full">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center">
              <svg className="animate-spin h-8 w-8 text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="ml-3 text-gray-600">載入集氣活動中...</span>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <main className="flex-1 p-4 w-full">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="text-red-500 text-lg mb-2">❌</div>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                重新載入
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="responsive-container">
      <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6">集氣活動牆</h1>
      <div className="space-y-4 mb-6">
        <button
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 !text-white font-bold py-3 sm:py-4 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg text-base sm:text-lg"
        >
          前往排行榜
        </button>
        <button
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 !text-white font-bold py-3 sm:py-4 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg text-base sm:text-lg"
        >
          支持排行榜
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
        <div className="flex items-center mb-4">
          <label htmlFor="search-checkbox" className="text-base sm:text-lg font-medium text-gray-700 mr-3">啟用搜尋</label>
          <input id="search-checkbox" type="checkbox" className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" title="啟用搜尋" />
        </div>
        <div className="mb-4">
          <label htmlFor="search-input" className="block text-base sm:text-lg font-medium text-gray-700 mb-2">搜尋標題、對象或發起人</label>
          <input
            id="search-input"
            type="text"
            className="w-full border border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="輸入關鍵字"
            title="搜尋標題、對象或發起人"
          />
        </div>
        <div>
          <label htmlFor="date-range" className="block text-base sm:text-lg font-medium text-gray-700 mb-2">日期範圍</label>
          <div id="date-range" className="flex flex-col sm:flex-row gap-2">
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="開始日期"
            />
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="結束日期"
            />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <SearchForm
          scriptureOptions={(Array.from(new Set((loadChantList() || [])))) as string[]}
          onSearch={(filters: SearchFilters) => {
            setKeyword(filters.keyword || '')
            setDateFrom(filters.dateFrom || '')
            setDateTo(filters.dateTo || '')
            setScripture(filters.scripture || '')
            setSortBy((filters.sortBy as any) || 'start_desc')
            setPage(1) // 搜尋時重置到第1頁
            const kw = (filters.keyword || '').toLowerCase()
            let result = [...wishes]
            if (kw) result = result.filter((w: any) => [w.title, w.for_person_name, w.created_by].some((f: string) => f?.toLowerCase().includes(kw)))
            if (filters.dateFrom) result = result.filter((w: any) => !w.start_date || new Date(w.start_date) >= new Date(filters.dateFrom!))
            if (filters.dateTo) result = result.filter((w: any) => !w.end_date || new Date(w.end_date) <= new Date(filters.dateTo!))
            if (filters.scripture) result = result.filter((w: any) => w.chant_text === filters.scripture)
            result.sort((a, b) => compareBy((filters.sortBy as any) || 'start_desc', a, b))
            setFiltered(result)
          }}
          onReset={() => {
            setKeyword('')
            setDateFrom('')
            setDateTo('')
            setScripture('')
            setSortBy('start_desc')
            setPage(1) // 重置時也重置到第1頁
            setFiltered(wishes)
          }}
        />
      </div>

      {wishes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <div className="text-center">
            <div className="text-6xl mb-4">🙏</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">集氣活動牆</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">目前沒有任何集氣活動，快來發起一個吧！</p>
            <button
              onClick={() => navigate('/chant-wish-create')}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg text-sm sm:text-base"
            >
              🔔 發起集氣活動
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">🌟 集氣活動牆</h3>
            <p className="text-blue-600 text-base sm:text-lg">共 {filtered.length} 筆集氣活動</p>
          </div>

          {filtered
            .slice((page - 1) * pageSize, page * pageSize)
            .map((wish, index) => (
              <div
                key={wish.id}
                className={`rounded-xl shadow-md mb-4 sm:mb-6 border border-gray-200 p-4 sm:p-5 ${index % 2 === 0 ? 'bg-white' : 'bg-orange-50'}`}
              >
                {wish.image_url && (
                  <div className="mb-3 sm:mb-4">
                    <div className="rounded-md border border-gray-200 shadow overflow-hidden">
                      <img src={wish.image_url} alt="活動圖片" className="w-full max-h-48 sm:max-h-56 object-cover bg-white" />
                    </div>
                  </div>
                )}
                <ChantWishCard wish={wish} />
              </div>
            ))}
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 bg-white rounded-lg shadow-lg p-4">
            <button
              className="w-full sm:w-auto px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base sm:text-lg"
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            >
              ⬅ 上一頁
            </button>

            <span className="text-base sm:text-lg font-medium text-gray-700 text-center">
              目前第 {page} 頁，共 {Math.ceil(filtered.length / pageSize)} 頁
            </span>

            <button
              className="w-full sm:w-auto px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base sm:text-lg"
              disabled={(page * pageSize) >= filtered.length}
              onClick={() => setPage((prev) => prev + 1)}
            >
              下一頁 ➡
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
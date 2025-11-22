import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

const popularKeywords = [
  '除濕機',
  '奶粉',
  '尿布',
  '小熊電器',
  '空氣清淨機',
  '行動電源',
  '電風扇',
  '嬰兒濕紙巾',
]

export default function ShoppingSearchPage() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const onSearch = () => {
    if (!query.trim()) return
    navigate(`/shopping/results?q=${encodeURIComponent(query)}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch()
    }
  }

  const handlePopularClick = (keyword: string) => {
    navigate(`/shopping/results?q=${encodeURIComponent(keyword)}`)
  }

  return (
    <>
      <Helmet>
        <title>商品搜尋與比價工具｜AI 工具與生活服務中心</title>
        <meta
          name="description"
          content="輸入商品名稱，即可自動整理蝦皮商品清單、價格、銷量、評價，並提供多種排序方式。"
        />
      </Helmet>

      <div className="max-w-xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6 text-center">
          🛍️ 商品搜尋與比價工具
        </h1>

        <div className="p-6 rounded-xl shadow-md bg-white border">
          <label className="block text-gray-700 mb-2">輸入商品關鍵字：</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="例如：除濕機、尿布、小熊家電…"
            className="w-full border p-3 rounded-md mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          <button
            onClick={onSearch}
            disabled={!query.trim()}
            className={`w-full py-3 rounded-md text-lg transition-colors ${
              !query.trim()
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            搜尋商品
          </button>
        </div>

        {/* 熱門搜尋區塊 */}
        <div className="mt-6">
          <p className="text-gray-700 mb-3 font-medium">🔍 熱門搜尋：</p>
          <div className="flex flex-wrap gap-2">
            {popularKeywords.map((keyword) => (
              <button
                key={keyword}
                onClick={() => handlePopularClick(keyword)}
                className="px-[10px] py-[6px] bg-gray-100 hover:bg-gray-200 rounded text-sm transition-colors"
              >
                {keyword}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}


import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import SEO from '../../components/SEO'
import { featureFlags } from '@/config/featureFlags'

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
  // 🔒 功能開關檢查：防止直接輸入網址進入
  if (!featureFlags.priceCompare) {
    return <Navigate to="/" replace />;
  }
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
      <SEO
        title="AI Price Comparison Tool — Find Best Deals Instantly"
        description="Search and compare product prices instantly. Powered by AI parsing and structured data. Supports Shopee and multi-platform price extraction."
        keywords="price comparison, product search, Shopee tools, best deals, AI shopping assistant"
        url="https://pomodoro-app-eight-rouge.vercel.app/shopping/search"
      />

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


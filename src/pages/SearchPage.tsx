import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { searchShopee } from '../services/shopeeSearch'

interface SearchResult {
  id?: string
  itemid?: string
  name: string
  price: number
  image: string
  url?: string
  link?: string
  rating: number
  sold: number
}

const SearchPage = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)

    try {
      const items = await searchShopee(query)
      setResults(items || [])
    } catch (err) {
      console.error(err)
      setResults([])
    }

    setLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <>
      <Helmet>
        <title>搜尋商品｜AI 工具與生活服務中心</title>
        <meta
          name="description"
          content="搜尋蝦皮商品，快速找到您需要的商品資訊"
        />
      </Helmet>

      <div className="px-4 py-6 max-w-3xl mx-auto">
        <h1 className="text-xl font-bold mb-4">搜尋商品</h1>

        {/* 搜尋欄 */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="輸入商品名稱，例如：除濕機"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            搜尋
          </button>
        </div>

        {/* Loading */}
        {loading && <p className="text-gray-500">搜尋中...</p>}

        {/* 搜尋結果 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {results.map((item, index) => (
            <div
              key={item.id || item.itemid || index}
              className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-48 object-cover rounded mb-3"
              />

              <div className="flex-1">
                <p className="font-medium line-clamp-2 mb-2">{item.name}</p>
                <p className="text-red-600 font-bold text-lg mb-2">
                  NT$ {item.price}
                </p>
                <p className="text-sm text-gray-500 mb-3">
                  ⭐ {item.rating} | 銷量 {item.sold}
                </p>

                <a
                  href={item.url || item.link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full text-center bg-orange-500 text-white px-3 py-2 rounded hover:bg-orange-600 transition-colors"
                >
                  查看蝦皮商品
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* 無結果提示 */}
        {!loading && results.length === 0 && query && (
          <p className="text-center text-gray-500 mt-8">
            找不到相關商品，請嘗試其他關鍵字
          </p>
        )}
      </div>
    </>
  )
}

export default SearchPage





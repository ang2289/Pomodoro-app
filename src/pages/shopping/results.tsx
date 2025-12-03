import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import ProductCard from '../../components/shopping/ProductCard'

const ITEMS_PER_PAGE = 20

const SORT_OPTIONS = [
  { key: 'default', label: '綜合' },
  { key: 'sold', label: '銷量' },
  { key: 'price', label: '價格' },
  { key: 'latest', label: '最新' },
  { key: 'free', label: '免運' },
  { key: 'official', label: '官方店' },
]

const getRelatedKeywords = (q: string) => {
  const base = q.replace(/\s+/g, '')
  return [
    `${base} 推薦`,
    `${base} 比價`,
    `${base} 熱門`,
    `${base} 2025 最推薦`,
    `便宜 ${base}`,
    `${base} 熱銷排行`,
  ]
}

interface ShopeeItem {
  itemid: string
  name: string
  price: number
  rating: number
  sold: number
  image: string
  link: string
  free_shipping?: boolean
  official_store?: boolean
  flagship_store?: boolean
}

export default function ShoppingResultsPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const q = searchParams.get('q') || ''
  const page = Number(searchParams.get('page') || 1)

  const [items, setItems] = useState<ShopeeItem[]>([])
  const [sortBy, setSortBy] = useState('default')
  const [priceOrder, setPriceOrder] = useState<'asc' | 'desc'>('asc')
  const [loading, setLoading] = useState(false)
  const [filterFreeShip, setFilterFreeShip] = useState(false)
  const [filterOfficial, setFilterOfficial] = useState(false)
  const [filterFlagship, setFilterFlagship] = useState(false)

  useEffect(() => {
    if (!q) return

    setLoading(true)

    fetch(`/api/shopee-search?keyword=${encodeURIComponent(q)}`)
      .then((res) => res.json())
      .then((data) => {
        setItems(Array.isArray(data) ? data : data.items || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error('搜尋錯誤:', err)
        setLoading(false)
      })
  }, [q])

  const sortedItems = [...items].sort((a, b) => {
    if (sortBy === 'sold') {
      return b.sold - a.sold // 銷量高→低
    }
    if (sortBy === 'price') {
      return priceOrder === 'asc' ? a.price - b.price : b.price - a.price
    }
    if (sortBy === 'latest') {
      // 使用 itemid 作為時間戳的替代（較大的 itemid 通常較新）
      return Number(b.itemid) - Number(a.itemid) // 新→舊
    }
    if (sortBy === 'free') {
      return (b.free_shipping ? 1 : 0) - (a.free_shipping ? 1 : 0)
    }
    if (sortBy === 'official') {
      return (b.official_store ? 1 : 0) - (a.official_store ? 1 : 0)
    }
    return 0 // 綜合不排序
  })

  const filteredItems = sortedItems.filter((item) => {
    if (filterFreeShip && !item.free_shipping) return false
    if (filterOfficial && !item.official_store) return false
    if (filterFlagship && !item.flagship_store) return false
    return true
  })

  const start = (page - 1) * ITEMS_PER_PAGE
  const end = start + ITEMS_PER_PAGE
  const paginatedItems = filteredItems.slice(start, end)

  return (
    <>
      <Helmet>
        <title>搜尋結果：{q}｜商品搜尋與比價工具</title>
        <meta
          name="description"
          content={`搜尋「${q}」的商品結果，包含價格、銷量、評價等資訊。`}
        />
      </Helmet>

      <div className="search-container">
        {/* 標題 */}
        <div className="search-title">
          <span className="icon">🔍</span>
          搜尋結果：「{q}」
        </div>

        {/* 排序列 */}
        <div className="sort-bar">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              className={`sort-btn ${sortBy === opt.key ? 'active' : ''}`}
              onClick={() => {
                if (opt.key === 'price') {
                  // 價格排序：點一次切換 ↑↓
                  setSortBy('price')
                  setPriceOrder(priceOrder === 'asc' ? 'desc' : 'asc')
                } else {
                  setSortBy(opt.key)
                }
              }}
            >
              {opt.label}
              {opt.key === 'price' && (
                <span className="price-arrow">
                  {priceOrder === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 商品結果 */}
        {loading ? (
          <div className="empty-state">載入中…</div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state">
            找不到相關商品，請嘗試其他關鍵字或調整搜尋條件。
          </div>
        ) : (
          <div className="product-grid">
            {paginatedItems.map((item) => (
              <ProductCard key={item.itemid} item={item} />
            ))}
          </div>
        )}

        {/* 分頁按鈕 */}
        <div className="flex justify-center items-center gap-4 mt-10">
          {page > 1 && (
            <button
              onClick={() =>
                navigate(
                  `/shopping/results?q=${encodeURIComponent(q)}&page=${page - 1}`
                )
              }
              className="px-4 py-2 rounded-md border bg-white hover:bg-gray-100 transition-colors"
            >
              ← 上一頁
            </button>
          )}

          {end < filteredItems.length && (
            <button
              onClick={() =>
                navigate(
                  `/shopping/results?q=${encodeURIComponent(q)}&page=${page + 1}`
                )
              }
              className="px-4 py-2 rounded-md border bg-white hover:bg-gray-100 transition-colors"
            >
              下一頁 →
            </button>
          )}
        </div>

        {/* 相關搜尋 */}
        {q && (
          <div className="related-search">
            <div className="related-title">🔎 相關搜尋</div>
            <div className="chips">
              {getRelatedKeywords(q).map((tag) => (
                <div
                  key={tag}
                  className="chip"
                  onClick={() =>
                    navigate(`/shopping/results?q=${encodeURIComponent(tag)}`)
                  }
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}


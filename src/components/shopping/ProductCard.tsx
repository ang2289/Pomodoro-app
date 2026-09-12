import React from 'react'

interface ProductItem {
  // 新格式
  id?: string
  priceMin?: number
  priceMax?: number
  url?: string
  affiliateUrl?: string
  officialStore?: boolean
  
  // 現有格式（ShopeeItem）
  itemid?: string
  price?: number
  link?: string
  official_store?: boolean
  
  // 共同欄位
  name: string
  image: string
  sold: number
  rating: number
}

export default function ProductCard({ item }: { item: ProductItem }) {
  // 適配資料格式：支援新格式和現有格式
  const id = item.id || item.itemid || ''
  const priceMin = item.priceMin ?? item.price ?? 0
  const priceMax = item.priceMax ?? item.price ?? 0
  const url = item.affiliateUrl || item.url || item.link || '#'
  const officialStore = item.officialStore || item.official_store || false

  return (
    <a
      className="product-card"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {/* 商品圖 */}
      <div className="product-image-box">
        <img src={item.image} alt={item.name} className="product-image" />
      </div>

      {/* 文案區 */}
      <div className="product-info">
        {/* 名稱 */}
        <div className="product-name">{item.name}</div>

        {/* 價格 */}
        <div className="product-price">
          {priceMin === priceMax
            ? `＄${priceMin.toLocaleString()}`
            : `＄${priceMin.toLocaleString()} - ${priceMax.toLocaleString()}`}
        </div>

        {/* 月銷量 + 評價 */}
        <div className="product-sub">
          <span>月銷 {item.sold.toLocaleString()}</span>
          {item.rating > 0 && (
            <span className="product-rating">
              ⭐ {item.rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* 官方店 Tag */}
        {officialStore && (
          <div className="product-tag">官方旗艦店</div>
        )}
      </div>
    </a>
  )
}




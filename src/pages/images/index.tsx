import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { loadPublicImageCatalog, type PublicCatalogImage } from '@/lib/imageCatalog'
import { resolveRxvUrl } from '@/lib/rxvUrl'

// 圖片素材資料型別
interface ImageAsset {
  id: string
  title: string
  previewUrl: string
  accessLevel: 'free' | 'member' | 'all'
  category_id?: string | null
}

// 分類資料型別
interface ImageCategory {
  id: string
  name: string
  slug: string
}

export default function ImagesPage() {
  const [allImages, setAllImages] = useState<ImageAsset[]>([])
  const [images, setImages] = useState<ImageAsset[]>([])
  const [categories, setCategories] = useState<ImageCategory[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null) // null 代表全部
  const [loading, setLoading] = useState(true)
  
  // TODO: 未來從後端或 localStorage 取得使用者方案狀態
  // 目前先手動指定為 "free" 作測試
  // 可改為 "basic" 或 "pro" 來測試不同方案狀態

  // Public R2 catalog is fetched once and all category/search filtering stays local.
  useEffect(() => {
    const loadCatalog = async () => {
      setLoading(true)
      try {
        const catalog = await loadPublicImageCatalog()
        const formatted: ImageAsset[] = catalog.map((img: PublicCatalogImage) => ({
          id: img.id, title: img.title, previewUrl: img.previewUrl,
          accessLevel: 'free',
          category_id: img.categoryId,
        }))
        setAllImages(formatted)
        setImages(formatted)
        setCategories([...new Map(catalog.map((img) => [img.categoryId, { id: img.categoryId, name: img.categoryName, slug: img.categoryId }])).values()])
      } catch (err) {
        console.error('載入 R2 圖片 catalog 時發生錯誤:', err)
        setAllImages([])
        setImages([])
      } finally {
        setLoading(false)
      }
    }
    loadCatalog()
  }, [])

  useEffect(() => {
    setImages(selectedCategoryId ? allImages.filter((image) => image.category_id === selectedCategoryId) : allImages)
  }, [allImages, selectedCategoryId])

  // 判斷圖片是否已解鎖
  const isUnlocked = (_accessLevel: ImageAsset['accessLevel']): boolean => true

  // 根據權限等級和使用者方案取得標籤和按鈕資訊
  const getAccessInfo = (accessLevel: ImageAsset['accessLevel']) => {
    const unlocked = isUnlocked(accessLevel)
    
    switch (accessLevel) {
      case 'free':
        return {
          label: '免費',
          labelColor: 'bg-green-100 text-green-700',
          buttonText: '下載圖片',
          buttonClass: 'bg-green-600 hover:bg-green-700',
          showSubtext: false,
          unlocked: true
        }
      case 'member':
        if (unlocked) {
          // 已解鎖：顯示下載按鈕
          return {
            label: '會員解鎖',
            labelColor: 'bg-blue-100 text-blue-700',
            buttonText: '下載圖片',
            buttonClass: 'bg-green-600 hover:bg-green-700',
            showSubtext: false,
            unlocked: true
          }
        } else {
          // 未解鎖：顯示解鎖按鈕
          return {
            label: '會員解鎖',
            labelColor: 'bg-blue-100 text-blue-700',
            buttonText: '解鎖（NT$99 方案）',
            buttonClass: 'bg-blue-600 hover:bg-blue-700',
            showSubtext: true,
            unlocked: false
          }
        }
      case 'all':
        if (unlocked) {
          // 已解鎖：顯示下載按鈕
          return {
            label: '全站解鎖',
            labelColor: 'bg-purple-100 text-purple-700',
            buttonText: '下載圖片',
            buttonClass: 'bg-green-600 hover:bg-green-700',
            showSubtext: false,
            unlocked: true
          }
        } else {
          // 未解鎖：顯示解鎖按鈕
          return {
            label: '全站解鎖',
            labelColor: 'bg-purple-100 text-purple-700',
            buttonText: '解鎖（NT$199 方案）',
            buttonClass: 'bg-purple-600 hover:bg-purple-700',
            showSubtext: true,
            unlocked: false
          }
        }
    }
  }

  const handleDownload = async (image: ImageAsset) => {
    const accessInfo = getAccessInfo(image.accessLevel)
    
    try {
      const response = await fetch(resolveRxvUrl('/api/download-image'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId: image.id }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data?.success || !data?.downloadUrl) {
        alert(data?.error || '下載失敗，請稍後再試')
        return
      }
      {
        const link = document.createElement('a')
        link.href = data.downloadUrl
        link.download = image.title || 'image'
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

    } catch (error: any) {
      console.error('下載圖片時發生錯誤:', error)
      alert('下載失敗，請稍後再試')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 返回首頁連結 */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            ← 返回首頁
          </Link>
        </div>

        {/* 頁面標題區 */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            🖼️ 圖片素材
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            免費圖片＋會員解鎖素材，可直接下載使用
          </p>
        </div>

        {/* 分類篩選 */}
        {categories.length > 0 && (
          <div className="mb-6 bg-white rounded-xl shadow-md p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              分類篩選
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategoryId(null)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  selectedCategoryId === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                全部
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    selectedCategoryId === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 載入中 */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">載入中…</p>
          </div>
        )}

        {/* 無資料 */}
        {!loading && images.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {selectedCategoryId ? '此分類尚無圖片' : '目前尚無圖片'}
            </p>
          </div>
        )}

        {/* 圖片列表 Grid */}
        {!loading && images.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((image) => {
              const accessInfo = getAccessInfo(image.accessLevel)
              
              return (
                <Card
                  key={image.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow duration-200"
                >
                  {/* 圖片預覽 */}
                  <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
                    <img
                      src={image.previewUrl}
                      alt={image.title}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        // 如果圖片載入失敗，顯示 placeholder
                        const target = e.target as HTMLImageElement
                        target.src = 'https://via.placeholder.com/400x300/E5E7EB/9CA3AF?text=圖片預覽'
                      }}
                    />
                    {/* 權限標籤（右上角） */}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${accessInfo.labelColor}`}
                      >
                        {accessInfo.label}
                      </span>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    {/* 圖片標題 */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                      {image.title}
                    </h3>

                    {/* 副說明文字（僅未解鎖的 member 和 all 顯示） */}
                    {accessInfo.showSubtext && !accessInfo.unlocked && (
                      <p className="text-xs text-gray-500 mb-3">
                        一次解鎖，永久使用
                      </p>
                    )}
                    
                    {/* 已解鎖提示（僅已解鎖的圖片顯示） */}
                    {accessInfo.unlocked && image.accessLevel !== 'free' && (
                      <p className="text-xs text-green-600 mb-3 font-medium">
                        ✓ 已解鎖，可下載
                      </p>
                    )}

                    {/* 下載/解鎖按鈕 */}
                    <button
                      onClick={() => handleDownload(image)}
                      className={`w-full py-2.5 px-4 rounded-lg text-white font-medium transition-colors ${accessInfo.buttonClass}`}
                    >
                      {accessInfo.buttonText}
                    </button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* 底部說明區塊 */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            💡 使用說明
          </h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong className="text-green-700">免費</strong> 圖片可直接下載使用，無需任何條件
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong className="text-blue-700">會員解鎖</strong> 需購買 NT$99 方案，一次解鎖即可永久使用
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong className="text-purple-700">全站解鎖</strong> 需購買 NT$199 方案，可解鎖所有素材
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

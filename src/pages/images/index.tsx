import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { isLoggedIn, getCurrentUserId } from '@/lib/auth'

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
  const navigate = useNavigate()
  const [images, setImages] = useState<ImageAsset[]>([])
  const [categories, setCategories] = useState<ImageCategory[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null) // null 代表全部
  const [loading, setLoading] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(false)
  
  // TODO: 未來從後端或 localStorage 取得使用者方案狀態
  // 目前先手動指定為 "free" 作測試
  // 可改為 "basic" 或 "pro" 來測試不同方案狀態
  const userPlan: 'free' | 'basic' | 'pro' = 'free'

  // 載入分類
  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true)
      try {
        const { data, error } = await supabase
          .from('image_categories')
          .select('id, name, slug')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })

        if (error) {
          console.error('載入分類失敗:', error)
        } else {
          setCategories(data || [])
        }
      } catch (err) {
        console.error('載入分類時發生錯誤:', err)
      } finally {
        setLoadingCategories(false)
      }
    }

    loadCategories()
  }, [])

  // 載入圖片（根據選中的分類）
  useEffect(() => {
    const loadImages = async () => {
      setLoading(true)
      try {
        let query = supabase
          .from('images')
          .select(`
            id,
            title,
            public_url,
            image_url,
            access_level,
            category_id,
            image_categories!left(id, name, slug)
          `)
          .order('created_at', { ascending: false })

        // 如果有選中分類，加入篩選條件
        if (selectedCategoryId) {
          query = query.eq('category_id', selectedCategoryId)
        }
        // 如果 selectedCategoryId 為 null，不加入篩選條件，顯示全部

        const { data, error } = await query

        if (error) {
          console.error('載入圖片失敗:', error)
          setImages([])
        } else {
          // 轉換資料格式
          const formattedImages: ImageAsset[] = (data || [])
            .map((img: any) => ({
              id: img.id,
              title: img.title || '未命名圖片',
              previewUrl: img.public_url || img.image_url || '',
              accessLevel: (img.access_level === 'free' ? 'free' : 
                           img.access_level === 'member' ? 'member' : 'all') as 'free' | 'member' | 'all',
              category_id: img.category_id
            }))
          setImages(formattedImages)
        }
      } catch (err) {
        console.error('載入圖片時發生錯誤:', err)
        setImages([])
      } finally {
        setLoading(false)
      }
    }

    loadImages()
  }, [selectedCategoryId])

  // 判斷圖片是否已解鎖
  const isUnlocked = (accessLevel: ImageAsset['accessLevel']): boolean => {
    switch (accessLevel) {
      case 'free':
        return true // 免費圖片永遠可下載
      case 'member':
        return userPlan === 'basic' || userPlan === 'pro' // 需 basic 或 pro
      case 'all':
        return userPlan === 'pro' // 需 pro
    }
  }

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
    
    // 檢查是否已登入
    if (!isLoggedIn()) {
      alert('請先登入後再下載圖片')
      navigate('/login')
      return
    }

    // 如果未解鎖，導向方案升級頁（保留原有的 UI 邏輯）
    if (!accessInfo.unlocked) {
      if (image.accessLevel === 'member') {
        navigate('/pricing')
      } else if (image.accessLevel === 'all') {
        navigate('/pricing')
      }
      return
    }

    try {
      // 呼叫後端 API 下載圖片
      const userId = getCurrentUserId()
      const response = await fetch('/api/download-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageId: image.id,
          userId: userId,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        // 處理錯誤
        if (data.requiresLogin) {
          alert('請先登入後再下載圖片')
          navigate('/login')
          return
        }
        
        if (data.error) {
          alert(data.error)
          
          // 如果是方案不足，導向方案頁
          if (data.requiredPlan && data.requiredPlan !== 'free') {
            navigate('/pricing')
          }
          return
        }
        
        alert('下載失敗，請稍後再試')
        return
      }

      // 下載成功，觸發瀏覽器下載
      if (data.downloadUrl) {
        // 創建一個臨時的 a 標籤來觸發下載
        const link = document.createElement('a')
        link.href = data.downloadUrl
        link.download = data.imageTitle || 'image' // 嘗試設定檔名
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        alert('下載連結無效')
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
        {!loadingCategories && categories.length > 0 && (
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
                      className="w-full h-full object-cover"
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

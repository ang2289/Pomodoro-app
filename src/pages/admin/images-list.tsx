import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

interface Image {
  id: string
  title: string
  public_url: string
  created_at: string
  is_free: boolean
  category_id?: string | null
}

interface ImageCategory {
  id: string
  name: string
  sort_order: number
  is_active: boolean
}

export default function AdminImagesListPage() {
  const [images, setImages] = useState<Image[]>([])
  const [allImages, setAllImages] = useState<Image[]>([]) // 儲存所有圖片（用於篩選）
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<ImageCategory[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all') // 'all' 表示全部
  const [loadingCategories, setLoadingCategories] = useState(false)

  // 載入分類
  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true)
      try {
        const { data, error } = await supabase
          .from('image_categories')
          .select('id, name, sort_order, is_active')
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

  // 載入圖片清單
  useEffect(() => {
    const loadImages = async () => {
      try {
        setLoading(true)

        const { data, error } = await supabase
          .from('images')
          .select('id, title, public_url, created_at, is_free, category_id')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('載入圖片清單失敗:', error)
          return
        }

        setAllImages(data || [])
        // 預設顯示全部
        setImages(data || [])
      } catch (err) {
        console.error('載入圖片清單時發生錯誤:', err)
      } finally {
        setLoading(false)
      }
    }

    loadImages()
  }, [])

  // 根據選中的分類篩選圖片
  useEffect(() => {
    if (selectedCategoryId === 'all') {
      setImages(allImages)
    } else {
      const filtered = allImages.filter(
        (image) => image.category_id === selectedCategoryId
      )
      setImages(filtered)
    }
  }, [selectedCategoryId, allImages])

  // 格式化日期為 yyyy-mm-dd
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 返回連結 */}
        <div className="mb-6">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            ← 返回管理後台
          </Link>
        </div>

        {/* 頁面標題 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              🖼️ 圖片清單
            </h1>
            <Link
              to="/admin/images"
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              上傳圖片 →
            </Link>
          </div>
          <p className="text-gray-600">
            顯示所有已上傳的圖片
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
                onClick={() => setSelectedCategoryId('all')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  selectedCategoryId === 'all'
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
            {selectedCategoryId !== 'all' && (
              <p className="text-xs text-gray-500 mt-3">
                顯示 {images.length} 張圖片
              </p>
            )}
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
            <p className="text-gray-600">目前尚無圖片</p>
          </div>
        )}

        {/* 圖片清單 */}
        {!loading && images.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((image) => (
              <div
                key={image.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* 圖片預覽 */}
                <div className="w-full bg-gray-100 flex items-center justify-center">
                  <img
                    src={image.public_url}
                    alt={image.title}
                    className="w-[200px] h-auto object-contain"
                  />
                </div>

                {/* 內容區域 */}
                <div className="p-4 space-y-2">
                  {/* 標題 */}
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                    {image.title}
                  </h3>

                  {/* 建立時間 */}
                  <p className="text-xs text-gray-500">
                    {formatDate(image.created_at)}
                  </p>

                  {/* 是否免費 */}
                  <div className="pt-2">
                    {image.is_free ? (
                      <span className="inline-block px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded">
                        免費
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded">
                        付費
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

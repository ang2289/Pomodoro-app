import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const IMAGE_ADMIN_KEY_STORAGE = 'rxv_image_admin_key'
function getImageAdminKey() {
  let key = sessionStorage.getItem(IMAGE_ADMIN_KEY_STORAGE) || ''
  if (!key) { key = window.prompt('請輸入圖片後台管理金鑰')?.trim() || ''; if (key) sessionStorage.setItem(IMAGE_ADMIN_KEY_STORAGE, key) }
  return key
}

interface ImageItem { id: string; title: string; public_url: string; thumbnail_url?: string; created_at?: string; price_type?: string; plan_type?: string; category_id?: string; category_name?: string }
export default function AdminImagesListPage() {
  const [allImages, setAllImages] = useState<ImageItem[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState('all')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  useEffect(() => { (async () => {
    setLoading(true)
    try {
      const key = getImageAdminKey(); if (!key) throw new Error('請輸入圖片後台管理金鑰')
      const response = await fetch('/api/image-admin?action=admin-list-images', { headers: { 'X-RXV-Image-Admin-Key': key } })
      const data = await response.json().catch(() => ({})); if (!response.ok || !data?.ok) throw new Error(data?.error || `HTTP ${response.status}`)
      setAllImages(Array.isArray(data.images) ? data.images : [])
    } catch (error: any) { setLoadError(error?.message || '圖片清單載入失敗') } finally { setLoading(false) }
  })() }, [])
  const categories = [...new Map(allImages.filter((image) => image.category_id && image.category_name).map((image) => [image.category_id!, image.category_name!])).entries()]
  const images = selectedCategoryId === 'all' ? allImages : allImages.filter((image) => image.category_id === selectedCategoryId)
  return <div className="min-h-screen bg-gray-50 py-8"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="mb-6"><Link to="/admin/dashboard" className="text-blue-600 font-medium">← 返回管理後台</Link></div>
    <div className="mb-8 flex items-center justify-between"><div><h1 className="text-3xl font-bold text-gray-900">🖼️ 圖片清單</h1><p className="text-gray-600">Public R2 catalog：{allImages.length} 張</p></div><Link to="/admin/images" className="px-4 py-2 text-blue-600 bg-blue-50 rounded-lg">上傳圖片 →</Link></div>
    {!loading && categories.length > 0 && <div className="mb-6 bg-white rounded-xl shadow-md p-4"><div className="flex flex-wrap gap-2"><button onClick={() => setSelectedCategoryId('all')} className={selectedCategoryId === 'all' ? 'px-4 py-2 rounded-lg bg-blue-600 text-white' : 'px-4 py-2 rounded-lg bg-gray-100'}>全部</button>{categories.map(([id, name]) => <button key={id} onClick={() => setSelectedCategoryId(id)} className={selectedCategoryId === id ? 'px-4 py-2 rounded-lg bg-blue-600 text-white' : 'px-4 py-2 rounded-lg bg-gray-100'}>{name}</button>)}</div></div>}
    {loading && <p className="py-12 text-center text-gray-600">載入中…</p>}{loadError && <p className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{loadError}</p>}
    {!loading && !loadError && <><p className="mb-4 text-sm text-gray-600">顯示 {images.length} / {allImages.length} 張</p><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">{images.map((image) => <article key={image.id} className="bg-white rounded-lg shadow-md overflow-hidden"><img src={image.thumbnail_url || image.public_url} alt={image.title} className="w-full h-52 object-contain bg-gray-100" loading="lazy"/><div className="p-4 space-y-1"><h2 className="text-sm font-semibold line-clamp-2">{image.title}</h2><p className="text-xs text-gray-500">分類：{image.category_name || image.category_id || '未分類'}</p><p className="text-xs text-gray-500">方案：{image.plan_type || image.price_type || 'bundle'}</p><p className="text-xs text-gray-400">{image.created_at || '既有素材'}</p></div></article>)}</div></>}
  </div></div>
}

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

type ImageItem = {
  id: string
  title: string
  public_url: string
  thumbnail_url?: string
  created_at?: string
  price_type?: string
  plan_type?: string
  category_id?: string
  category_name?: string
}

const FALLBACK_CATEGORIES = [
  ['real-estate', '房仲／房地產'],
  ['hair-salon', '美髮／沙龍'],
  ['beauty-fashion', '美容／時尚'],
  ['food-drink', '食物／飲品'],
  ['business-office', '商業／辦公'],
  ['product-display', '商品展示'],
  ['home-lifestyle', '居家／生活'],
  ['flower-plant', '花卉／植物'],
  ['background-wallpaper', '背景／桌布'],
  ['pet-animal', '寵物／動物'],
  ['wedding-event', '婚禮／活動'],
  ['travel-hotel', '旅遊／住宿'],
  ['education', '教育／學習'],
  ['finance', '金融／理財'],
  ['professional-service', '專業服務'],
  ['taiwan-local', '台灣在地生活'],
  ['nature-landscape', '自然／風景'],
  ['festival', '節慶／節日'],
  ['religion-healing', '宗教／療癒'],
  ['technology', '科技／數位'],
  ['other', '其他素材'],
] as const

const IMAGE_ADMIN_KEY_STORAGE = 'rxv_image_admin_key'
function isLocalAdmin() {
  return typeof window !== 'undefined' && (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')
}
function getImageAdminKey() {
  if (isLocalAdmin()) return ''
  let key = window.localStorage.getItem(IMAGE_ADMIN_KEY_STORAGE) || ''
  if (!key) {
    key = window.prompt('請輸入圖片後台管理金鑰')?.trim() || ''
    if (key) window.localStorage.setItem(IMAGE_ADMIN_KEY_STORAGE, key)
  }
  return key
}
function adminHeaders(json = false) {
  const headers: Record<string, string> = {}
  const key = getImageAdminKey()
  if (key) headers['X-RXV-Image-Admin-Key'] = key
  if (json) headers['Content-Type'] = 'application/json'
  return headers
}

export default function AdminImagesListPage() {
  const [allImages, setAllImages] = useState<ImageItem[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [targetCategoryId, setTargetCategoryId] = useState('hair-salon')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [message, setMessage] = useState('')

  const load = async () => {
    setLoading(true)
    setLoadError('')
    try {
      const response = await fetch('/api/image-admin?action=admin-list-images', { headers: adminHeaders(false) })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data?.ok) throw new Error(data?.error || `HTTP ${response.status}`)
      const rows = Array.isArray(data.images) ? data.images : []
      rows.sort((a: ImageItem, b: ImageItem) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
      setAllImages(rows)
      setSelectedIds(new Set())
    } catch (error: any) {
      setLoadError(error?.message || '圖片清單載入失敗')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const categories = useMemo(() => {
    const map = new Map<string, string>(FALLBACK_CATEGORIES as any)
    allImages.forEach((image) => {
      if (image.category_id && image.category_name) map.set(image.category_id, image.category_name)
    })
    return [...map.entries()]
  }, [allImages])

  const images = selectedCategoryId === 'all' ? allImages : allImages.filter((image) => image.category_id === selectedCategoryId)
  const selectedCount = selectedIds.size
  const targetCategoryName = categories.find(([id]) => id === targetCategoryId)?.[1] || targetCategoryId

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const selectVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      images.forEach((image) => next.add(image.id))
      return next
    })
  }

  const clearSelection = () => setSelectedIds(new Set())

  const updateCategory = async () => {
    if (!selectedCount) return window.alert('請先勾選要修改的圖片。')
    if (!window.confirm(`確定把 ${selectedCount} 張圖片改成「${targetCategoryName}」嗎？\n只修改分類，不會刪除圖片。`)) return
    setBusy(true); setMessage('')
    try {
      const response = await fetch('/api/image-admin?action=updateImageCategory', {
        method: 'POST', headers: adminHeaders(true),
        body: JSON.stringify({ image_ids: [...selectedIds], category_id: targetCategoryId, category_name: targetCategoryName }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data?.ok) throw new Error(data?.error || `HTTP ${response.status}`)
      setMessage(`已成功修改 ${data.updated || selectedCount} 張圖片分類為「${targetCategoryName}」。`)
      await load()
    } catch (error: any) {
      window.alert(`修改失敗：${error?.message || error}`)
    } finally { setBusy(false) }
  }

  const deleteSelected = async () => {
    if (!selectedCount) return window.alert('請先勾選要刪除的圖片。')
    const ok = window.confirm(`確定永久刪除這 ${selectedCount} 張圖片嗎？\n會從網站 catalog 移除，並嘗試刪除 R2 縮圖與原圖。此動作無法復原。`)
    if (!ok) return
    const ok2 = window.confirm('再次確認：真的要永久刪除選取圖片？')
    if (!ok2) return
    setBusy(true); setMessage('')
    try {
      const response = await fetch('/api/image-admin?action=deleteImages', {
        method: 'POST', headers: adminHeaders(true), body: JSON.stringify({ image_ids: [...selectedIds] }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data?.ok) throw new Error(data?.error || `HTTP ${response.status}`)
      setMessage(`已刪除 ${data.deleted || selectedCount} 張圖片。`)
      await load()
    } catch (error: any) {
      window.alert(`刪除失敗：${error?.message || error}`)
    } finally { setBusy(false) }
  }

  return <div className="min-h-screen bg-gray-50 py-6">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link to="/admin/images" className="font-bold text-blue-600">← 返回上傳圖片</Link>
        <button onClick={() => void load()} disabled={busy} className="rounded-lg bg-slate-100 px-4 py-2 font-bold text-slate-700">重新整理</button>
      </div>

      <div className="mb-5 rounded-2xl bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-black text-gray-900">圖片管理｜修改分類／刪除</h1>
        <p className="mt-1 text-sm text-gray-600">最新上傳圖片排最前面。這次美髮誤傳到房仲，請勾選美髮圖片後批次改成「美髮／沙龍」。</p>
        <p className="mt-1 text-sm font-bold text-blue-700">Public R2 catalog：{allImages.length} 張｜已選 {selectedCount} 張</p>
      </div>

      {message && <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 font-bold text-emerald-800">{message}</div>}
      {loadError && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{loadError}</div>}

      {!loading && <div className="sticky top-2 z-20 mb-5 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-black text-slate-500">改成分類</label>
            <select value={targetCategoryId} onChange={(e) => setTargetCategoryId(e.target.value)} className="min-w-[180px] rounded-lg border border-slate-300 bg-white px-3 py-2 font-bold">
              {categories.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
          </div>
          <button onClick={updateCategory} disabled={busy || !selectedCount} className="rounded-lg bg-blue-600 px-4 py-2 font-black text-white disabled:opacity-40">批次改分類</button>
          <button onClick={deleteSelected} disabled={busy || !selectedCount} className="rounded-lg bg-red-600 px-4 py-2 font-black text-white disabled:opacity-40">刪除選取</button>
          <button onClick={selectVisible} disabled={busy || !images.length} className="rounded-lg bg-slate-100 px-4 py-2 font-bold">全選目前顯示</button>
          <button onClick={clearSelection} disabled={busy || !selectedCount} className="rounded-lg bg-slate-100 px-4 py-2 font-bold">取消全選</button>
        </div>
      </div>}

      {!loading && categories.length > 0 && <div className="mb-5 rounded-xl bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setSelectedCategoryId('all')} className={selectedCategoryId === 'all' ? 'rounded-lg bg-blue-600 px-4 py-2 text-white' : 'rounded-lg bg-gray-100 px-4 py-2'}>全部</button>
          {categories.map(([id, name]) => <button key={id} onClick={() => setSelectedCategoryId(id)} className={selectedCategoryId === id ? 'rounded-lg bg-blue-600 px-4 py-2 text-white' : 'rounded-lg bg-gray-100 px-4 py-2'}>{name}</button>)}
        </div>
      </div>}

      {loading && <p className="py-12 text-center text-gray-600">載入中…</p>}
      {!loading && !loadError && <>
        <p className="mb-4 text-sm text-gray-600">顯示 {images.length} / {allImages.length} 張</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {images.map((image) => {
            const checked = selectedIds.has(image.id)
            return <article key={image.id} className={checked ? 'overflow-hidden rounded-xl border-4 border-blue-500 bg-white shadow-md' : 'overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'}>
              <label className="block cursor-pointer">
                <div className="relative bg-gray-100">
                  <img src={image.thumbnail_url || image.public_url} alt={image.title} className="h-44 w-full object-contain" loading="lazy"/>
                  <input type="checkbox" checked={checked} onChange={() => toggle(image.id)} className="absolute left-3 top-3 h-6 w-6 accent-blue-600"/>
                </div>
                <div className="p-3">
                  <h2 className="line-clamp-2 text-sm font-bold">{image.title}</h2>
                  <p className="mt-1 text-xs font-bold text-blue-700">分類：{image.category_name || image.category_id || '未分類'}</p>
                  <p className="mt-1 text-[11px] text-gray-400">{image.created_at ? new Date(image.created_at).toLocaleString('zh-TW') : '既有素材'}</p>
                </div>
              </label>
            </article>
          })}
        </div>
      </>}
    </div>
  </div>
}

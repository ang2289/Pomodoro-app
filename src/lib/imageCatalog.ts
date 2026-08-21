const CACHE_KEY = 'rxv_public_image_catalog_v1'
const CACHE_TTL_MS = 6 * 60 * 60 * 1000
import { resolveRxvUrl } from './rxvUrl'

export interface PublicCatalogImage {
  id: string
  title: string
  categoryId: string
  categoryName: string
  previewUrl: string
  originalUrl: string
  planType: string
}

let catalogPromise: Promise<PublicCatalogImage[]> | null = null

function asUrl(value: unknown, catalogUrl: string) {
  const url = String(value || '').trim()
  if (!url) return ''
  if (url.startsWith('/api/')) return resolveRxvUrl(url)
  try { return new URL(url, catalogUrl).toString() } catch { return url }
}

function mapImage(row: any, catalogUrl: string): PublicCatalogImage | null {
  const id = String(row?.id || '').trim()
  if (!id) return null
  const previewUrl = asUrl(row?.thumbnail_url || row?.thumbnail || row?.preview_url || row?.url || row?.image_url || row?.public_url, catalogUrl)
  // Original download/share must never fall back to a thumbnail or preview URL.
  const originalUrl = asUrl(row?.original_url || row?.originalUrl || row?.download_url || row?.downloadUrl, catalogUrl)
  return {
    id,
    title: String(row?.title || row?.name || '未命名圖片'),
    categoryId: String(row?.category_id || row?.category || 'uncategorized'),
    categoryName: String(row?.category_name || row?.category || '未分類'),
    previewUrl,
    originalUrl,
    planType: String(row?.plan_type || row?.price_type || row?.access_level || 'bundle'),
  }
}

function readCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || '')
    return Array.isArray(cached?.images) ? cached : null
  } catch { return null }
}

export function loadPublicImageCatalog() {
  if (catalogPromise) return catalogPromise
  catalogPromise = (async () => {
    const catalogUrl = resolveRxvUrl(import.meta.env.VITE_IMAGE_CATALOG_URL || import.meta.env.IMAGE_CATALOG_URL)
    const cached = readCache()
    if (!catalogUrl) return cached?.images || []
    if (cached && Date.now() - Number(cached.savedAt || 0) < CACHE_TTL_MS) return cached.images
    try {
      const response = await fetch(catalogUrl, { cache: 'no-cache' })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const json = await response.json()
      const rows = Array.isArray(json) ? json : (json?.images || json?.data || json?.items || [])
      const images = rows.map((row: any) => mapImage(row, catalogUrl)).filter(Boolean) as PublicCatalogImage[]
      localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), images }))
      return images
    } catch (error) {
      if (cached?.images) return cached.images
      throw error
    }
  })()
  return catalogPromise
}

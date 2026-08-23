import { getCustomSessionToken } from '@/lib/accountApi'

export type PublicImageCategory = {
  id: string
  name: string
  slug: string | null
}

export type PublicImage = {
  id: string
  title: string | null
  public_url: string | null
  image_url: string | null
  thumbnail_url: string | null
  price_type: string | null
  category_id: string | null
}

export type PublicDealItem = {
  id: string
  platform: string | null
  title: string | null
  price: number | null
  original_price: number | null
  image_url: string | null
  product_url: string | null
  affiliate_url: string | null
  sale_end_time: string | null
  discount_percent: number | null
}

async function request<T>(action: string, init: RequestInit = {}, query?: Record<string, string>) {
  const params = new URLSearchParams({ action, ...(query || {}) })
  const response = await fetch(`/api/main?${params.toString()}`, init)
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(String(data?.error || `API_${response.status}`))
  return data as T
}

async function adminRequest<T>(action: string, body?: Record<string, unknown>) {
  const token = getCustomSessionToken()
  if (!token) throw new Error('AUTH_REQUIRED')
  return request<T>(action, {
    method: body ? 'POST' : 'GET',
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${token}`,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
}

export async function getPublicImageCategories(): Promise<PublicImageCategory[]> {
  const data = await request<{ categories?: PublicImageCategory[] }>('get-public-image-categories')
  return Array.isArray(data.categories) ? data.categories : []
}

export async function getPublicImages(categoryId?: string | null, page = 0, pageSize = 24) {
  const query: Record<string, string> = { page: String(page), page_size: String(pageSize) }
  if (categoryId) query.category_id = categoryId
  return request<{ images?: PublicImage[]; total?: number }>('get-public-images', {}, query)
}

export async function getPublicDeals(): Promise<PublicDealItem[]> {
  const data = await request<{ deals?: PublicDealItem[] }>('get-public-deals')
  return Array.isArray(data.deals) ? data.deals : []
}

export async function getAdminImageCategories() {
  return adminRequest<{ categories?: Array<{ id: string; name: string; slug?: string | null; sort_order: number; is_active: boolean }> }>('admin-list-image-categories')
}

export async function createAdminImageCategory(input: { name: string; sort_order: number }) {
  return adminRequest<{ category?: { id: string; name: string; sort_order: number; is_active: boolean } }>('admin-create-image-category', input)
}

export async function updateAdminImageCategory(id: string, input: { name?: string; sort_order?: number; is_active?: boolean }) {
  return adminRequest('admin-update-image-category', { id, ...input })
}

export async function deleteAdminImageCategory(id: string) {
  return adminRequest('admin-delete-image-category', { id })
}

export async function getAdminImages() {
  return adminRequest<{ images?: Array<{ id: string; title: string; public_url: string; created_at: string; is_free: boolean; price_type?: string | null; category_id?: string | null }> }>('admin-list-images')
}

export async function updateAdminImage(id: string, input: { price_type: string }) {
  return adminRequest('admin-update-image', { id, ...input })
}

export async function deleteAdminImage(id: string) {
  return adminRequest('admin-delete-image', { id })
}

export async function getAdminDeals() {
  return adminRequest<{ deals?: PublicDealItem[] }>('admin-list-deals')
}

export async function updateAdminDealAffiliate(id: string, affiliate_url: string | null) {
  return adminRequest('admin-update-deal-affiliate', { id, affiliate_url })
}

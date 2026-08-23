import type { Campaign, OrderDetail, PickupSlot, PickupStore, Product, ProductImage } from './groupBuyTypes'

const API_PATH = '/api/group-buy'

export function getAuthToken() {
  if (typeof window === 'undefined') return ''
  return String(localStorage.getItem('auth_token') || localStorage.getItem('token') || '').trim()
}

async function request<T>(
  action: string,
  method: 'GET' | 'POST',
  body?: unknown,
  query?: Record<string, string>,
  auth: boolean | 'optional' = false,
): Promise<T> {
  const params = new URLSearchParams({ action, ...(query || {}) })
  const token = auth ? getAuthToken() : ''
  if (auth === true && !token) throw new Error('登入已失效，請重新登入。')

  const response = await fetch(`${API_PATH}?${params.toString()}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(String(data?.error || `操作失敗（HTTP ${response.status}）`))
  return data as T
}

export const groupBuyApi = {
  getCampaign(slug: string) {
    return request<{ campaign: Campaign }>('public-campaign', 'GET', undefined, { slug })
  },

  getProductDetail(campaignSlug: string, productId: string) {
    return request<{ campaign: { id: string; slug: string; title: string; status: string }; product: Product; images: ProductImage[] }>(
      'public-product-detail', 'GET', undefined, { campaignSlug, productId },
    )
  },

  getMyProfile() {
    return request<{ userId: string; email: string }>('my-profile', 'GET', undefined, undefined, true)
  },

  registerOrder(body: unknown) {
    return request<{ orderCode: string; orderPath: string; status: string; notificationStatus: string }>(
      'register',
      'POST',
      body,
      undefined,
      true,
    )
  },

  getOrder(orderCode: string) {
    return request<OrderDetail>('get-order', 'GET', undefined, { orderCode }, true)
  },

  listMyOrders() {
    return request<{ orders: any[] }>('my-orders', 'GET', undefined, undefined, true)
  },

  openMyOrder(orderCode: string) {
    return request<{ orderPath: string }>('open-my-order', 'POST', { orderCode }, undefined, true)
  },

  reportPayment(body: unknown) {
    return request<{ ok: true }>('report-payment', 'POST', body, undefined, true)
  },

  selectPickupSlot(orderCode: string, pickupSlotId: string) {
    return request<{ ok: true; pickupDate: string }>(
      'select-pickup-slot',
      'POST',
      { orderCode, pickupSlotId },
      undefined,
      true,
    )
  },

  adminBootstrap() {
    return request<{ workspace: { id: string; name: string; slug: string } }>(
      'admin-bootstrap',
      'POST',
      {},
      undefined,
      true,
    )
  },

  adminListCampaigns() {
    return request<{ campaigns: any[] }>('admin-list-campaigns', 'GET', undefined, undefined, true)
  },

  adminGetCampaign(id: string) {
    return request<{
      campaign: any
      products: any[]
      shippingMethods: any[]
      pickupStores: PickupStore[]
      pickupSlots: PickupSlot[]
    }>(
      'admin-get-campaign',
      'GET',
      undefined,
      { id },
      true,
    )
  },

  adminSaveCampaign(body: unknown) {
    return request<{ id: string; slug: string }>('admin-save-campaign', 'POST', body, undefined, true)
  },

  adminListOrders(campaignId: string) {
    return request<{ orders: any[] }>('admin-list-orders', 'GET', undefined, { campaignId }, true)
  },

  adminSetCampaignStatus(campaignId: string, status: string, force = false) {
    return request<{ ok: true }>(
      'admin-set-campaign-status',
      'POST',
      { campaignId, status, force },
      undefined,
      true,
    )
  },

  adminExtendRegistration(campaignId: string, reason: string) {
    return request<{ ok: true; registrationEndsAt: string; registrationExtensionCount: number }>(
      'admin-extend-registration', 'POST', { campaignId, reason }, undefined, true,
    )
  },

  adminCloseRegistrationAndOpenPayment(campaignId: string) {
    return request<{ ok: true; idempotent?: boolean; paymentOpenedAt?: string; paymentDeadline: string }>(
      'admin-close-registration-and-open-payment', 'POST', { campaignId }, undefined, true,
    )
  },

  adminCancelUnreachedCampaign(campaignId: string) {
    return request<{ ok: true; idempotent?: boolean; cancelledOrders?: number }>(
      'admin-cancel-unreached-campaign', 'POST', { campaignId }, undefined, true,
    )
  },

  adminMarkSupplierOrdered(campaignId: string, supplierExpectedShipAt = '', shippingNotice = '') {
    return request<{ ok: true; idempotent?: boolean; supplierOrderedAt: string; estimatedEarliestShipAt?: string; estimatedLatestShipAt: string }>(
      'admin-mark-supplier-ordered', 'POST', { campaignId, supplierExpectedShipAt, shippingNotice }, undefined, true,
    )
  },

  adminUpdateShippingEstimate(campaignId: string, estimatedLatestShipAt: string, reason: string, supplierExpectedShipAt = '', shippingNotice = '') {
    return request<{ ok: true; idempotent?: boolean; estimatedLatestShipAt: string }>(
      'admin-update-shipping-estimate', 'POST', { campaignId, estimatedLatestShipAt, reason, supplierExpectedShipAt, shippingNotice }, undefined, true,
    )
  },

  adminMarkOrderShipped(orderId: string, shippingCarrier = '', trackingNumber = '', shipmentNote = '') {
    return request<{ ok: true; idempotent?: boolean; shippedAt: string }>(
      'admin-mark-order-shipped', 'POST', { orderId, shippingCarrier, trackingNumber, shipmentNote }, undefined, true,
    )
  },

  adminVerifyPayment(orderId: string, paymentReportId: string, accepted: boolean, reviewNote = '') {
    return request<{
      ok: true
      orderStatus?: string
      paymentStatus?: string
      paymentReportStatus?: string
      notificationStatus?: string | null
      notificationProvider?: string | null
      notificationError?: string | null
    }>(
      'admin-verify-payment',
      'POST',
      { orderId, paymentReportId, accepted, reviewNote },
      undefined,
      true,
    )
  },

  adminUpdateOrderStatus(orderId: string, status: string) {
    return request<{
      ok: true
      notificationStatus?: string | null
      notificationProvider?: string | null
      notificationError?: string | null
    }>(
      'admin-update-order-status',
      'POST',
      { orderId, status },
      undefined,
      true,
    )
  },

  async adminBatchMarkOrdersShipped(orderIds: string[]) {
    let updatedCount = 0
    let emailSentCount = 0
    let emailPendingCount = 0
    let emailFailedCount = 0

    for (const orderId of [...new Set(orderIds.map((value) => String(value).trim()).filter(Boolean))]) {
      const result = await request<{
        ok: true
        notificationStatus?: string | null
        notificationProvider?: string | null
        notificationError?: string | null
      }>(
        'admin-update-order-status',
        'POST',
        { orderId, status: 'shipped' },
        undefined,
        true,
      )
      updatedCount += 1
      if (result.notificationStatus === 'notification_sent' && result.notificationProvider === 'resend') emailSentCount += 1
      else if (result.notificationStatus === 'notification_failed') emailFailedCount += 1
      else if (result.notificationStatus === 'notification_pending') emailPendingCount += 1
    }

    return {
      ok: true as const,
      updatedCount,
      emailSentCount,
      emailPendingCount,
      emailFailedCount,
    }
  },


  adminUpdateOrderNote(orderId: string, adminNote: string) {
    return request<{ ok: true }>('admin-update-order-note', 'POST', { orderId, adminNote }, undefined, true)
  },

  adminGenerateProductImagePrompts(productId: string) {
    return request<{ prompts: Record<string, unknown>; generatedImage: false; provider: null }>(
      'admin-generate-product-image-prompts', 'POST', { productId }, undefined, true,
    )
  },

  adminListProductImages(productId: string) {
    return request<{ images: any[] }>('admin-list-product-images', 'GET', undefined, { productId }, true)
  },

  adminSaveProductImage(body: unknown) {
    return request<{ ok: true }>('admin-save-product-image', 'POST', body, undefined, true)
  },

  adminUploadProductImage(productId: string, imageBase64: string) {
    return request<{ imageUrl: string; sizeBytes: number }>(
      'admin-upload-product-image', 'POST', { productId, imageBase64 }, undefined, true,
    )
  },

  adminDeleteProductImage(productId: string, imageId: string) {
    return request<{ ok: true }>(
      'admin-delete-product-image', 'POST', { productId, imageId }, undefined, true,
    )
  },
}

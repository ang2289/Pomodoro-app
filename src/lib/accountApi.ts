export type CurrentCreditSummary = {
  remaining_chars: number
  total_purchased_points: number
  total_used_chars: number
}

export type PurchaseLog = {
  id: string
  order_no: string
  amount: number
  points: number
  bonus_points: number
  status: string
  created_at: string
}

export function getCustomSessionToken(): string {
  if (typeof window === 'undefined') return ''
  return String(
    window.localStorage.getItem('auth_token') ||
      window.localStorage.getItem('token') ||
      '',
  ).trim()
}

async function accountApi<T>(action: string, query?: Record<string, string>): Promise<T> {
  const token = getCustomSessionToken()
  if (!token) throw new Error('AUTH_REQUIRED')

  const params = new URLSearchParams({ action, ...(query || {}) })
  const response = await fetch(`/api/main?${params.toString()}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(String(data?.error || `API_${response.status}`))
  }
  return data as T
}

export async function getCurrentCreditSummary(): Promise<CurrentCreditSummary> {
  return accountApi<CurrentCreditSummary>('get-current-user-credits')
}

export async function getMyPurchaseLogs(): Promise<PurchaseLog[]> {
  const data = await accountApi<{ purchases?: PurchaseLog[] }>('get-my-purchase-logs')
  return Array.isArray(data.purchases) ? data.purchases : []
}

export async function getPurchaseStatus(orderNo: string): Promise<PurchaseLog> {
  const data = await accountApi<{ purchase: PurchaseLog }>('get-purchase-status', {
    order_no: orderNo,
  })
  return data.purchase
}

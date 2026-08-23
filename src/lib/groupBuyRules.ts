export type RegistrationPhase =
  | 'not_started'
  | 'registration_open'
  | 'registration_threshold_reached'
  | 'registration_deadline_soon'
  | 'deadline_reached_threshold'
  | 'deadline_reached_can_extend'
  | 'deadline_reached_unreached_final'
  | 'payment_open'
  | 'confirmed'
  | 'supplier_ordered'
  | 'fulfilling'
  | 'completed'
  | 'cancelled'

export type CampaignRuleInput = {
  status: string
  registrationStartsAt?: string | null
  registrationEndsAt?: string | null
  minRegistrationValue: number
  registrationExtensionCount?: number | null
  registrationClosedAt?: string | null
}

export type CampaignProgressInput = {
  registrationValue: number
}

const TAIPEI_OFFSET_MS = 8 * 60 * 60 * 1000

function timestamp(value?: string | Date | null) {
  if (!value) return Number.NaN
  return value instanceof Date ? value.getTime() : new Date(value).getTime()
}

export function addBusinessDays(startDate: string | Date, businessDays: number) {
  const startMs = timestamp(startDate)
  if (!Number.isFinite(startMs)) throw new Error('INVALID_START_DATE')
  if (!Number.isInteger(businessDays) || businessDays < 0) throw new Error('INVALID_BUSINESS_DAYS')

  const taipei = new Date(startMs + TAIPEI_OFFSET_MS)
  let remaining = businessDays
  while (remaining > 0) {
    taipei.setUTCDate(taipei.getUTCDate() + 1)
    const day = taipei.getUTCDay()
    if (day !== 0 && day !== 6) remaining -= 1
  }
  return new Date(taipei.getTime() - TAIPEI_OFFSET_MS).toISOString()
}

export function paymentDeadlineFromOpenedAt(openedAt: string | Date, days = 3) {
  const openedMs = timestamp(openedAt)
  if (!Number.isFinite(openedMs)) throw new Error('INVALID_PAYMENT_OPENED_AT')
  if (!Number.isInteger(days) || days <= 0) throw new Error('INVALID_PAYMENT_DEADLINE_DAYS')
  return new Date(openedMs + days * 24 * 60 * 60 * 1000).toISOString()
}

export function resolveSupplierShippingWindow(
  supplierOrderedAt: string | Date,
  minBusinessDays = 7,
  maxBusinessDays = 14,
) {
  if (maxBusinessDays < minBusinessDays) throw new Error('INVALID_SHIPPING_WINDOW')
  return {
    estimatedEarliestShipAt: addBusinessDays(supplierOrderedAt, minBusinessDays),
    estimatedLatestShipAt: addBusinessDays(supplierOrderedAt, maxBusinessDays),
  }
}

export function resolveShippingEstimateUpdate(
  previousEstimatedLatestShipAt: string | null | undefined,
  nextEstimatedLatestShipAt: string | Date,
  reason: string,
) {
  const nextMs = timestamp(nextEstimatedLatestShipAt)
  if (!Number.isFinite(nextMs)) throw new Error('INVALID_ESTIMATED_LATEST_SHIP_AT')
  const normalizedReason = String(reason || '').trim()
  if (!normalizedReason) throw new Error('SHIPPING_ESTIMATE_REASON_REQUIRED')
  const previousMs = timestamp(previousEstimatedLatestShipAt)
  return {
    changed: !Number.isFinite(previousMs) || previousMs !== nextMs,
    previousEstimatedLatestShipAt: Number.isFinite(previousMs) ? new Date(previousMs).toISOString() : null,
    newEstimatedLatestShipAt: new Date(nextMs).toISOString(),
    reason: normalizedReason,
  }
}

export function resolveServerTimestamp(existing: string | null | undefined, now: string | Date = new Date()) {
  const existingMs = timestamp(existing)
  if (Number.isFinite(existingMs)) return { value: new Date(existingMs).toISOString(), changed: false }
  const nowMs = timestamp(now)
  if (!Number.isFinite(nowMs)) throw new Error('INVALID_SERVER_TIMESTAMP')
  return { value: new Date(nowMs).toISOString(), changed: true }
}

export function resolveCampaignRegistrationPhase(
  campaign: CampaignRuleInput,
  progress: CampaignProgressInput,
  now: string | Date = new Date(),
): RegistrationPhase {
  const status = String(campaign.status || '')
  if (status === 'payment_open' || status === 'payment_closed') return 'payment_open'
  if (status === 'confirmed') return 'confirmed'
  if (status === 'ordering') return 'supplier_ordered'
  if (status === 'fulfilling') return 'fulfilling'
  if (status === 'completed') return 'completed'
  if (status === 'cancelled') return 'cancelled'

  const nowMs = timestamp(now)
  const startsAt = timestamp(campaign.registrationStartsAt)
  const endsAt = timestamp(campaign.registrationEndsAt)
  if (Number.isFinite(startsAt) && nowMs < startsAt) return 'not_started'

  const thresholdReached = progress.registrationValue >= Number(campaign.minRegistrationValue || 0)
  if (!Number.isFinite(endsAt) || nowMs < endsAt) {
    if (Number.isFinite(endsAt) && endsAt - nowMs <= 24 * 60 * 60 * 1000) {
      return 'registration_deadline_soon'
    }
    return thresholdReached ? 'registration_threshold_reached' : 'registration_open'
  }
  if (thresholdReached) return 'deadline_reached_threshold'
  return Number(campaign.registrationExtensionCount || 0) < 1
    ? 'deadline_reached_can_extend'
    : 'deadline_reached_unreached_final'
}

export function canRegisterOrder(
  campaign: CampaignRuleInput,
  now: string | Date = new Date(),
) {
  const nowMs = timestamp(now)
  const startsAt = timestamp(campaign.registrationStartsAt)
  return campaign.status === 'registration_open' &&
    !campaign.registrationClosedAt &&
    (!Number.isFinite(startsAt) || nowMs >= startsAt)
}

export function canCloseAndOpenPayment(
  campaign: CampaignRuleInput,
  progress: CampaignProgressInput,
  now: string | Date = new Date(),
) {
  return resolveCampaignRegistrationPhase(campaign, progress, now) === 'deadline_reached_threshold'
}

// 向後相容既有呼叫名稱。
export const canOpenPayment = canCloseAndOpenPayment

export function canExtendRegistration(
  campaign: CampaignRuleInput,
  progress: CampaignProgressInput,
  now: string | Date = new Date(),
) {
  return resolveCampaignRegistrationPhase(campaign, progress, now) === 'deadline_reached_can_extend'
}

export function canCancelUnreachedCampaign(
  campaign: CampaignRuleInput,
  progress: CampaignProgressInput,
  now: string | Date = new Date(),
) {
  return ['deadline_reached_can_extend', 'deadline_reached_unreached_final']
    .includes(resolveCampaignRegistrationPhase(campaign, progress, now))
}

export type CampaignReminder = {
  type: string
  message: string
  dedupeKey: string
  severity: 'info' | 'warning' | 'urgent' | 'success'
}

export function buildCampaignReminders(
  campaignId: string,
  campaign: CampaignRuleInput & {
    paymentDeadline?: string | null
    estimatedLatestShipAt?: string | null
  },
  progress: CampaignProgressInput & {
    allActiveOrdersPaid?: boolean
    activeOrderCount?: number
    verifiedOrderCount?: number
  },
  now: string | Date = new Date(),
): CampaignReminder[] {
  const nowMs = timestamp(now)
  const reminders: CampaignReminder[] = []
  const thresholdReached = progress.registrationValue >= Number(campaign.minRegistrationValue || 0)
  const endsAt = timestamp(campaign.registrationEndsAt)
  const endsKey = campaign.registrationEndsAt || 'unset'

  if (campaign.status === 'registration_open' && !campaign.registrationClosedAt) {
    if (thresholdReached) reminders.push({ type: 'threshold_reached', message: '已達最低成團門檻，可繼續收單並於適當時間正式結團。', dedupeKey: `threshold_reached:${campaignId}`, severity: 'success' })
    if (Number.isFinite(endsAt)) {
      const remaining = endsAt - nowMs
      if (remaining > 3 * 60 * 60 * 1000 && remaining <= 24 * 60 * 60 * 1000) reminders.push({ type: 'registration_deadline_24h', message: '預計結團時間將在 24 小時內到達。', dedupeKey: `registration_deadline_24h:${campaignId}:${endsKey}`, severity: 'warning' })
      if (remaining > 0 && remaining <= 3 * 60 * 60 * 1000) reminders.push({ type: 'registration_deadline_3h', message: '預計結團時間將在 3 小時內到達。', dedupeKey: `registration_deadline_3h:${campaignId}:${endsKey}`, severity: 'urgent' })
      if (remaining <= 0) reminders.push({ type: 'registration_deadline_reached', message: '預計結團時間已到，正式結團前客戶仍可登記。', dedupeKey: `registration_deadline_reached:${campaignId}:${endsKey}`, severity: 'urgent' })
      if (remaining <= -12 * 60 * 60 * 1000) reminders.push({ type: 'registration_deadline_overdue_12h', message: '已超過預計結團時間 12 小時，請延長、取消或正式結團。', dedupeKey: `registration_deadline_overdue_12h:${campaignId}:${endsKey}`, severity: 'urgent' })
    }
  }

  const paymentDeadline = timestamp(campaign.paymentDeadline)
  if (campaign.status === 'payment_open' && Number.isFinite(paymentDeadline)) {
    const remaining = paymentDeadline - nowMs
    const key = campaign.paymentDeadline || 'unset'
    if (remaining > 0 && remaining <= 24 * 60 * 60 * 1000) reminders.push({ type: 'payment_deadline_24h', message: '付款期限將在 24 小時內到達。', dedupeKey: `payment_deadline_24h:${campaignId}:${key}`, severity: 'warning' })
    if (remaining <= 0 && !progress.allActiveOrdersPaid) reminders.push({ type: 'payment_deadline_reached', message: '付款期限已到，仍有未付款訂單。', dedupeKey: `payment_deadline_reached:${campaignId}:${key}`, severity: 'urgent' })
  }
  if (progress.allActiveOrdersPaid && Number(progress.activeOrderCount || 0) > 0) reminders.push({ type: 'all_orders_paid', message: '全部有效訂單付款完成，可向供應商下單。', dedupeKey: `all_orders_paid:${campaignId}`, severity: 'success' })

  const latestShip = timestamp(campaign.estimatedLatestShipAt)
  if (Number.isFinite(latestShip)) {
    const remaining = latestShip - nowMs
    const key = campaign.estimatedLatestShipAt || 'unset'
    if (remaining > 0 && remaining <= 3 * 24 * 60 * 60 * 1000) reminders.push({ type: 'estimated_ship_3d', message: '距離預計最晚出貨日不到 3 天。', dedupeKey: `estimated_ship_3d:${campaignId}:${key}`, severity: 'warning' })
    if (remaining <= 0) reminders.push({ type: 'estimated_ship_overdue', message: '已超過預計最晚出貨日，請更新公告與延期原因。', dedupeKey: `estimated_ship_overdue:${campaignId}:${key}`, severity: 'urgent' })
  }
  return reminders
}

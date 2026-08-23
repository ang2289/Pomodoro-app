import assert from 'node:assert/strict'
import test from 'node:test'
import {
  addBusinessDays,
  buildCampaignReminders,
  canCancelUnreachedCampaign,
  canCloseAndOpenPayment,
  canExtendRegistration,
  canRegisterOrder,
  paymentDeadlineFromOpenedAt,
  resolveCampaignRegistrationPhase,
  resolveServerTimestamp,
  resolveShippingEstimateUpdate,
  resolveSupplierShippingWindow,
} from '../src/lib/groupBuyRules.js'
import { buildProductImagePrompts } from '../src/lib/groupBuyProductPrompts.js'

const beforeDeadline = '2026-07-20T12:00:00.000Z'
const afterDeadline = '2026-07-25T16:00:00.000Z'
const campaign = (overrides: Record<string, unknown> = {}) => ({
  status: 'registration_open', registrationStartsAt: '2026-07-17T00:00:00.000Z',
  registrationEndsAt: '2026-07-24T15:59:00.000Z', registrationClosedAt: null,
  minRegistrationValue: 12, registrationExtensionCount: 0, ...overrides,
})

test('案例1：預計結團前11條仍可登記且不可付款', () => {
  assert.equal(canRegisterOrder(campaign(), beforeDeadline), true)
  assert.equal(canCloseAndOpenPayment(campaign(), { registrationValue: 11 }, beforeDeadline), false)
})
test('案例2：預計結團前12條不自動結團', () => {
  assert.equal(canRegisterOrder(campaign(), beforeDeadline), true)
  assert.equal(canCloseAndOpenPayment(campaign(), { registrationValue: 12 }, beforeDeadline), false)
})
test('案例3：預計結團時間到14條，團媽未處理仍可登記', () => {
  assert.equal(resolveCampaignRegistrationPhase(campaign(), { registrationValue: 14 }, afterDeadline), 'deadline_reached_threshold')
  assert.equal(canRegisterOrder(campaign(), afterDeadline), true)
})
test('案例4：團媽正式結團後付款期限為操作後3天', () => {
  assert.equal(canCloseAndOpenPayment(campaign(), { registrationValue: 14 }, afterDeadline), true)
  assert.equal(paymentDeadlineFromOpenedAt(afterDeadline), '2026-07-28T16:00:00.000Z')
  assert.equal(canRegisterOrder(campaign({ registrationClosedAt: afterDeadline, status: 'payment_open' }), afterDeadline), false)
})
test('案例5：預計結團時間到11條可延長或取消', () => {
  assert.equal(canExtendRegistration(campaign(), { registrationValue: 11 }, afterDeadline), true)
  assert.equal(canCancelUnreachedCampaign(campaign(), { registrationValue: 11 }, afterDeadline), true)
})
test('案例6：延長後13條可由團媽正式結團', () => {
  assert.equal(canCloseAndOpenPayment(campaign({ registrationExtensionCount: 1 }), { registrationValue: 13 }, afterDeadline), true)
})
test('案例7：延長一次後10條不可再延長且可取消', () => {
  const extended = campaign({ registrationExtensionCount: 1 })
  assert.equal(canExtendRegistration(extended, { registrationValue: 10 }, afterDeadline), false)
  assert.equal(canCancelUnreachedCampaign(extended, { registrationValue: 10 }, afterDeadline), true)
})
test('案例8：全部有效訂單付款完成產生供應商下單提醒', () => {
  const reminders = buildCampaignReminders('c1', campaign({ status: 'confirmed' }), { registrationValue: 14, allActiveOrdersPaid: true, activeOrderCount: 3 }, afterDeadline)
  assert.ok(reminders.some((item) => item.dedupeKey === 'all_orders_paid:c1'))
})
test('案例9：供應商下單後計算7與14工作天', () => {
  const window = resolveSupplierShippingWindow('2026-07-17T02:00:00.000Z', 7, 14)
  assert.equal(window.estimatedEarliestShipAt, '2026-07-28T02:00:00.000Z')
  assert.equal(window.estimatedLatestShipAt, '2026-08-06T02:00:00.000Z')
  assert.equal(addBusinessDays('2026-07-17T02:00:00.000Z', 1), '2026-07-20T02:00:00.000Z')
})
test('案例10：供應商延期必填原因且保留原新日期', () => {
  assert.throws(() => resolveShippingEstimateUpdate(null, '2026-08-10T02:00:00.000Z', ''), /SHIPPING_ESTIMATE_REASON_REQUIRED/)
  const change = resolveShippingEstimateUpdate('2026-08-06T02:00:00.000Z', '2026-08-10T02:00:00.000Z', '供應商延後')
  assert.equal(change.previousEstimatedLatestShipAt, '2026-08-06T02:00:00.000Z')
  assert.equal(change.newEstimatedLatestShipAt, '2026-08-10T02:00:00.000Z')
})
test('案例11：出貨使用後端時間', () => {
  assert.deepEqual(resolveServerTimestamp(null, '2026-08-05T03:00:00.000Z'), { value: '2026-08-05T03:00:00.000Z', changed: true })
})
test('案例12：重複出貨沿用既有時間', () => {
  assert.deepEqual(resolveServerTimestamp('2026-08-05T03:00:00.000Z', '2026-08-06T03:00:00.000Z'), { value: '2026-08-05T03:00:00.000Z', changed: false })
})
test('商品案例：沒有圖片 provider 時仍產生 draft 提示詞且無品牌字樣要求', () => {
  const prompts = buildProductImagePrompts({ id: 'p1', title: '原味生乳捲', dimensionsText: '', ingredientsSummary: '奶霜、蛋糕' })
  assert.equal(prompts.reviewStatus, 'draft')
  assert.match(prompts.images[0].negativePrompt, /no logo/)
  assert.equal(prompts.verifiedProductFacts.dimensions, '')
})

import crypto from 'crypto'

type VercelRequest = any
type VercelResponse = any

type CreateOrderBody = {
  planId?: 'pack1' | 'pack99' | 'pack199'
}

type EcpayCallbackData = Record<string, string>

type EcpayConfig = {
  MERCHANT_ID: string
  HASH_KEY: string
  HASH_IV: string
  RETURN_URL: string
  CLIENT_BACK_URL: string
  IS_TEST_MODE: boolean
}

const ECPAY_AIO_URL = 'https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5'
const SITE_URL = 'https://pomodoro-app-eight-rouge.vercel.app'

// 商品展示頁目前改由管理後台人工開通。
// 未來若要恢復付款成功後自動開通，才在 Vercel 設定 RXV_AUTO_GRANT_STOREFRONT=true。
const STORE_FRONT_AUTO_GRANT = process.env.RXV_AUTO_GRANT_STOREFRONT === 'true'

function getEcpayConfig(): EcpayConfig {
  // 正式付款固定使用正式綠界帳號與正式回呼網址。
  // 不讀取 ECPAY_TEST_MODE，也不使用 payment-stage 測試站。
  const config = {
    MERCHANT_ID: process.env.VITE_ECPAY_MERCHANT_ID || process.env.ECPAY_MERCHANT_ID || '',
    HASH_KEY: process.env.VITE_ECPAY_HASH_KEY || process.env.ECPAY_HASH_KEY || '',
    HASH_IV: process.env.VITE_ECPAY_HASH_IV || process.env.ECPAY_HASH_IV || '',
    RETURN_URL:
      process.env.VITE_ECPAY_RETURN_URL ||
      process.env.ECPAY_RETURN_URL ||
      `${SITE_URL}/api/ecpay?event=webhook`,
    CLIENT_BACK_URL:
      process.env.VITE_ECPAY_CLIENT_BACK_URL ||
      process.env.ECPAY_CLIENT_BACK_URL ||
      `${SITE_URL}/pricing/success`,
    IS_TEST_MODE: false,
  }

  const missing = Object.entries(config)
    .filter(([key, value]) => key !== 'IS_TEST_MODE' && !value)
    .map(([key]) => key)

  if (missing.length > 0) {
    throw new Error(`ECPay env missing: ${missing.join(', ')}`)
  }

  return config
}

function ecpayEncode(value: string): string {
  return encodeURIComponent(value)
    .toLowerCase()
    .replace(/%20/g, '+')
    .replace(/%2d/g, '-')
    .replace(/%5f/g, '_')
    .replace(/%2e/g, '.')
    .replace(/%21/g, '!')
    .replace(/%2a/g, '*')
    .replace(/%28/g, '(')
    .replace(/%29/g, ')')
}

function buildCheckMacValue(params: Record<string, string>, hashKey: string, hashIV: string): string {
  const keys = Object.keys(params)
    .filter((key) => key !== 'CheckMacValue')
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))

  const raw = `HashKey=${hashKey}&${keys.map((key) => `${key}=${params[key]}`).join('&')}&HashIV=${hashIV}`
  const encoded = ecpayEncode(raw)

  return crypto.createHash('sha256').update(encoded).digest('hex').toUpperCase()
}

function getBaseUrl(req: VercelRequest) {
  const host = req.headers?.['x-forwarded-host'] || req.headers?.host
  const proto = req.headers?.['x-forwarded-proto'] || 'https'
  if (host) return `${proto}://${host}`
  return SITE_URL
}

function createMerchantTradeNo() {
  const now = new Date()
  const yyyy = now.getFullYear().toString().slice(2)
  const MM = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const ss = String(now.getSeconds()).padStart(2, '0')
  const rand = Math.random().toString(36).replace(/[^a-z0-9]/gi, '').slice(0, 6).toUpperCase()
  return `RXV${yyyy}${MM}${dd}${hh}${mm}${ss}${rand}`.slice(0, 20)
}

function formatTaipeiDateTime(date = new Date()) {
  const taipei = new Date(date.getTime() + 8 * 60 * 60 * 1000)
  const yyyy = taipei.getUTCFullYear()
  const MM = String(taipei.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(taipei.getUTCDate()).padStart(2, '0')
  const hh = String(taipei.getUTCHours()).padStart(2, '0')
  const mm = String(taipei.getUTCMinutes()).padStart(2, '0')
  const ss = String(taipei.getUTCSeconds()).padStart(2, '0')
  return `${yyyy}/${MM}/${dd} ${hh}:${mm}:${ss}`
}

function readBody(req: VercelRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk: any) => {
      raw += chunk
    })
    req.on('end', () => resolve(raw))
    req.on('error', reject)
  })
}

async function parseCallbackBody(req: VercelRequest): Promise<EcpayCallbackData> {
  if (req.body && typeof req.body === 'object') {
    return Object.fromEntries(
      Object.entries(req.body).map(([key, value]) => [
        key,
        Array.isArray(value) ? String(value[0] ?? '') : String(value ?? ''),
      ])
    )
  }

  if (typeof req.body === 'string') {
    return Object.fromEntries(new URLSearchParams(req.body)) as EcpayCallbackData
  }

  const raw = await readBody(req)
  return Object.fromEntries(new URLSearchParams(raw)) as EcpayCallbackData
}

async function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

  if (!url || !key) {
    throw new Error('Supabase env missing: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
  }

  const { createClient } = await import('@supabase/supabase-js')

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

async function getSessionUserId(req: VercelRequest, supabase: any): Promise<string> {
  const authorization = String(req.headers?.authorization || '').trim()
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() || ''
  if (!token) return ''
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const { data, error } = await supabase
    .from('user_sessions')
    .select('user_id')
    .eq('token_hash', tokenHash)
    .is('revoked_at', null)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()
  if (error) return ''
  return String(data?.user_id || '').trim()
}

async function createOrder(req: VercelRequest, res: VercelResponse) {
  const { planId } = (req.body || {}) as CreateOrderBody
  const allowedPlans = new Map<CreateOrderBody['planId'], { amount: number; points: number }>([
    ['pack1', { amount: 10, points: 10 }],
    ['pack99', { amount: 99, points: 100000 }],
    ['pack199', { amount: 199, points: 300000 }],
  ])
  const selectedPlan = allowedPlans.get(planId)
  if (!selectedPlan) {
    return res.status(400).json({ success: false, error: '付款方案錯誤' })
  }
  const tradeAmt = selectedPlan.amount
  const creditPoints = selectedPlan.points
  const supabase = await getSupabaseAdmin()
  const safeUserId = await getSessionUserId(req, supabase)

  if (!safeUserId) {
    return res.status(401).json({ success: false, error: '請先登入' })
  }

  const config = getEcpayConfig()
  const merchantTradeNo = createMerchantTradeNo()
  const baseUrl = getBaseUrl(req)

  const returnUrl = config.RETURN_URL || `${baseUrl}/api/ecpay?event=webhook`
  const clientBackUrl =
    config.CLIENT_BACK_URL || `${baseUrl}/pricing/success?MerchantTradeNo=${merchantTradeNo}&TradeAmt=${tradeAmt}`

  const formData: Record<string, string> = {
    MerchantID: config.MERCHANT_ID,
    MerchantTradeNo: merchantTradeNo,
    MerchantTradeDate: formatTaipeiDateTime(),
    PaymentType: 'aio',
    TotalAmount: String(tradeAmt),
    TradeDesc: 'RxV AI points',
    ItemName: `RxV AI Points ${creditPoints}`,
    ReturnURL: returnUrl,
    ChoosePayment: 'Credit',
    ClientBackURL: clientBackUrl,
    EncryptType: '1',
    CustomField1: safeUserId,
    CustomField2: String(creditPoints),
    CustomField3: String(tradeAmt),
  }

  formData.CheckMacValue = buildCheckMacValue(formData, config.HASH_KEY, config.HASH_IV)

  try {
    const { error: purchaseLogError } = await supabase.from('purchase_logs').insert({
      user_id: safeUserId,
      order_no: merchantTradeNo,
      amount: tradeAmt,
      points: creditPoints,
      bonus_points: 0,
      status: 'pending',
      created_at: new Date().toISOString(),
    })

    if (purchaseLogError) {
      console.error('[ECPay] create pending purchase log failed:', purchaseLogError)
      return res.status(500).json({
        success: false,
        error: '付款訂單建立失敗，請稍後再試。',
        detail: purchaseLogError.message,
      })
    }
  } catch (err: any) {
    console.error('[ECPay] create pending purchase log failed:', err)
    return res.status(500).json({
      success: false,
      error: '付款訂單建立失敗，請稍後再試。',
      detail: err?.message || 'CREATE_PURCHASE_LOG_FAILED',
    })
  }

  return res.status(200).json({
    success: true,
    apiUrl: ECPAY_AIO_URL,
    formData,
  })
}

type ProductShowcaseGrantPlan = {
  planCode: 'product_showcase_basic' | 'product_showcase_standard'
  maxItems: number
  grantedMonths: number
}

type StorefrontRecord = {
  id: string
  page_mode: string
  expires_at: string | null
}

function getProductShowcaseGrantPlan(amount: number): ProductShowcaseGrantPlan | null {
  if (amount === 99) {
    return {
      planCode: 'product_showcase_basic',
      maxItems: 3,
      grantedMonths: 3,
    }
  }

  if (amount === 199) {
    return {
      planCode: 'product_showcase_standard',
      maxItems: 9,
      grantedMonths: 6,
    }
  }

  return null
}

function parseValidDate(value: string | null | undefined): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function addCalendarMonthsClamped(baseDate: Date, months: number): Date {
  const result = new Date(baseDate.getTime())
  const originalDay = result.getUTCDate()

  result.setUTCDate(1)
  result.setUTCMonth(result.getUTCMonth() + months)

  const lastDayOfTargetMonth = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
  ).getUTCDate()

  result.setUTCDate(Math.min(originalDay, lastDayOfTargetMonth))
  return result
}

function buildStorefrontSlugBase(orderNo: string): string {
  const normalizedOrderNo = String(orderNo || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const suffix = (normalizedOrderNo || 'order').slice(-14)
  return `shop-${suffix}`
}

async function findExistingProductStorefront(supabase: any, userId: string): Promise<StorefrontRecord | null> {
  const { data, error } = await supabase
    .from('storefronts')
    .select('id, page_mode, expires_at')
    .eq('owner_user_id', userId)
    .in('page_mode', ['product_showcase', 'brand_storefront'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data || null
}

async function createDraftProductStorefront(
  supabase: any,
  userId: string,
  orderNo: string,
): Promise<StorefrontRecord> {
  const existing = await findExistingProductStorefront(supabase, userId)
  if (existing) return existing

  const slugBase = buildStorefrontSlugBase(orderNo)

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const slug = attempt === 0 ? slugBase : `${slugBase}-${attempt + 1}`

    const { data, error } = await supabase
      .from('storefronts')
      .insert({
        owner_user_id: userId,
        slug,
        page_mode: 'product_showcase',
        display_name: '尚未設定店名',
        status: 'draft',
        is_public: false,
      })
      .select('id, page_mode, expires_at')
      .single()

    if (!error && data) return data

    if (error?.code === '23505') {
      // 同一付款 webhook 可能同時重送：優先取另一個請求剛建立的店家頁，避免建立第二頁。
      const concurrentStorefront = await findExistingProductStorefront(supabase, userId)
      if (concurrentStorefront) return concurrentStorefront
      continue
    }

    throw error || new Error('CREATE_STOREFRONT_FAILED')
  }

  throw new Error('CREATE_STOREFRONT_SLUG_FAILED')
}

async function ensureStorefrontExpiresAtLeast(
  supabase: any,
  storefrontId: string,
  targetExpiresAt: string | null | undefined,
) {
  const targetDate = parseValidDate(targetExpiresAt)
  if (!targetDate) return

  const { data: storefront, error: readError } = await supabase
    .from('storefronts')
    .select('expires_at')
    .eq('id', storefrontId)
    .maybeSingle()

  if (readError) throw readError
  if (!storefront) throw new Error('STOREFRONT_NOT_FOUND')

  const currentDate = parseValidDate(storefront.expires_at)
  if (currentDate && currentDate.getTime() >= targetDate.getTime()) return

  const { error: updateError } = await supabase
    .from('storefronts')
    .update({ expires_at: targetDate.toISOString() })
    .eq('id', storefrontId)

  if (updateError) throw updateError
}

async function grantProductShowcaseForPaidOrder(params: {
  supabase: any
  userId: string
  orderNo: string
  amount: number
}) {
  const plan = getProductShowcaseGrantPlan(params.amount)
  if (!plan) return { granted: false, reason: 'amount_not_eligible' as const }

  const { data: existingGrant, error: existingGrantError } = await params.supabase
    .from('storefront_entitlements')
    .select('id, storefront_id, expires_at')
    .eq('grant_source', 'product_image_package')
    .eq('source_reference', params.orderNo)
    .maybeSingle()

  if (existingGrantError) throw existingGrantError

  if (existingGrant) {
    // 若上次已寫入權限但還沒來得及更新 storefronts.expires_at，重送 webhook 時補齊。
    await ensureStorefrontExpiresAtLeast(
      params.supabase,
      existingGrant.storefront_id,
      existingGrant.expires_at,
    )

    return {
      granted: false,
      reason: 'already_granted' as const,
      storefrontId: existingGrant.storefront_id,
    }
  }

  const storefront = await createDraftProductStorefront(params.supabase, params.userId, params.orderNo)

  const { data: activeEntitlements, error: activeEntitlementsError } = await params.supabase
    .from('storefront_entitlements')
    .select('plan_code, max_items')
    .eq('storefront_id', storefront.id)
    .eq('status', 'active')

  if (activeEntitlementsError) throw activeEntitlementsError

  const existingMaxItems = (activeEntitlements || []).reduce(
    (highest: number, item: { max_items?: number | null }) => Math.max(highest, Number(item.max_items || 0) || 0),
    0,
  )

  const effectiveMaxItems = Math.max(existingMaxItems, plan.maxItems)
  const effectivePlanCode = effectiveMaxItems >= 9
    ? 'product_showcase_standard'
    : 'product_showcase_basic'

  const now = new Date()
  const previousExpiresAt = parseValidDate(storefront.expires_at)
  const startsAt = previousExpiresAt && previousExpiresAt.getTime() > now.getTime()
    ? previousExpiresAt
    : now
  const expiresAt = addCalendarMonthsClamped(startsAt, plan.grantedMonths)

  const { error: insertGrantError } = await params.supabase
    .from('storefront_entitlements')
    .insert({
      owner_user_id: params.userId,
      storefront_id: storefront.id,
      grant_source: 'product_image_package',
      plan_code: effectivePlanCode,
      max_items: effectiveMaxItems,
      source_reference: params.orderNo,
      granted_months: plan.grantedMonths,
      previous_expires_at: storefront.expires_at || null,
      starts_at: startsAt.toISOString(),
      expires_at: expiresAt.toISOString(),
      status: 'active',
      metadata: {
        trigger: 'ecpay_webhook',
        purchase_amount: params.amount,
        purchased_plan_code: plan.planCode,
        purchased_max_items: plan.maxItems,
      },
    })

  if (insertGrantError?.code === '23505') {
    // 搭配 uq_storefront_entitlements_grant_source_reference：webhook 同時重送時只送一次。
    const { data: concurrentGrant, error: concurrentGrantError } = await params.supabase
      .from('storefront_entitlements')
      .select('id, storefront_id, expires_at')
      .eq('grant_source', 'product_image_package')
      .eq('source_reference', params.orderNo)
      .maybeSingle()

    if (concurrentGrantError) throw concurrentGrantError
    if (concurrentGrant) {
      await ensureStorefrontExpiresAtLeast(
        params.supabase,
        concurrentGrant.storefront_id,
        concurrentGrant.expires_at,
      )
      return {
        granted: false,
        reason: 'already_granted' as const,
        storefrontId: concurrentGrant.storefront_id,
      }
    }
  }

  if (insertGrantError) throw insertGrantError

  await ensureStorefrontExpiresAtLeast(params.supabase, storefront.id, expiresAt.toISOString())

  return {
    granted: true,
    storefrontId: storefront.id,
    expiresAt: expiresAt.toISOString(),
    maxItems: effectiveMaxItems,
  }
}

async function handleWebhook(req: VercelRequest, res: VercelResponse) {
  const config = getEcpayConfig()
  const data = await parseCallbackBody(req)

  const receivedCheckMacValue = String(data.CheckMacValue || '')
  const calculatedCheckMacValue = buildCheckMacValue(data, config.HASH_KEY, config.HASH_IV)

  if (receivedCheckMacValue !== calculatedCheckMacValue) {
    console.error('[ECPay] CheckMacValue invalid:', {
      receivedCheckMacValue,
      calculatedCheckMacValue,
      orderNo: data.MerchantTradeNo,
    })
    return res.status(200).send('0|CheckMacValue invalid')
  }

  const rtnCode = String(data.RtnCode || '')
  const orderNo = String(data.MerchantTradeNo || '')
  const userId = String(data.CustomField1 || '').trim()
  const amount = Number(data.TradeAmt || data.CustomField3 || 0)

  if (!orderNo || !userId) {
    console.error('[ECPay] webhook missing required fields:', data)
    return res.status(200).send('0|Missing required fields')
  }

  const supabase = await getSupabaseAdmin()

  const { data: order, error: orderReadError } = await supabase
    .from('purchase_logs')
    .select('status, amount, points')
    .eq('order_no', orderNo)
    .eq('user_id', userId)
    .maybeSingle()

  if (orderReadError) {
    console.error('[ECPay] read purchase_logs failed:', orderReadError)
    return res.status(200).send('0|Read order failed')
  }

  if (!order) {
    console.error('[ECPay] purchase log not found:', { orderNo, userId })
    return res.status(200).send('0|Order not found')
  }

  const orderAmount = Number(order.amount || amount || 0)

  if (order.status === 'success' || order.status === 'paid') {
    // 點數已成功入帳時，避免綠界重送 webhook 再次加點。
    // 商品展示頁預設由管理後台人工開通；未來可用環境變數改回自動。
    if (STORE_FRONT_AUTO_GRANT) {
      try {
        await grantProductShowcaseForPaidOrder({
          supabase,
          userId,
          orderNo,
          amount: orderAmount,
        })
      } catch (err) {
        console.error('[ECPay] restore product showcase grant failed:', {
          orderNo,
          userId,
          amount: orderAmount,
          err,
        })
        return res.status(200).send('0|Grant product showcase failed')
      }
    }
    return res.status(200).send('1|OK')
  }

  if (rtnCode === '1') {
    try {
      const { error: completionError } = await supabase.rpc(
        'complete_ecpay_purchase',
        {
          p_order_no: orderNo,
          p_reported_amount: amount,
        },
      )
      if (completionError) throw completionError

      // 目前由管理後台人工開通商品展示頁；保留環境變數作為未來切回自動開通的選項。
      if (STORE_FRONT_AUTO_GRANT) {
        await grantProductShowcaseForPaidOrder({
          supabase,
          userId,
          orderNo,
          amount: orderAmount,
        })
      }

      return res.status(200).send('1|OK')
    } catch (err) {
      console.error('[ECPay] payment completion failed:', {
        orderNo,
        userId,
        amount: orderAmount,
        err,
      })
      return res.status(200).send('0|Payment completion failed')
    }
  }

  await supabase
    .from('purchase_logs')
    .update({
      status: 'failed',
    })
    .eq('order_no', orderNo)
    .eq('user_id', userId)
    .eq('status', 'pending')

  return res.status(200).send('1|OK')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    const event = String(req.query?.event || '')

    // GET 不讀取 ecpayConfig、不連 Supabase，專門用來確認 API 是否部署成功
    if (req.method === 'GET' && !event) {
      return res.status(200).json({
        ok: true,
        service: 'ecpay',
        message: 'ECPay API is ready. Use POST to create order.',
        version: 'stable-v5-purchase-logs-compatible',
      })
    }

    if (event === 'webhook') {
      if (req.method !== 'POST') {
        return res.status(200).send('1|OK')
      }

      return await handleWebhook(req, res)
    }

    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        error: 'Method Not Allowed',
        message: 'Only POST is allowed for creating ECPay orders.',
      })
    }

    return await createOrder(req, res)
  } catch (err: any) {
    console.error('[ECPay] API error:', err)

    return res.status(500).json({
      success: false,
      error: err?.message || 'ECPay server error',
    })
  }
}

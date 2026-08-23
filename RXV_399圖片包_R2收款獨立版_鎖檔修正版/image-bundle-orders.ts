import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const PRODUCT = {
  code: 'image-bundle-full',
  productName: '1584+ 高畫質圖片素材庫完整版',
  amountNtd: 399,
} as const

const ORDER_PREFIX = 'private/image-bundle-orders/orders/'
const PENDING_PREFIX = 'private/image-bundle-orders/pending-email/'
const BUNDLE_META_KEY = 'private/image-bundle-orders/bundle/current.json'
const BUNDLE_OBJECT_PREFIX = 'private/image-bundles/'
const SIGNED_DOWNLOAD_SECONDS = 7 * 24 * 60 * 60

let r2Client: S3Client | null = null

type OrderStatus = 'pending' | 'approved' | 'rejected'

type ImageBundleOrder = {
  id: string
  order_no: string
  product_code: 'image-bundle-full'
  product_name: string
  email: string
  amount_ntd: number
  account_last_five: string
  transfer_date: string
  status: OrderStatus
  note: string | null
  created_at: string
  processed_at: string | null
  review_note: string | null
  download_expires_at: string | null
  download_count: number
  download_limit: number
}

type BundleMeta = {
  id: string
  version: string
  objectKey: string
  fileName: string
  sizeBytes: number
  contentType: string
  status: 'active'
  uploadedAt: string
}

function safeText(value: unknown) {
  return String(value ?? '').trim()
}

function normalizeEmail(value: unknown) {
  return safeText(value).toLowerCase()
}

function loadLocalEnvIfNeeded() {
  const names = [
    'RXV_IMAGE_ADMIN_KEY',
    'R2_ACCOUNT_ID',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_PRIVATE_BUCKET_NAME',
  ]
  if (names.slice(0, 4).every((name) => safeText(process.env[name]))) return

  const candidates = [
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(process.cwd(), '..', '.env.local'),
    process.platform === 'win32' ? String.raw`D:\Pomodoro-app\.env.local` : '',
  ].filter(Boolean)

  const envPath = candidates.find((candidate) => {
    try {
      return fs.existsSync(candidate)
    } catch {
      return false
    }
  })
  if (!envPath) return

  try {
    for (const raw of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const line = raw.trim()
      if (!line || line.startsWith('#')) continue
      const i = line.indexOf('=')
      if (i <= 0) continue
      const key = line.slice(0, i).trim()
      if (!names.includes(key)) continue
      let value = line.slice(i + 1).trim()
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      if (value) process.env[key] = value
    }
  } catch {
    // Production uses Vercel environment variables.
  }
}

function getConfig() {
  loadLocalEnvIfNeeded()
  const cfg = {
    adminKey: safeText(process.env.RXV_IMAGE_ADMIN_KEY),
    accountId: safeText(process.env.R2_ACCOUNT_ID),
    accessKeyId: safeText(process.env.R2_ACCESS_KEY_ID),
    secretAccessKey: safeText(process.env.R2_SECRET_ACCESS_KEY),
    privateBucket: safeText(process.env.R2_PRIVATE_BUCKET_NAME || 'rxv-healing-images-staging'),
  }
  const missing = Object.entries(cfg)
    .filter(([key, value]) => key !== 'privateBucket' && !value)
    .map(([key]) => key)
  if (missing.length) {
    const error: any = new Error(`IMAGE_BUNDLE_R2_ENV_MISSING:${missing.join(',')}`)
    error.statusCode = 503
    throw error
  }
  return cfg
}

function client() {
  if (r2Client) return r2Client
  const cfg = getConfig()
  r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${cfg.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
  })
  return r2Client
}

function json(res: any, status: number, payload: unknown) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(status).json(payload)
  }
  res.statusCode = status
  res.setHeader?.('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

function header(req: any, name: string) {
  const headers = req?.headers || {}
  return safeText(headers[name] || headers[name.toLowerCase()] || headers[name.toUpperCase()])
}

function secureEqual(left: string, right: string) {
  const a = Buffer.from(left, 'utf8')
  const b = Buffer.from(right, 'utf8')
  if (!a.length || a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

function requireAdmin(req: any) {
  const cfg = getConfig()
  const provided = header(req, 'x-rxv-image-admin-key')
  if (!provided) {
    const error: any = new Error('請輸入圖片後台管理金鑰。')
    error.statusCode = 401
    throw error
  }
  if (!secureEqual(provided, cfg.adminKey)) {
    const error: any = new Error('圖片後台管理金鑰不正確。')
    error.statusCode = 403
    throw error
  }
}

function body(req: any) {
  if (req?.body == null) return {}
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body)
    } catch {
      return {}
    }
  }
  return req.body
}

async function bodyToText(value: any) {
  if (!value) return ''
  if (typeof value.transformToString === 'function') return value.transformToString('utf-8')
  const chunks: Buffer[] = []
  for await (const chunk of value) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  return Buffer.concat(chunks).toString('utf8')
}

async function readJson<T>(key: string): Promise<T | null> {
  const cfg = getConfig()
  try {
    const result = await client().send(new GetObjectCommand({ Bucket: cfg.privateBucket, Key: key }))
    const text = await bodyToText(result.Body)
    return text ? (JSON.parse(text) as T) : null
  } catch (error: any) {
    const status = Number(error?.$metadata?.httpStatusCode || 0)
    const name = safeText(error?.name)
    if (status === 404 || name === 'NoSuchKey' || name === 'NotFound') return null
    throw error
  }
}

async function putJson(key: string, value: unknown) {
  const cfg = getConfig()
  await client().send(
    new PutObjectCommand({
      Bucket: cfg.privateBucket,
      Key: key,
      Body: Buffer.from(JSON.stringify(value, null, 2), 'utf8'),
      ContentType: 'application/json; charset=utf-8',
      CacheControl: 'private, no-store',
    }),
  )
}

async function deleteObject(key: string) {
  const cfg = getConfig()
  await client().send(new DeleteObjectCommand({ Bucket: cfg.privateBucket, Key: key }))
}

function orderKey(id: string) {
  return `${ORDER_PREFIX}${id}.json`
}

function pendingKey(email: string) {
  const hash = crypto.createHash('sha256').update(email).digest('hex')
  return `${PENDING_PREFIX}${hash}.json`
}

function orderNo() {
  const date = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date()).replace(/-/g, '')
  return `IMG${date}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
}

function validTransferDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T12:00:00+08:00`)
  if (Number.isNaN(date.getTime())) return false
  const now = Date.now()
  const age = now - date.getTime()
  return age >= -24 * 60 * 60 * 1000 && age <= 32 * 24 * 60 * 60 * 1000
}

async function listOrders() {
  const cfg = getConfig()
  const keys: string[] = []
  let continuationToken: string | undefined
  do {
    const page = await client().send(
      new ListObjectsV2Command({
        Bucket: cfg.privateBucket,
        Prefix: ORDER_PREFIX,
        ContinuationToken: continuationToken,
        MaxKeys: 1000,
      }),
    )
    for (const item of page.Contents || []) {
      const key = safeText(item.Key)
      if (key.endsWith('.json')) keys.push(key)
    }
    continuationToken = page.IsTruncated ? page.NextContinuationToken : undefined
  } while (continuationToken)

  const orders: ImageBundleOrder[] = []
  for (let i = 0; i < keys.length; i += 25) {
    const batch = keys.slice(i, i + 25)
    const rows = await Promise.all(batch.map((key) => readJson<ImageBundleOrder>(key)))
    for (const row of rows) if (row?.id) orders.push(row)
  }
  orders.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
  return orders
}

async function createOrder(req: any, res: any) {
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method Not Allowed' })
  const input = body(req)
  const productCode = safeText(input?.productCode || input?.product_code)
  if (productCode !== PRODUCT.code) return json(res, 400, { ok: false, error: '商品代碼不正確。' })

  const email = normalizeEmail(input?.email)
  if (!/^\S+@\S+\.\S+$/.test(email)) return json(res, 400, { ok: false, error: '請輸入正確的 Email。' })

  const lastFive = safeText(input?.accountLastFive || input?.account_last_five)
  if (!/^\d{5}$/.test(lastFive)) return json(res, 400, { ok: false, error: '請輸入匯出帳號後五碼（5 位數字）。' })

  const transferDate = safeText(input?.transferDate || input?.transfer_date)
  if (!validTransferDate(transferDate)) return json(res, 400, { ok: false, error: '請確認匯款日期是否正確。' })

  const markerKey = pendingKey(email)
  const existingMarker = await readJson<{ orderId?: string; orderNo?: string }>(markerKey)
  if (existingMarker?.orderId) {
    const existingOrder = await readJson<ImageBundleOrder>(orderKey(existingMarker.orderId))
    if (existingOrder?.status === 'pending') {
      return json(res, 409, {
        ok: false,
        error: `這個 Email 已有待核對的素材庫匯款回報（${existingOrder.order_no || existingMarker.orderNo || '待處理'}），請勿重複送出。`,
      })
    }
    await deleteObject(markerKey).catch(() => undefined)
  }

  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  const order: ImageBundleOrder = {
    id,
    order_no: orderNo(),
    product_code: PRODUCT.code,
    product_name: PRODUCT.productName,
    email,
    amount_ntd: PRODUCT.amountNtd,
    account_last_five: lastFive,
    transfer_date: transferDate,
    status: 'pending',
    note: safeText(input?.note).slice(0, 500) || null,
    created_at: now,
    processed_at: null,
    review_note: null,
    download_expires_at: null,
    download_count: 0,
    download_limit: 0,
  }

  await putJson(orderKey(id), order)
  await putJson(markerKey, { orderId: id, orderNo: order.order_no, createdAt: now })
  return json(res, 200, { ok: true, order: { orderNo: order.order_no, status: order.status } })
}

async function getOrderOrThrow(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    const error: any = new Error('素材庫訂單編號不正確。')
    error.statusCode = 400
    throw error
  }
  const order = await readJson<ImageBundleOrder>(orderKey(id))
  if (!order) {
    const error: any = new Error('找不到素材庫訂單。')
    error.statusCode = 404
    throw error
  }
  return order
}

async function adminList(req: any, res: any) {
  requireAdmin(req)
  const orders = await listOrders()
  return json(res, 200, { ok: true, orders })
}

async function adminApprove(req: any, res: any) {
  requireAdmin(req)
  const input = body(req)
  const order = await getOrderOrThrow(safeText(input?.orderId || input?.order_id))
  if (order.status !== 'pending') return json(res, 409, { ok: false, error: '此訂單目前不是待核對狀態。' })
  order.status = 'approved'
  order.processed_at = new Date().toISOString()
  order.download_expires_at = new Date(Date.now() + SIGNED_DOWNLOAD_SECONDS * 1000).toISOString()
  await putJson(orderKey(order.id), order)
  await deleteObject(pendingKey(order.email)).catch(() => undefined)
  return json(res, 200, { ok: true, order })
}

async function adminReject(req: any, res: any) {
  requireAdmin(req)
  const input = body(req)
  const order = await getOrderOrThrow(safeText(input?.orderId || input?.order_id))
  if (order.status !== 'pending') return json(res, 409, { ok: false, error: '此訂單目前不是待核對狀態。' })
  order.status = 'rejected'
  order.processed_at = new Date().toISOString()
  order.review_note = safeText(input?.reviewNote || input?.review_note).slice(0, 500) || null
  await putJson(orderKey(order.id), order)
  await deleteObject(pendingKey(order.email)).catch(() => undefined)
  return json(res, 200, { ok: true, order })
}

async function currentBundle() {
  return readJson<BundleMeta>(BUNDLE_META_KEY)
}

async function adminSummary(req: any, res: any) {
  requireAdmin(req)
  const [orders, bundleFile] = await Promise.all([listOrders(), currentBundle()])
  const pendingPaymentCount = orders.filter((order) => order.status === 'pending').length
  const approvedCount = orders.filter((order) => order.status === 'approved').length
  return json(res, 200, {
    ok: true,
    bundleFile,
    pendingPaymentCount,
    pendingDeliveryCount: bundleFile ? 0 : approvedCount,
    approvedCount,
  })
}

function safeZipFileName(value: unknown) {
  const raw = safeText(value || 'rxv-image-bundle.zip')
  const cleaned = raw.replace(/[\\/:*?"<>|\u0000-\u001F]/g, '_').slice(0, 120)
  return cleaned.toLowerCase().endsWith('.zip') ? cleaned : `${cleaned}.zip`
}

async function adminPrepareBundleUpload(req: any, res: any) {
  requireAdmin(req)
  const input = body(req)
  const fileName = safeZipFileName(input?.fileName || input?.file_name)
  const date = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date()).replace(/-/g, '')
  const objectKey = `${BUNDLE_OBJECT_PREFIX}image-bundle-full-v${date}-${crypto.randomBytes(8).toString('hex')}.zip`
  const cfg = getConfig()
  const uploadUrl = await getSignedUrl(
    client(),
    new PutObjectCommand({ Bucket: cfg.privateBucket, Key: objectKey, ContentType: 'application/zip' }),
    { expiresIn: 15 * 60 },
  )
  return json(res, 200, { ok: true, objectKey, fileName, uploadUrl })
}

async function adminCompleteBundleUpload(req: any, res: any) {
  requireAdmin(req)
  const input = body(req)
  const objectKey = safeText(input?.objectKey || input?.object_key)
  if (!objectKey.startsWith(BUNDLE_OBJECT_PREFIX) || !objectKey.endsWith('.zip')) {
    return json(res, 400, { ok: false, error: 'ZIP 物件路徑不正確。' })
  }
  const cfg = getConfig()
  const head = await client().send(new HeadObjectCommand({ Bucket: cfg.privateBucket, Key: objectKey }))
  const uploadedAt = new Date().toISOString()
  const meta: BundleMeta = {
    id: crypto.randomUUID(),
    version: path.basename(objectKey, '.zip'),
    objectKey,
    fileName: safeZipFileName(input?.fileName || input?.file_name),
    sizeBytes: Number(head.ContentLength || 0),
    contentType: safeText(head.ContentType || 'application/zip'),
    status: 'active',
    uploadedAt,
  }
  await putJson(BUNDLE_META_KEY, meta)
  return json(res, 200, { ok: true, bundleFile: meta })
}

async function adminDeleteBundle(req: any, res: any) {
  requireAdmin(req)
  const meta = await currentBundle()
  if (meta?.objectKey) await deleteObject(meta.objectKey).catch(() => undefined)
  await deleteObject(BUNDLE_META_KEY).catch(() => undefined)
  return json(res, 200, { ok: true })
}

async function adminDownloadLink(req: any, res: any) {
  requireAdmin(req)
  const input = body(req)
  const order = await getOrderOrThrow(safeText(input?.orderId || input?.order_id))
  if (order.status !== 'approved') return json(res, 409, { ok: false, error: '此訂單尚未核准收款。' })
  const meta = await currentBundle()
  if (!meta?.objectKey) return json(res, 409, { ok: false, error: '尚未上傳圖片素材庫 ZIP。' })
  const cfg = getConfig()
  const downloadUrl = await getSignedUrl(
    client(),
    new GetObjectCommand({
      Bucket: cfg.privateBucket,
      Key: meta.objectKey,
      ResponseContentDisposition: `attachment; filename*=UTF-8''${encodeURIComponent(meta.fileName)}`,
    }),
    { expiresIn: SIGNED_DOWNLOAD_SECONDS },
  )
  order.download_expires_at = new Date(Date.now() + SIGNED_DOWNLOAD_SECONDS * 1000).toISOString()
  await putJson(orderKey(order.id), order)
  return json(res, 200, { ok: true, downloadUrl, expiresAt: order.download_expires_at })
}

async function adminDeleteTestOrder(req: any, res: any) {
  requireAdmin(req)
  const input = body(req)
  const order = await getOrderOrThrow(safeText(input?.orderId || input?.order_id))
  if (!/CODEX DELIVERY E2E TEST/i.test(order.note || '')) {
    return json(res, 400, { ok: false, error: '只允許刪除標記為 CODEX DELIVERY E2E TEST 的測試訂單。' })
  }
  await deleteObject(orderKey(order.id))
  await deleteObject(pendingKey(order.email)).catch(() => undefined)
  return json(res, 200, { ok: true })
}

export default async function handler(req: any, res: any) {
  try {
    const action = safeText(req?.query?.action)
    if (action === 'create') return await createOrder(req, res)
    if (action === 'list') return await adminList(req, res)
    if (action === 'approve') return await adminApprove(req, res)
    if (action === 'reject') return await adminReject(req, res)
    if (action === 'summary') return await adminSummary(req, res)
    if (action === 'prepare-bundle-upload') return await adminPrepareBundleUpload(req, res)
    if (action === 'complete-bundle-upload') return await adminCompleteBundleUpload(req, res)
    if (action === 'delete-bundle') return await adminDeleteBundle(req, res)
    if (action === 'download-link') return await adminDownloadLink(req, res)
    if (action === 'delete-test-order') return await adminDeleteTestOrder(req, res)
    return json(res, 400, { ok: false, error: 'Unsupported image bundle order action' })
  } catch (error: any) {
    const status = Number(error?.statusCode || error?.$metadata?.httpStatusCode || 500)
    return json(res, status >= 400 && status < 600 ? status : 500, {
      ok: false,
      error: safeText(error?.message || '圖片素材庫訂單處理失敗。'),
    })
  }
}

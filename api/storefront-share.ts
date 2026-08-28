// 客戶公開商品頁的分享預覽（LINE／Facebook 等社群抓取 OG 標籤使用）
// 此檔案會由 vercel.json 將 /shop/:slug 改寫到本函式；瀏覽器網址維持 /shop/:slug。

type StorefrontRow = {
  slug: string
  display_name: string
  bio?: string | null
  logo_url?: string | null
  cover_image_url?: string | null
  status?: string | null
  is_public?: boolean | null
  expires_at?: string | null
}

type StorefrontItemRow = {
  title?: string | null
  description?: string | null
  image_url?: string | null
  is_visible?: boolean | null
}

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  ''

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  ''

function safeText(value: unknown) {
  return String(value || '').trim()
}

function escapeHtml(value: unknown) {
  return safeText(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function isValidSlug(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 80
}

function isPublicAndActive(storefront: StorefrontRow | null) {
  if (!storefront || storefront.status !== 'published' || !storefront.is_public) return false
  const expiresAt = new Date(String(storefront.expires_at || '')).getTime()
  return Number.isFinite(expiresAt) && expiresAt > Date.now()
}

function absoluteUrl(value: string, origin: string) {
  const raw = safeText(value)
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw)) return raw
  return `${origin}${raw.startsWith('/') ? '' : '/'}${raw}`
}

function getOrigin(req: any) {
  const forwardedProto = safeText(req?.headers?.['x-forwarded-proto']).split(',')[0]
  const protocol = forwardedProto || 'https'
  const forwardedHost = safeText(req?.headers?.['x-forwarded-host']).split(',')[0]
  const host = forwardedHost || safeText(req?.headers?.host) || 'pomodoro-app-eight-rouge.vercel.app'
  return `${protocol}://${host}`
}

async function supabaseGet(pathname: string) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_ENV_MISSING')
  }

  const response = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${pathname.replace(/^\//, '')}`, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`SUPABASE_READ_FAILED:${response.status}:${detail}`)
  }

  return response.json()
}

async function readStorefront(slug: string) {
  const rows = await supabaseGet(
    `storefronts?select=slug,display_name,bio,logo_url,cover_image_url,status,is_public,expires_at&slug=eq.${encodeURIComponent(slug)}&limit=1`,
  )
  return Array.isArray(rows) && rows[0] ? (rows[0] as StorefrontRow) : null
}

async function readFirstStorefrontItem(slug: string) {
  const storefrontRows = await supabaseGet(
    `storefronts?select=id&slug=eq.${encodeURIComponent(slug)}&limit=1`,
  )
  const storefrontId = Array.isArray(storefrontRows) && storefrontRows[0]?.id
    ? String(storefrontRows[0].id)
    : ''

  if (!storefrontId) return null

  const rows = await supabaseGet(
    `storefront_items?select=title,description,image_url,is_visible&storefront_id=eq.${encodeURIComponent(storefrontId)}&is_visible=eq.true&order=sort_order.asc,created_at.asc&limit=1`,
  )
  return Array.isArray(rows) && rows[0] ? (rows[0] as StorefrontItemRow) : null
}

async function fetchSpaShell(origin: string) {
  const response = await fetch(`${origin}/`, {
    headers: {
      Accept: 'text/html',
      'User-Agent': 'RxV-Storefront-Share-Renderer/1.0',
    },
  })

  if (!response.ok) {
    throw new Error(`SPA_SHELL_FETCH_FAILED:${response.status}`)
  }

  return response.text()
}

function injectShareMeta(html: string, meta: Record<string, string>) {
  const cleaned = html
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\s+(?:name|property)=["'](?:description|og:[^"']+|twitter:[^"']+)["'][^>]*>\s*/gi, '')

  const tags = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:site_name" content="${escapeHtml(meta.siteName)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:locale" content="zh_TW" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:image" content="${escapeHtml(meta.image)}" />`,
    `<meta property="og:image:secure_url" content="${escapeHtml(meta.image)}" />`,
    `<meta property="og:url" content="${escapeHtml(meta.url)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(meta.image)}" />`,
  ].join('\n    ')

  return cleaned.replace(/<\/head>/i, `    ${tags}\n  </head>`)
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.setHeader('Allow', 'GET, HEAD')
      return res.status(405).end('Method Not Allowed')
    }

    const slug = safeText(req?.query?.slug).toLowerCase()
    const origin = getOrigin(req)
    const publicUrl = `${origin}/shop/${encodeURIComponent(slug)}`

    if (!isValidSlug(slug)) {
      return res.status(404).end('Not Found')
    }

    const [storefront, firstItem, shell] = await Promise.all([
      readStorefront(slug),
      readFirstStorefrontItem(slug),
      fetchSpaShell(origin),
    ])

    // 未公開、到期或不存在的頁面仍回傳 SPA 外殼，讓前端顯示既有的「無法查看」訊息；
    // 不輸出客戶資料，避免預覽工具抓到未公開內容。
    if (!isPublicAndActive(storefront)) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.setHeader('Cache-Control', 'no-store, max-age=0')
      return res.status(200).send(shell)
    }

    const title = `${storefront.display_name}｜${firstItem ? '商品展示頁' : '數位名片'}`
    const description = safeText(
      storefront.bio ||
      firstItem?.description ||
      (firstItem
        ? `歡迎查看 ${storefront.display_name} 的商品與聯絡方式。`
        : `歡迎查看 ${storefront.display_name} 的聯絡方式與服務介紹。`),
    ).replace(/\s+/g, ' ').slice(0, 180)

    // 分享預覽圖順序：客戶 Logo → 客戶封面圖 → 第一張商品圖 → RxV 預設圖。
    // 客戶透過 LINE 分享時，優先辨識店家自己的 Logo，不使用 RxV 的封面視覺。
    const image = absoluteUrl(
      safeText(storefront.logo_url || storefront.cover_image_url || firstItem?.image_url || '/icon.png'),
      origin,
    )

    const output = injectShareMeta(shell, {
      title,
      description,
      image,
      url: publicUrl,
      siteName: storefront.display_name,
    })

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    // 店家更新資料後，社群平台可重新抓取；平台端自己的快取時間仍由 LINE／Facebook 決定。
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=600')
    return res.status(200).send(output)
  } catch (error: any) {
    console.error('STOREFRONT_SHARE_META_FAILED', error)
    return res.status(500).send('Unable to load storefront page')
  }
}

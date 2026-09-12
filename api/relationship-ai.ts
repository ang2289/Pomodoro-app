import crypto from 'crypto'

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  ''
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || ''

const ALL_MODES = new Set(['love', 'work', 'social', 'business'])
const MAX_MESSAGE_LENGTH = 1500

type RelationshipPlan = 'relationship_pro' | 'relationship_business'

type SessionUser = {
  userId: string
  email: string
}

type AccessState = {
  authenticated: true
  plan: RelationshipPlan | null
  status: 'free' | 'active' | 'expired'
  expiresAt: string | null
  usageLimit: number
  usageUsed: number
  usageRemaining: number
  usagePeriodStart: string | null
  usagePeriodEnd: string | null
  canUseBusiness: boolean
}

function accessPayload(access: AccessState) {
  return {
    access,
    plan: access.plan,
    subscription_status: access.status,
    expires_at: access.expiresAt,
    usage_limit: access.usageLimit,
    usage_used: access.usageUsed,
    usage_remaining: access.usageRemaining,
    usage_period_start: access.usagePeriodStart,
    usage_period_end: access.usagePeriodEnd,
  }
}

function json(res: any, status: number, body: any) {
  return res.status(status).json(body)
}

function safeText(value: unknown) {
  return String(value ?? '').trim()
}

function getBearerToken(req: any) {
  const authorization = safeText(req?.headers?.authorization)
  const match = authorization.match(/^Bearer\s+(.+)$/i)
  return match?.[1]?.trim() || ''
}

function hashSessionToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

async function supabaseRest(pathname: string, init: RequestInit = {}) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_ENV_MISSING')
  }

  return fetch(`${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${pathname.replace(/^\//, '')}`, {
    ...init,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(init.headers || {}),
    },
  })
}

async function readRows(response: Response, label: string) {
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`${label}:${response.status}:${text}`)
  }
  const payload = await response.json().catch(() => [])
  return Array.isArray(payload) ? payload : []
}

async function callRpc(name: string, payload: Record<string, unknown>) {
  const response = await supabaseRest(`rpc/${name}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`${name.toUpperCase()}_FAILED:${response.status}:${text}`)
  }
  return response.json().catch(() => ({}))
}

async function requireSessionUser(req: any): Promise<SessionUser> {
  const token = getBearerToken(req)
  if (!token) {
    const error: any = new Error('請先登入後再使用 AI 回覆軍師。')
    error.statusCode = 401
    throw error
  }

  const now = encodeURIComponent(new Date().toISOString())
  const sessions = await readRows(
    await supabaseRest(
      `user_sessions?select=user_id,expires_at&token_hash=eq.${hashSessionToken(token)}&revoked_at=is.null&expires_at=gt.${now}&limit=1`,
      { method: 'GET' },
    ),
    'SESSION_READ_FAILED',
  )
  const userId = safeText(sessions[0]?.user_id)
  if (!userId) {
    const error: any = new Error('登入狀態已失效，請重新登入。')
    error.statusCode = 401
    throw error
  }

  const users = await readRows(
    await supabaseRest(`users?select=id,email&id=eq.${encodeURIComponent(userId)}&limit=1`, { method: 'GET' }),
    'USER_READ_FAILED',
  )
  const email = safeText(users[0]?.email).toLowerCase()
  if (!users[0]?.id || !email) {
    const error: any = new Error('找不到有效會員，請重新登入。')
    error.statusCode = 401
    throw error
  }

  return { userId, email }
}

function normalizeAccess(payload: any): AccessState {
  const plan = payload?.plan === 'relationship_pro' || payload?.plan === 'relationship_business'
    ? payload.plan as RelationshipPlan
    : null
  const status = payload?.subscription_status === 'active' || payload?.subscription_status === 'expired'
    ? payload.subscription_status
    : 'free'

  return {
    authenticated: true,
    plan,
    status,
    expiresAt: safeText(payload?.expires_at) || null,
    usageLimit: Math.max(0, Number(payload?.usage_limit || (plan ? 0 : 5))),
    usageUsed: Math.max(0, Number(payload?.usage_used || 0)),
    usageRemaining: Math.max(0, Number(payload?.usage_remaining || 0)),
    usagePeriodStart: safeText(payload?.usage_period_start) || null,
    usagePeriodEnd: safeText(payload?.usage_period_end) || null,
    canUseBusiness: payload?.can_use_business === true || plan === 'relationship_business',
  }
}

async function getRelationshipAccess(userId: string) {
  return normalizeAccess(await callRpc('get_relationship_access', { p_user_id: userId }))
}

async function callProtectedRelationshipFunction(body: any) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('SUPABASE_ENV_MISSING')
  const response = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/functions/v1/relationship-ai`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error: any = new Error(safeText(payload?.error) || 'AI 軍師暫時沒有回應，請稍後再試。')
    error.statusCode = response.status >= 500 ? 502 : response.status
    throw error
  }
  if (!payload?.analysis?.nextStep || !Array.isArray(payload?.replies) || payload.replies.length !== 3) {
    const error: any = new Error('AI 回傳內容不完整，請稍後再試。')
    error.statusCode = 502
    throw error
  }
  return payload
}

function quotaMessage(plan: RelationshipPlan | null, limit: number) {
  if (plan === 'relationship_business') return `本期 ${limit || 1000} 次額度已用完。`
  if (plan === 'relationship_pro') return `本期 ${limit || 300} 次額度已用完。`
  return '免費試用 5 次已用完，請升級方案後繼續使用。'
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return json(res, 405, { ok: false, error: 'Method Not Allowed' })
  }

  let reservation: { userId: string; requestId: string } | null = null

  try {
    const user = await requireSessionUser(req)
    const access = await getRelationshipAccess(user.userId)

    if (req.method === 'GET') {
      return json(res, 200, { ok: true, ...accessPayload(access) })
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
    const mode = safeText(body.mode)
    const message = safeText(body.message)
    if (!ALL_MODES.has(mode)) {
      return json(res, 400, { ok: false, error: '軍師模式不正確。' })
    }
    if (!message) {
      return json(res, 400, { ok: false, error: '請輸入對方說了什麼。' })
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return json(res, 400, {
        ok: false,
        code: 'MESSAGE_TOO_LONG',
        error: `訊息最多 ${MAX_MESSAGE_LENGTH} 個字元。`,
      })
    }

    const requestId = crypto.randomUUID()
    const reserved = await callRpc('reserve_relationship_use', {
      p_user_id: user.userId,
      p_request_id: requestId,
      p_mode: mode,
    })

    if (!reserved?.allowed) {
      if (reserved?.reason === 'rate_limited') {
        return json(res, 429, {
          ok: false,
          code: 'RATE_LIMITED',
          error: '操作太快了，請稍等幾秒再試。',
          retry_after_seconds: Number(reserved?.retry_after_seconds || 10),
          ...accessPayload(access),
        })
      }
      if (reserved?.reason === 'business_plan_required') {
        return json(res, 403, {
          ok: false,
          code: 'BUSINESS_PLAN_REQUIRED',
          error: '業務軍師需升級為 Business Pro 才能使用。',
          ...accessPayload(access),
        })
      }
      if (reserved?.reason === 'limit_reached') {
        return json(res, 403, {
          ok: false,
          code: 'USAGE_LIMIT_REACHED',
          error: quotaMessage(access.plan, Number(reserved?.usage_limit || access.usageLimit)),
          ...accessPayload({ ...access, usageRemaining: 0 }),
        })
      }
      return json(res, 403, { ok: false, error: '目前無法使用 AI 軍師。', ...accessPayload(access) })
    }

    reservation = { userId: user.userId, requestId }
    const result = await callProtectedRelationshipFunction({ ...body, message })

    const completed = await callRpc('complete_relationship_use', {
      p_user_id: reservation.userId,
      p_request_id: reservation.requestId,
    })
    if (!completed?.completed) {
      throw new Error('RELATIONSHIP_USAGE_CONFIRM_FAILED')
    }
    reservation = null

    const updatedAccess = normalizeAccess(completed)
    return json(res, 200, { ...result, ...accessPayload(updatedAccess) })
  } catch (error: any) {
    if (reservation) {
      await callRpc('release_relationship_use', {
        p_user_id: reservation.userId,
        p_request_id: reservation.requestId,
      }).catch(() => undefined)
    }
    const status = Number(error?.statusCode || 500)
    console.error('[relationship-ai] protected request failed', error?.message || error)
    return json(res, status, {
      ok: false,
      error: status >= 500 ? 'AI 軍師暫時沒有回應，請稍後再試。' : error?.message,
    })
  }
}

import { useEffect, useState, type FormEvent } from 'react'
import { Check, Clock3, Copy, Home, Loader2, MessageCircleHeart, Sparkles, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import './relationship-ai.css'

const MODE_OPTIONS = [
  { value: 'love', label: '❤️ 戀愛軍師' },
  { value: 'business', label: '💼 業務軍師' },
  { value: 'work', label: '👔 職場軍師' },
  { value: 'social', label: '💬 人際軍師' },
] as const

const ALL_REPLY_STYLES = [
  { value: '自然', label: '自然' },
  { value: '幽默', label: '幽默' },
  { value: '曖昧', label: '曖昧' },
  { value: '高情商', label: '高情商' },
  { value: '專業', label: '專業' },
  { value: '直接', label: '直接' },
  { value: '冷淡', label: '冷淡' },
  { value: '高情商反擊', label: '高情商反擊' },
  { value: 'polite_decline', label: '婉拒' },
] as const

const MODE_CONFIG = {
  love: {
    goals: ['延續聊天', '增加好感', '約出去', '告白', '和好', '判斷怎麼接'],
    relationships: ['剛認識', '曖昧', '約會對象', '情侶', '前任'],
    styles: ['自然', '幽默', '曖昧', '高情商', '直接', '冷淡', 'polite_decline'],
    placeholder: '例如：哈哈，有空再約啊',
  },
  business: {
    goals: ['初次回覆', '留住客戶', '追蹤已讀', '價格異議', '促成下一步', '催款'],
    relationships: ['潛在客戶', '新客戶', '舊客戶', '房仲買方', '房仲屋主', '一般客戶'],
    styles: ['自然', '專業', '高情商', '直接', '冷淡', '高情商反擊', 'polite_decline', '幽默'],
    placeholder: '例如：這間太貴了，我再看看。',
  },
  work: {
    goals: ['回主管', '回同事', '婉拒加班', '請假', '談薪', '離職'],
    relationships: ['主管', '同事', '部屬', '跨部門', '職場客戶'],
    styles: ['自然', '專業', '高情商', '直接', '冷淡', '高情商反擊', 'polite_decline'],
    placeholder: '例如：今天這個可以做完再走嗎？',
  },
  social: {
    goals: ['婉拒', '設立界線', '高情商回覆', '反擊', '和解', '社群留言'],
    relationships: ['朋友', '家人', '網友', '陌生人', '社群互動'],
    styles: ['自然', '幽默', '高情商', '直接', '冷淡', '高情商反擊', 'polite_decline'],
    placeholder: '例如：可以先借我一萬元嗎？下個月一定還你。',
  },
} as const

const BUSINESS_INDUSTRIES = [
  '房仲',
  '保險',
  '汽車銷售',
  '電商／網拍',
  '美容／美甲',
  '健身／教練',
  '設計／接案',
  '裝潢／工程',
  '教育／課程',
  'B2B 業務',
  '其他',
] as const

const INTENSITIES = [1, 2, 3, 4, 5] as const
const RELATIONSHIP_HISTORY_KEY = 'relationship-ai-history-v1'
const RELATIONSHIP_HISTORY_LIMIT = 20

type CoachMode = (typeof MODE_OPTIONS)[number]['value']
type ReplyStyle = (typeof ALL_REPLY_STYLES)[number]['value']
type Intensity = (typeof INTENSITIES)[number]

type RelationshipAiResult = {
  analysis: {
    tone: string
    strategy: string
    nextStep: string
  }
  replies: Array<{
    label: string
    text: string
  }>
}

type RelationshipHistoryEntry = {
  id: string
  createdAt: string
  mode: CoachMode
  goal: string
  industry: string
  relationship: string
  replyStyle: ReplyStyle
  intensity: Intensity
  message: string
  analysis: RelationshipAiResult['analysis']
  replies: RelationshipAiResult['replies']
}

type RelationshipAccess = {
  authenticated: true
  plan: 'relationship_pro' | 'relationship_business' | null
  status: 'free' | 'active' | 'expired'
  expiresAt: string | null
  usageLimit: number
  usageUsed: number
  usageRemaining: number
  usagePeriodStart: string | null
  usagePeriodEnd: string | null
  canUseBusiness: boolean
}

function getAuthToken() {
  if (typeof window === 'undefined') return ''
  return (window.localStorage.getItem('auth_token') || window.localStorage.getItem('token') || '').trim()
}

function readRelationshipHistory(): RelationshipHistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const parsed = JSON.parse(window.localStorage.getItem(RELATIONSHIP_HISTORY_KEY) || '[]')
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((entry) => entry && typeof entry.id === 'string' && Array.isArray(entry.replies))
      .slice(0, RELATIONSHIP_HISTORY_LIMIT) as RelationshipHistoryEntry[]
  } catch {
    return []
  }
}

function writeRelationshipHistory(entries: RelationshipHistoryEntry[]) {
  try {
    window.localStorage.setItem(RELATIONSHIP_HISTORY_KEY, JSON.stringify(entries.slice(0, RELATIONSHIP_HISTORY_LIMIT)))
  } catch {
    // Storage may be unavailable in private browsing. AI generation must still succeed.
  }
}

function historyId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function formatHistoryDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('zh-TW', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Taipei',
  }).format(date)
}

class RelationshipApiError extends Error {
  status: number
  code: string
  payload: any

  constructor(message: string, status: number, code = '', payload: any = null) {
    super(message)
    this.name = 'RelationshipApiError'
    this.status = status
    this.code = code
    this.payload = payload
  }
}

async function relationshipApi<T>(method: 'GET' | 'POST', body?: unknown): Promise<T> {
  const token = getAuthToken()
  if (!token) throw new RelationshipApiError('請先登入後再使用 AI 回覆軍師', 401)
  const response = await fetch('/api/relationship-ai', {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new RelationshipApiError(
      String(payload?.error || 'AI 軍師暫時沒有回應，請稍後再試'),
      response.status,
      String(payload?.code || ''),
      payload,
    )
  }
  return payload as T
}

function ChoiceChip({
  name,
  value,
  label = value,
  checked,
  onChange,
}: {
  name: string
  value: string
  label?: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label className={`relationship-ai-chip${checked ? ' is-selected' : ''}`}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  )
}

export default function RelationshipAiPage() {
  const navigate = useNavigate()
  const [message, setMessage] = useState('')
  const [mode, setMode] = useState<CoachMode>('love')
  const [goal, setGoal] = useState<string>(MODE_CONFIG.love.goals[0])
  const [relationship, setRelationship] = useState<string>(MODE_CONFIG.love.relationships[1])
  const [industry, setIndustry] = useState<string>('房仲')
  const [customIndustry, setCustomIndustry] = useState('')
  const [replyStyle, setReplyStyle] = useState<ReplyStyle>('自然')
  const [intensity, setIntensity] = useState<Intensity>(3)
  const [result, setResult] = useState<RelationshipAiResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [access, setAccess] = useState<RelationshipAccess | null>(null)
  const [accessLoading, setAccessLoading] = useState(Boolean(getAuthToken()))
  const [paywallMessage, setPaywallMessage] = useState('')
  const [paywallProduct, setPaywallProduct] = useState<'relationship_pro' | 'relationship_business'>('relationship_pro')
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<RelationshipHistoryEntry[]>(readRelationshipHistory)
  const [copiedHistoryId, setCopiedHistoryId] = useState<string | null>(null)

  useEffect(() => {
    if (!getAuthToken()) return
    let cancelled = false
    relationshipApi<{ access: RelationshipAccess }>('GET')
      .then((payload) => {
        if (!cancelled) setAccess(payload.access)
      })
      .catch(() => {
        if (!cancelled) setAccess(null)
      })
      .finally(() => {
        if (!cancelled) setAccessLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const currentConfig = MODE_CONFIG[mode]
  const availableStyles = ALL_REPLY_STYLES.filter((style) =>
    (currentConfig.styles as readonly string[]).includes(style.value),
  )

  const isBusinessMode = mode === 'business'
  const relationshipStep = isBusinessMode ? 5 : 4
  const styleStep = isBusinessMode ? 6 : 5
  const intensityStep = isBusinessMode ? 7 : 6
  const effectiveIndustry = isBusinessMode
    ? industry === '其他'
      ? customIndustry.trim()
      : industry
    : ''

  function changeMode(nextMode: CoachMode) {
    const nextConfig = MODE_CONFIG[nextMode]
    setMode(nextMode)
    setGoal(nextConfig.goals[0])
    setRelationship(nextConfig.relationships[0])

    if (nextMode !== 'business') {
      setCustomIndustry('')
    }

    const styleStillAvailable = (nextConfig.styles as readonly string[]).includes(replyStyle)
    if (!styleStillAvailable) {
      setReplyStyle(nextConfig.styles[0] as ReplyStyle)
    }

    setResult(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedMessage = message.trim()

    if (!trimmedMessage) {
      toast.error('先貼上對方說的話，軍師才有辦法出招')
      return
    }

    if (isBusinessMode && industry === '其他' && !customIndustry.trim()) {
      toast.error('請輸入你的產業名稱')
      return
    }

    setLoading(true)
    setPaywallMessage('')
    setResult(null)
    setCopiedIndex(null)

    try {
      const payload = await relationshipApi<RelationshipAiResult & { access?: RelationshipAccess; error?: string }>('POST', {
          message: trimmedMessage,
          mode,
          goal,
          relationship,
          industry: effectiveIndustry,
          replyStyle,
          intensity,
      })

      if (
        !payload?.analysis ||
        !payload.analysis.nextStep ||
        !Array.isArray(payload?.replies) ||
        payload.replies.length < 3
      ) {
        console.error('[relationship-ai] Invalid function payload:', payload)
        throw new Error(payload?.error || 'AI 軍師暫時沒有回應，請稍後再試')
      }

      setResult(payload as RelationshipAiResult)
      if (payload.access) setAccess(payload.access)

      const historyEntry: RelationshipHistoryEntry = {
        id: historyId(),
        createdAt: new Date().toISOString(),
        mode,
        goal,
        industry: effectiveIndustry,
        relationship,
        replyStyle,
        intensity,
        message: trimmedMessage,
        analysis: payload.analysis,
        replies: payload.replies.slice(0, 3),
      }
      setHistory((current) => {
        const next = [historyEntry, ...current].slice(0, RELATIONSHIP_HISTORY_LIMIT)
        writeRelationshipHistory(next)
        return next
      })
    } catch (error) {
      if (error instanceof RelationshipApiError && error.status === 401) {
        toast.error('請先登入會員，登入後可使用 5 次免費試用')
        navigate('/login', { state: { from: '/relationship-ai' } })
        return
      }
      if (error instanceof RelationshipApiError && error.code === 'BUSINESS_PLAN_REQUIRED') {
        setPaywallMessage('業務軍師與產業專屬功能需要升級 Business Pro。')
        setPaywallProduct('relationship_business')
      }
      if (error instanceof RelationshipApiError && error.code === 'USAGE_LIMIT_REACHED') {
        if (error.payload?.access) setAccess(error.payload.access)
        setPaywallMessage(error.message)
        setPaywallProduct(error.payload?.access?.plan === 'relationship_business' ? 'relationship_business' : 'relationship_pro')
      }
      const errorMessage = error instanceof Error ? error.message : '連線失敗，請稍後再試'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  async function copyReply(text: string, index: number) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      toast.success('已複製，可以直接貼到 LINE')
      window.setTimeout(() => setCopiedIndex((current) => (current === index ? null : current)), 1800)
    } catch {
      toast.error('複製失敗，請長按文字手動複製')
    }
  }

  async function copyHistoryReply(entry: RelationshipHistoryEntry) {
    const recommendedReply = entry.replies[0]?.text
    if (!recommendedReply) return
    try {
      await navigator.clipboard.writeText(recommendedReply)
      setCopiedHistoryId(entry.id)
      toast.success('已複製推薦回覆')
      window.setTimeout(() => setCopiedHistoryId((current) => (current === entry.id ? null : current)), 1800)
    } catch {
      toast.error('複製失敗，請手動選取文字')
    }
  }

  function deleteHistoryEntry(id: string) {
    setHistory((current) => {
      const next = current.filter((entry) => entry.id !== id)
      writeRelationshipHistory(next)
      return next
    })
    toast.success('已刪除紀錄')
  }

  function clearHistory() {
    if (!history.length || !window.confirm('確定要清除全部 AI 回覆紀錄嗎？')) return
    setHistory([])
    writeRelationshipHistory([])
    toast.success('已清除全部紀錄')
  }

  return (
    <div className="relationship-ai-page">
      <main className="relationship-ai-shell">
        <header className="relationship-ai-header">
          <div className="relationship-ai-logo" aria-hidden="true">
            <MessageCircleHeart size={26} strokeWidth={2.2} />
          </div>
          <div>
            <p className="relationship-ai-eyebrow">戀愛・業務・職場・人際都幫你回</p>
            <h1>AI 回覆軍師</h1>
          </div>
        </header>

        <p className="relationship-ai-intro">
          不知道怎麼回？先選你的情境和目標，AI 幫你想出自然、有效、可以直接傳送的回覆。
        </p>

        {showHistory ? (
          <section className="relationship-ai-history" aria-labelledby="relationship-history-title">
            <div className="relationship-ai-history-header">
              <div>
                <p>最近 20 筆</p>
                <h2 id="relationship-history-title">AI 回覆紀錄</h2>
              </div>
              {history.length ? (
                <button type="button" className="relationship-ai-history-clear" onClick={clearHistory}>
                  <Trash2 size={17} />
                  全部清除
                </button>
              ) : null}
            </div>

            {history.length ? (
              <div className="relationship-ai-history-list">
                {history.map((entry) => {
                  const recommendedReply = entry.replies[0]?.text || ''
                  const modeLabel = MODE_OPTIONS.find((option) => option.value === entry.mode)?.label || entry.mode
                  return (
                    <article className="relationship-ai-history-card" key={entry.id}>
                      <div className="relationship-ai-history-meta">
                        <strong>{modeLabel}</strong>
                        <time dateTime={entry.createdAt}>{formatHistoryDate(entry.createdAt)}</time>
                      </div>
                      <div className="relationship-ai-history-message">
                        <span>對方說</span>
                        <p>{entry.message}</p>
                      </div>
                      <div className="relationship-ai-history-reply">
                        <span>推薦回覆</span>
                        <p>{recommendedReply}</p>
                      </div>
                      <div className="relationship-ai-history-actions">
                        <button type="button" onClick={() => void copyHistoryReply(entry)} disabled={!recommendedReply}>
                          {copiedHistoryId === entry.id ? <Check size={18} /> : <Copy size={18} />}
                          {copiedHistoryId === entry.id ? '已複製' : '複製推薦回覆'}
                        </button>
                        <button type="button" className="is-delete" onClick={() => deleteHistoryEntry(entry.id)}>
                          <Trash2 size={18} />
                          刪除
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="relationship-ai-history-empty">
                <Clock3 size={34} />
                <h3>還沒有回覆紀錄</h3>
                <p>AI 成功產生完整回覆後，會自動保存在這台裝置。</p>
                <button type="button" onClick={() => setShowHistory(false)}>開始使用 AI 幫我回</button>
              </div>
            )}
          </section>
        ) : (
          <>

        <section className="relationship-ai-access" aria-label="AI 回覆軍師方案">
          <div className="relationship-ai-access-status">
            <strong>
              {accessLoading
                ? '正在確認會員方案…'
                : access?.plan === 'relationship_business'
                  ? `Business Pro｜本期剩餘 ${access.usageRemaining} / ${access.usageLimit || 1000} 次`
                  : access?.plan === 'relationship_pro'
                    ? `Pro｜本期剩餘 ${access.usageRemaining} / ${access.usageLimit || 300} 次`
                    : access?.status === 'expired'
                      ? '方案已到期，可續訂 30 天'
                      : getAuthToken()
                        ? `免費試用剩 ${access?.usageRemaining ?? 5} / ${access?.usageLimit ?? 5} 次`
                        : '登入會員可使用 5 次免費試用'}
            </strong>
            {access?.expiresAt && access.status === 'active' ? (
              <span>有效期限：{new Date(access.expiresAt).toLocaleDateString('zh-TW', { timeZone: 'Asia/Taipei' })}</span>
            ) : null}
          </div>
          {paywallMessage ? (
            <div className="relationship-ai-paywall-alert" role="alert">
              <span>{paywallMessage}</span>
              <Link to={`/payment/bank-transfer?product=${paywallProduct}`}>
                {access?.plan ? '續訂方案' : '升級 Pro'}
              </Link>
            </div>
          ) : null}
          <div className="relationship-ai-plan-grid">
            <article>
              <strong>免費會員</strong>
              <span>共 5 次</span>
              <small>戀愛・職場・人際軍師</small>
            </article>
            <article>
              <strong>Pro</strong>
              <span>NT$99／30 天</span>
              <small>每期 300 次・戀愛・職場・人際軍師</small>
              <Link to="/payment/bank-transfer?product=relationship_pro">選擇 Pro</Link>
            </article>
            <article>
              <strong>Business Pro</strong>
              <span>NT$299／30 天</span>
              <small>每期 1000 次・包含 Pro、業務與產業功能</small>
              <Link to="/payment/bank-transfer?product=relationship_business">選擇 Business</Link>
            </article>
          </div>
        </section>

        <form className="relationship-ai-form" onSubmit={handleSubmit}>
          <section className="relationship-ai-section">
            <label className="relationship-ai-label" htmlFor="relationship-message">
              <span className="relationship-ai-step">1</span>
              對方說了什麼？
            </label>
            <textarea
              id="relationship-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={currentConfig.placeholder}
              maxLength={1500}
              rows={5}
              autoComplete="off"
            />
            <span className="relationship-ai-count">{message.length} / 1500</span>
          </section>

          <fieldset className="relationship-ai-section">
            <legend className="relationship-ai-label">
              <span className="relationship-ai-step">2</span>
              你需要哪種軍師？
            </legend>
            <div className="relationship-ai-grid relationship-grid-style">
              {MODE_OPTIONS.map((item) => (
                <ChoiceChip
                  key={item.value}
                  name="coach-mode"
                  value={item.value}
                  label={item.label}
                  checked={mode === item.value}
                  onChange={() => changeMode(item.value)}
                />
              ))}
            </div>
          </fieldset>

          <fieldset className="relationship-ai-section">
            <legend className="relationship-ai-label">
              <span className="relationship-ai-step">3</span>
              這次想達成什麼？
            </legend>
            <div className="relationship-ai-grid relationship-grid-style">
              {currentConfig.goals.map((item) => (
                <ChoiceChip
                  key={item}
                  name="goal"
                  value={item}
                  checked={goal === item}
                  onChange={() => setGoal(item)}
                />
              ))}
            </div>
          </fieldset>

          {isBusinessMode ? (
            <fieldset className="relationship-ai-section">
              <legend className="relationship-ai-label">
                <span className="relationship-ai-step">4</span>
                你的產業
              </legend>
              <div className="relationship-ai-grid relationship-grid-style">
                {BUSINESS_INDUSTRIES.map((item) => (
                  <ChoiceChip
                    key={item}
                    name="industry"
                    value={item}
                    checked={industry === item}
                    onChange={() => {
                      setIndustry(item)
                      if (item !== '其他') setCustomIndustry('')
                    }}
                  />
                ))}
              </div>

              {industry === '其他' ? (
                <div className="relationship-ai-custom-industry">
                  <label htmlFor="custom-industry">請輸入產業名稱</label>
                  <input
                    id="custom-industry"
                    type="text"
                    value={customIndustry}
                    onChange={(event) => setCustomIndustry(event.target.value)}
                    placeholder="例如：婚禮顧問、寵物美容、醫療器材"
                    maxLength={50}
                    autoComplete="off"
                  />
                </div>
              ) : null}
            </fieldset>
          ) : null}

          <fieldset className="relationship-ai-section">
            <legend className="relationship-ai-label">
              <span className="relationship-ai-step">{relationshipStep}</span>
              對方是誰？
            </legend>
            <div className="relationship-ai-grid relationship-grid-three">
              {currentConfig.relationships.map((item) => (
                <ChoiceChip
                  key={item}
                  name="relationship"
                  value={item}
                  checked={relationship === item}
                  onChange={() => setRelationship(item)}
                />
              ))}
            </div>
          </fieldset>

          <fieldset className="relationship-ai-section">
            <legend className="relationship-ai-label">
              <span className="relationship-ai-step">{styleStep}</span>
              想要的回覆風格
            </legend>
            <div className="relationship-ai-grid relationship-grid-style">
              {availableStyles.map((item) => (
                <ChoiceChip
                  key={item.value}
                  name="reply-style"
                  value={item.value}
                  label={item.label}
                  checked={replyStyle === item.value}
                  onChange={() => setReplyStyle(item.value)}
                />
              ))}
            </div>
          </fieldset>

          <fieldset className="relationship-ai-section">
            <legend className="relationship-ai-label">
              <span className="relationship-ai-step">{intensityStep}</span>
              回覆強度
            </legend>
            <div className="relationship-ai-intensity" aria-label="回覆強度 1 到 5">
              {INTENSITIES.map((item) => (
                <label key={item} className={intensity === item ? 'is-selected' : ''}>
                  <input
                    type="radio"
                    name="intensity"
                    value={item}
                    checked={intensity === item}
                    onChange={() => setIntensity(item)}
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
            <div className="relationship-ai-intensity-labels" aria-hidden="true">
              <span>保守一點</span>
              <span>更有態度</span>
            </div>
          </fieldset>

          <button className="relationship-ai-submit" type="submit" disabled={loading}>
            {loading ? <Loader2 className="relationship-ai-spinner" size={22} /> : <Sparkles size={22} />}
            {loading ? '軍師正在想…' : 'AI 幫我回'}
          </button>
        </form>

        <div className="relationship-ai-results" aria-live="polite" aria-busy={loading}>
          {loading ? (
            <div className="relationship-ai-loading-card">
              <span className="relationship-ai-loading-dot" />
              <div>
                <strong>正在讀懂這段話</strong>
                <p>整理語氣、目標和最適合你的下一步…</p>
              </div>
            </div>
          ) : null}

          {result ? (
            <>
              <section className="relationship-ai-analysis">
                <div className="relationship-ai-analysis-title">
                  <Sparkles size={18} />
                  <h2>軍師快速分析</h2>
                </div>
                <dl>
                  <div>
                    <dt>對方語氣</dt>
                    <dd>{result.analysis.tone}</dd>
                  </div>
                  <div>
                    <dt>建議策略</dt>
                    <dd>{result.analysis.strategy}</dd>
                  </div>
                  <div>
                    <dt>下一步</dt>
                    <dd>{result.analysis.nextStep}</dd>
                  </div>
                </dl>
              </section>

              <section className="relationship-ai-reply-list">
                <h2>幫你想了 3 種回法</h2>
                {result.replies.slice(0, 3).map((reply, index) => (
                  <article className={`relationship-ai-reply-card reply-card-${index + 1}`} key={`${reply.label}-${index}`}>
                    <div className="relationship-ai-reply-heading">
                      <span>{reply.label}</span>
                      {index === 0 ? <em>推薦</em> : null}
                    </div>
                    <p>{reply.text}</p>
                    <button type="button" onClick={() => copyReply(reply.text, index)}>
                      {copiedIndex === index ? <Check size={18} /> : <Copy size={18} />}
                      {copiedIndex === index ? '已複製' : '一鍵複製'}
                    </button>
                  </article>
                ))}
              </section>
            </>
          ) : null}
        </div>

        <p className="relationship-ai-note">
          AI 只依文字與你選的目標提供建議，不保證對方反應或成交結果；重要關係與交易仍建議誠實溝通。
        </p>
          </>
        )}
      </main>

      <nav className="relationship-ai-bottom-nav" aria-label="AI 回覆軍師導覽">
        <Link to="/" aria-label="回首頁">
          <Home size={21} />
          <span>首頁</span>
        </Link>
        <button
          className={!showHistory ? 'is-active' : ''}
          type="button"
          aria-current={!showHistory ? 'page' : undefined}
          onClick={() => setShowHistory(false)}
        >
          <MessageCircleHeart size={21} />
          <span>幫我回</span>
        </button>
        <button
          className={showHistory ? 'is-active' : ''}
          type="button"
          aria-current={showHistory ? 'page' : undefined}
          onClick={() => setShowHistory(true)}
        >
          <Clock3 size={21} />
          <span>紀錄</span>
        </button>
      </nav>
    </div>
  )
}

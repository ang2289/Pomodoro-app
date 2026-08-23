import { getCustomSessionToken } from '@/lib/accountApi'

interface CallSummaryParams {
  content: string
  lang: string
}

type SummaryServiceResult = {
  summary?: string
  result?: string
  keywords?: string[]
  traffic_keywords?: string[]
  remaining_chars?: number
  balance?: number
}

/** Session-authenticated summary API wrapper. Never calls Supabase Edge from the browser. */
export async function callSummaryService(params: CallSummaryParams): Promise<SummaryServiceResult> {
  const token = getCustomSessionToken()
  if (!token) throw new Error('AUTH_REQUIRED')

  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 60_000)
  try {
    const response = await fetch('/api/main?action=summary', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: params.content, lang: params.lang }),
      signal: controller.signal,
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(String(data?.error || 'SUMMARY_REQUEST_FAILED'))
    if (!data?.summary && !data?.result) throw new Error('INVALID_SUMMARY_RESPONSE')
    return data
  } finally {
    window.clearTimeout(timeout)
  }
}

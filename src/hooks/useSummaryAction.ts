import { useState } from 'react'
import { getCustomSessionToken } from '@/lib/accountApi'

interface SummaryStateSetters {
  setSummary: (value: { content: string; isPreview?: boolean }) => void
  setKeywords: (value: string[]) => void
  setTrafficKeywords: (value: string[]) => void
  setTrafficKeywordsReady?: (value: boolean) => void
}

type NormalizedSummaryResult = {
  summary: string
  result: string
  keywords: string[]
  traffic_keywords: string[]
  usage_chars?: number
  remaining_chars?: number
  balance?: number
  raw?: unknown
}

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean)
  }
  if (typeof value === 'string') {
    return value.split(/[,，、\n]/).map((item) => item.trim()).filter(Boolean)
  }
  return []
}

function toOptionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function normalizeSummaryResult(source: unknown): NormalizedSummaryResult {
  const sourceRecord = source && typeof source === 'object'
    ? source as Record<string, unknown>
    : {}
  const nested = sourceRecord.data
  const obj = nested && typeof nested === 'object'
    ? nested as Record<string, unknown>
    : sourceRecord
  const summary = String(obj.summary ?? obj.result ?? obj.content ?? obj.text ?? '').trim()
  return {
    summary,
    result: summary,
    keywords: toArray(obj.keywords ?? obj.keyword ?? obj.tags),
    traffic_keywords: toArray(
      obj.traffic_keywords ?? obj.trafficKeywords ?? obj.seo_keywords,
    ),
    usage_chars: toOptionalNumber(obj.usage_chars ?? obj.usageChars),
    remaining_chars: toOptionalNumber(obj.remaining_chars ?? obj.remainingChars),
    balance: toOptionalNumber(obj.balance ?? obj.remaining_chars ?? obj.remainingChars),
    raw: source,
  }
}

export function useSummaryAction(stateSetters?: SummaryStateSetters) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runSummary = async (inputText: string) => {
    if (!inputText?.trim()) return null

    const token = getCustomSessionToken()
    if (!token) {
      setError('請先登入後再使用 AI 摘要。')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/main?action=summary', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: inputText,
          title: inputText.trim().slice(0, 50).replace(/\n/g, ' '),
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || data?.error) {
        throw new Error(String(data?.error || data?.message || 'AI 摘要暫時無法使用'))
      }

      const normalized = normalizeSummaryResult(data)
      if (!normalized.summary) throw new Error('AI 摘要沒有回傳完整內容')

      stateSetters?.setSummary({ content: normalized.summary })
      stateSetters?.setKeywords(normalized.keywords)
      stateSetters?.setTrafficKeywords(normalized.traffic_keywords)
      if (stateSetters?.setTrafficKeywordsReady && normalized.traffic_keywords.length > 0) {
        stateSetters.setTrafficKeywordsReady(true)
      }

      return normalized
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : 'AI 摘要暫時無法使用')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { runSummary, loading, error }
}

import { useState } from 'react'
import SEO from '../../components/SEO'
import SectionHeader from '../../components/SectionHeader'

const MAX_DAILY_FREE = 3

function getTodayUsage() {
  const data = localStorage.getItem('daily_summary_usage')
  if (!data) return 0

  const parsed = JSON.parse(data)

  const today = new Date().toDateString()
  if (parsed.date !== today) {
    // 日期不同，自動重置
    return 0
  }

  return parsed.count || 0
}

function increaseTodayUsage() {
  const today = new Date().toDateString()
  const count = getTodayUsage() + 1

  localStorage.setItem(
    'daily_summary_usage',
    JSON.stringify({ date: today, count })
  )
}


// ===== 🔤 MVP 語系 =====
const LANG_TEXT = {
  'zh-tw': {
    langLabel: '繁體中文',
    inputTitle: '文字輸入',
    placeholder: '請貼上要摘要的文章...',
    summaryTitle: '📌 摘要結果',
    copySummary: '複製摘要',
    keywordTitle: '🔖 相關關鍵字',
    copyKeywords: '複製關鍵字',
    pending: '（內容將顯示於此）',
    btn: '一鍵摘要',
    loading: '生成中…',
    previewTitle: '✨ 即將上線功能（預告）',
    previewList: [
      '網址自動抓全文摘要',
      '多語言自動識別 & 多語輸出',
      '一鍵分享 FB / LINE / Reddit',
      'AI 摘要歷史記錄',
      '深度重點提取（非一般摘要）',
      'AI 真人朗讀（未來付費功能）',
      '上傳 PDF → 自動擷取文字（未來進階功能）'
    ]
  },
  en: {
    langLabel: 'English',
    inputTitle: 'Text Input',
    placeholder: 'Paste the article…',
    summaryTitle: '📌 Summary Result',
    copySummary: 'Copy Summary',
    keywordTitle: '🔖 Keywords',
    copyKeywords: 'Copy Keywords',
    pending: '(Summary will appear here)',
    btn: 'Generate',
    loading: 'Generating…',
    previewTitle: '✨ Coming Soon Features',
    previewList: [
      'Auto URL full-text extraction',
      'Multi-language detection & output',
      'One-click share to FB / LINE / Reddit',
      'Summary history record',
      'Deep insight extraction',
      'AI human-voice reading (future paid feature)',
      'Upload PDF → extract text (future feature)'
    ]
  }
}

export default function SummaryPage() {
  const [lang, setLang] = useState<'zh-tw' | 'en'>('zh-tw')
  const t = LANG_TEXT[lang]

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [error, setError] = useState('')

  // 自動偵測輸入文字的語言
  function detectLanguage(text: string): 'zh-TW' | 'en' {
    const chineseRegex = /[\u4e00-\u9fa5]/
    return chineseRegex.test(text) ? 'zh-TW' : 'en'
  }

  const handleSummary = async () => {
    if (!input.trim()) {
      setError(lang === 'zh-tw' ? '請貼上文章內容' : 'Please paste article content')
      return
    }

    const used = getTodayUsage()
    if (used >= MAX_DAILY_FREE) {
      alert(
        lang === 'zh-tw'
          ? '今日免費使用次數已達上限 (3 次)，請明天再試。'
          : 'Daily free usage limit reached (3 times). Please try again tomorrow.'
      )
      return
    }

    increaseTodayUsage()

    setError('')
    setLoading(true)
    setSummary('')
    setKeywords([])

    try {
      // 自動偵測輸入文字的語言
      const detectedLang = detectLanguage(input)

      const res = await fetch(
        'https://icuxwmpdpsfhztsbyeds.supabase.co/functions/v1/auto-summary',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ 
            content: input,
            lang: detectedLang, // 自動偵測的語言
          }),
        }
      )

      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      setSummary(data.summary)
      setKeywords(data.keywords)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text)
    alert(lang === 'zh-tw' ? '已複製！' : 'Copied!')
  }

  const copySummary = () => {
    if (summary) {
      copyText(summary)
    }
  }

  const copyKeywords = () => {
    if (keywords.length > 0) {
      copyText(keywords.join(', '))
    }
  }

  return (
    <>
      <SEO
        title="AI Summary Tool — Free Daily Summaries (3 per day)"
        description="Summarize articles, URLs, and YouTube videos using AI. Supports English & Chinese. Free 3 summaries per day. Powered by Supabase Edge Functions + Gemini Flash."
        keywords="AI summary tool, article summarizer, YouTube summary, JSON schema, Supabase Edge Functions, Gemini Flash, free AI tools"
        url="https://pomodoro-app-eight-rouge.vercel.app/summary"
        image="/seo/summary-tool.png"
      />

      {/* ===== Container ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 lg:p-8 bg-[#EFF5FF] min-h-screen">
        
        {/* 語系選擇 */}
        <div className="flex justify-end items-center gap-4 mb-4 lg:col-span-2">
          <a
            href="https://ko-fi.com/s/b5b4180ff1"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline hover:text-blue-600"
          >
            Buy Template
          </a>
          <div className="flex flex-col items-end">
            <label className="text-sm text-gray-600 mb-1">
              🌐 選擇語言 / Choose Language
            </label>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as any)}
              className="w-[150px] p-2 border rounded-lg bg-white shadow-sm"
            >
              <option value="zh-tw">繁體中文</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
        
        {/* ===== 左側：輸入 ===== */}
        <div className="shadow-md border rounded-2xl p-5 bg-white transition">
          <SectionHeader title={t.inputTitle} />

          <textarea
            className="w-full h-[380px] bg-gray-50 border rounded-xl p-3 focus:ring-2 focus:ring-blue-500"
            placeholder={t.placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <p className="text-sm text-gray-600 mt-2">
            {lang === 'zh-tw' ? '今日剩餘免費次數：' : 'Daily remaining free uses: '}
            {MAX_DAILY_FREE - getTodayUsage()} / {MAX_DAILY_FREE}
          </p>

          <div className="mt-4"></div>
          <button
            onClick={handleSummary}
            disabled={loading}
            className={`w-full font-bold py-3 sm:py-4 px-3 sm:px-4 rounded-xl transition-all duration-200 transform flex items-center justify-center gap-2 ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-md'
                : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 cursor-pointer shadow-md hover:shadow-lg hover:scale-105 active:scale-95'
            }`}
            style={
              !loading
                ? {
                    color: '#ffffff',
                  }
                : undefined
            }
          >
            {loading ? t.loading : t.btn}
          </button>

          <p className="text-sm text-gray-600 mt-2 text-center">
            {lang === 'zh-tw' ? (
              <>
                每天免費使用 3 次（自動重置）｜今日剩餘：{MAX_DAILY_FREE - getTodayUsage()} / {MAX_DAILY_FREE}
              </>
            ) : (
              <>
                Daily free use: 3 times (auto reset) | Remaining today: {MAX_DAILY_FREE - getTodayUsage()} / {MAX_DAILY_FREE}
              </>
            )}
          </p>

          {error && (
            <p className="mt-3 p-3 bg-red-100 border border-red-300 text-red-600 rounded">
              {error}
            </p>
          )}
        </div>

        {/* ===== 右側：摘要 + 關鍵字 ===== */}
        <div className="flex flex-col gap-6">

          {/* 摘要區塊 */}
          <div className="shadow-md border rounded-2xl p-5 bg-white transition">
            <SectionHeader
              title={t.summaryTitle}
              actionLabel={t.copySummary}
              onAction={copySummary}
            />

            <div className="text-gray-700 leading-7 whitespace-pre-line">
              {summary || t.pending}
            </div>
          </div>

          {/* CTA 卡片 - 只在有摘要時顯示 */}
          {summary && (
            <div className="mt-6 p-5 rounded-xl border bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800">
                Want to build your own AI JSON Summarizer?
              </h3>
              <p className="text-gray-600 mt-1">
                Get the full Supabase + Gemini + JSON Schema template and deploy your own tool in minutes.
              </p>

              <a
                href="https://ko-fi.com/s/b5b4180ff1"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 px-5 py-2 text-white font-medium rounded-lg bg-blue-600 hover:bg-blue-700 transition"
              >
                🔥 Buy Template – Full Source Code Included
              </a>
            </div>
          )}

          {/* 關鍵字 */}
          <div className="shadow-md border rounded-2xl p-5 bg-white transition">
            <SectionHeader
              title={t.keywordTitle}
              actionLabel={t.copyKeywords}
              onAction={copyKeywords}
            />

            {keywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {keywords.map((k, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-blue-100 text-blue-700 border border-blue-300 rounded-full text-sm"
                  >
                    #{k}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">{t.pending}</p>
            )}
          </div>

          {/* ===== 未來功能（預告） ===== */}
          <div className="shadow-md border rounded-2xl p-5 bg-white transition">
            <SectionHeader title={t.previewTitle} />

            <ul className="list-disc ml-5 text-gray-700 leading-7">
              {t.previewList.map((txt, i) => (
                <li key={i}>{txt}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

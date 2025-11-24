import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { buildSEO } from '../../lib/seo'
import SectionHeader from '../../components/SectionHeader'
import { config } from '../../config'

const MAX_CHARACTERS = 2000

const seo = buildSEO({
  title: 'AI 摘要工具',
  description: '貼上文章內容，AI 自動生成摘要與關鍵字。支援繁中 / 英文切換，簡單快速抓重點。',
  url: 'https://pomodoro-app-eight-rouge.vercel.app/summary',
  image: '/seo/summary-tool.png',
})

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
    ],
    wordLimit: '字數上限：2000 字',
    freeLimitTitle: '⚡ 免費版目前每次可摘要最多 2000 字。',
    freeLimitSub: '📘 超過 2000 字的長文版本開發中，敬請期待。'
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
    ],
    wordLimit: 'Character limit: 2000 characters',
    freeLimitTitle: '⚡ The free version currently supports up to 2000 characters per summary.',
    freeLimitSub: '📘 Support for longer articles (2000+ characters) is in development. Stay tuned.'
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

    if (input.length > MAX_CHARACTERS) {
      setError(
        lang === 'zh-tw'
          ? `字數超過上限，請控制在 ${MAX_CHARACTERS} 字以內`
          : `Character limit exceeded. Please keep within ${MAX_CHARACTERS} characters`
      )
      return
    }

    setError('')
    setLoading(true)
    setSummary('')
    setKeywords([])

    try {
      // 自動偵測輸入文字的語言
      const detectedLang = detectLanguage(input)

      // 檢查環境變數並使用 config
      if (!config.summaryFunctionUrl) {
        throw new Error('SUMMARY FUNCTION URL 不存在，請確認環境變數 VITE_SUMMARY_FUNCTION_URL 已於 Vercel 設定');
      }

      if (!config.supabaseAnonKey) {
        throw new Error('VITE_SUPABASE_ANON_KEY 不存在，請確認環境變數已於 Vercel 設定');
      }

      console.log('🚀 呼叫摘要 API：', config.summaryFunctionUrl);
      console.log('🔑 環境變數檢查：', {
        summaryFunctionUrl: config.summaryFunctionUrl ? '✅ SET' : '❌ UNDEFINED',
        supabaseAnonKey: config.supabaseAnonKey ? '✅ SET' : '❌ UNDEFINED',
      });

      const res = await fetch(
        config.summaryFunctionUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.supabaseAnonKey}`,  // ⭐ 最重要：避免 401
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
      <Helmet>
        <title>{seo.title}</title>
      </Helmet>

      {/* ===== Container ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 lg:p-8 bg-[#EFF5FF] min-h-screen">
        
        {/* 語系選擇 */}
        <div className="flex justify-end mb-4 lg:col-span-2">
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

          {/* 顯示「字數上限：2000 字」或英文對應文字 */}
          <p className="text-sm text-gray-600 mb-2">
            {t.wordLimit}
          </p>

          <textarea
            className="w-full h-[380px] bg-gray-50 border rounded-xl p-3 focus:ring-2 focus:ring-blue-500"
            placeholder={t.placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <p className="text-xs text-gray-500 mt-1">
            {lang === 'zh-tw'
              ? `字數：${input.length} / ${MAX_CHARACTERS}`
              : `Characters: ${input.length} / ${MAX_CHARACTERS}`}
          </p>

          <div className="mt-4"></div>
          <div className="space-y-3">
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

            {/* 免費版 2000 字限制提示卡片 */}
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs text-yellow-800">
              <p className="font-semibold">
                {t.freeLimitTitle}
              </p>
              <p className="mt-1 text-[11px]">
                {t.freeLimitSub}
              </p>
            </div>
          </div>

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

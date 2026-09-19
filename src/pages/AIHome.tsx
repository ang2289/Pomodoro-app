import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useMemo, useState } from 'react'
import { isLocalDevelopment, isVideoToolPublicPath } from '@/lib/isLocalDevelopment'

type ToolCategory = '熱門工具' | 'AI工具' | '實用工具' | '開發中'

interface ToolDef {
  id: string
  icon: string
  title: string
  desc: string
  category: ToolCategory
  /** 開發中項目不填，不會導向任何頁面 */
  href?: string
}

const tools: ToolDef[] = [
  { id: 'pomodoro', icon: '🍅', title: '番茄鐘', desc: '專注計時，養成工作節奏', category: '熱門工具', href: '/pomodoro' },
  {
    id: 'image-resize',
    icon: '📐',
    title: '圖片尺寸轉換',
    desc: '調整長寬、比例與常用社群尺寸',
    category: '熱門工具',
    href: '/tools/image-resize',
  },
  {
    id: 'line-sticker',
    icon: '📦',
    title: 'LINE 貼圖整理',
    desc: '整理與預覽貼圖素材更方便',
    category: '熱門工具',
    href: '/tools/line-sticker',
  },
  { id: 'ai-summary', icon: '📝', title: 'AI 摘要', desc: '長文重點整理，快速掌握內容', category: '熱門工具', href: '/summary' },
  {
    id: 'ai-short-video',
    icon: '🎬',
    title: 'AI 短影音',
    desc: '圖片轉短影片，適合社群內容',
    category: 'AI工具',
    href: '/tools/image-to-video',
  },
  {
    id: 'homework-helper',
    icon: '📘',
    title: '作業解題助手',
    desc: '解題思路與步驟提示，輔助學習',
    category: 'AI工具',
    href: '/tools/homework-helper',
  },
  { id: 'todo', icon: '✅', title: '待辦清單', desc: '簡單管理今日任務', category: '實用工具', href: '/todo' },
  { id: 'chant', icon: '📿', title: '念經計數器', desc: '誦念次數紀錄與專注輔助', category: '實用工具', href: '/chant' },
  {
    id: 'scam-check',
    icon: '🛡️',
    title: '詐騙風險判斷',
    desc: '依線索評估可疑訊息與連結',
    category: '實用工具',
    href: '/tools/scam-check',
  },
  {
    id: 'qr-code',
    icon: '📱',
    title: 'QR Code 產生器',
    desc: '輸入網址或文字，立即產生並下載 QR 圖片',
    category: '實用工具',
    href: '/tools/qr-code',
  },
  { id: 'image-compress', icon: '🗜️', title: '圖片壓縮工具', desc: '縮小檔案、保留可接受畫質', category: '開發中' },
  {
    id: 'youtube-thumb',
    icon: '🖼️',
    title: 'YouTube 縮圖工具',
    desc: '縮圖尺寸與安全區預覽',
    category: '開發中',
  },
]

const sectionOrder: ToolCategory[] = ['熱門工具', 'AI工具', '實用工具', '開發中']

function normalizeSearch(s: string) {
  return s.trim().toLowerCase()
}

function toolMatchesQuery(tool: ToolDef, q: string) {
  if (!q) return true
  const hay = `${tool.title} ${tool.desc} ${tool.category}`.toLowerCase()
  return hay.includes(q)
}

export default function AIHome() {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = normalizeSearch(query)
    return tools.filter((t) => toolMatchesQuery(t, q))
  }, [query])

  const byCategory = useMemo(() => {
    const map = new Map<ToolCategory, ToolDef[]>()
    for (const c of sectionOrder) map.set(c, [])
    for (const t of filtered) {
      const list = map.get(t.category)
      if (list) list.push(t)
    }
    return map
  }, [filtered])

  const cardBase =
    'relative flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition min-h-[120px]'

  const renderCard = (tool: ToolDef) => {
    const videoLocked =
      Boolean(tool.href) && !isLocalDevelopment() && isVideoToolPublicPath(tool.href as string)

    if (videoLocked) {
      return (
        <div key={tool.id} className={`${cardBase} cursor-not-allowed opacity-80 pointer-events-none relative`}>
          <span className="absolute right-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-semibold text-white">
            開發中
          </span>
          <div className="text-2xl leading-none mb-2">{tool.icon}</div>
          <h3 className="pr-16 text-base font-bold text-slate-900 leading-snug">{tool.title}</h3>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed flex-1">{tool.desc}</p>
          <p className="mt-2 text-[11px] font-semibold text-slate-500">未開放</p>
        </div>
      )
    }

    const isDev = tool.category === '開發中' || !tool.href

    if (isDev) {
      return (
        <div key={tool.id} className={`${cardBase} cursor-default opacity-90`}>
          <span className="absolute right-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-semibold text-white">
            開發中
          </span>
          <div className="text-2xl leading-none mb-2">{tool.icon}</div>
          <h3 className="pr-16 text-base font-bold text-slate-900 leading-snug">{tool.title}</h3>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed flex-1">{tool.desc}</p>
        </div>
      )
    }

    return (
      <Link key={tool.id} to={tool.href!} className={`${cardBase} hover:border-blue-300 hover:shadow-md active:scale-[0.99]`}>
        <div className="text-2xl leading-none mb-2">{tool.icon}</div>
        <h3 className="text-base font-bold text-slate-900 leading-snug">{tool.title}</h3>
        <p className="mt-1 text-xs text-slate-600 leading-relaxed flex-1">{tool.desc}</p>
      </Link>
    )
  }

  return (
    <>
      <Helmet>
        <title>免費 AI 工具與創作者工具</title>
        <meta
          name="description"
          content="番茄鐘、貼圖整理、圖片工具、AI 摘要，一站使用。免費 AI 與創作者工具入口。"
        />
      </Helmet>

      <div className="w-full flex flex-col px-4 py-8 min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">
        {/* 1. 標題區 */}
        <header className="mx-auto w-full max-w-lg text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">免費 AI 工具與創作者工具</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            番茄鐘、貼圖整理、圖片工具、AI 摘要，一站使用
          </p>
        </header>

        {/* 2. 快速開始 */}
        <div className="mx-auto mt-8 w-full max-w-lg">
          <Link
            to="/pomodoro"
            className="flex w-full flex-col items-center justify-center rounded-2xl bg-blue-600 px-6 py-5 text-center text-white shadow-lg transition hover:bg-blue-700 active:scale-[0.99]"
          >
            <span className="text-lg font-bold">開始專注</span>
            <span className="mt-1 text-sm text-blue-100">快速進入番茄鐘</span>
          </Link>
        </div>

        {/* 3. 搜尋框 */}
        <div className="mx-auto mt-8 w-full max-w-lg">
          <label htmlFor="tool-search" className="sr-only">
            搜尋工具
          </label>
          <input
            id="tool-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋工具（例如：番茄鐘、貼圖、摘要）"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            autoComplete="off"
          />
        </div>

        {/* 4. 工具卡片區（2 欄，手機優先） */}
        <div className="mx-auto mt-8 w-full max-w-lg space-y-8">
          {sectionOrder.map((cat) => {
            const list = byCategory.get(cat) ?? []
            if (list.length === 0) return null
            return (
              <section key={cat} aria-labelledby={`section-${cat}`}>
                <h2 id={`section-${cat}`} className="mb-3 text-sm font-bold text-slate-800">
                  {cat}
                </h2>
                <div className="grid grid-cols-2 gap-3">{list.map((tool) => renderCard(tool))}</div>
              </section>
            )
          })}
        </div>
      </div>
    </>
  )
}

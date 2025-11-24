import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

interface FeatureCard {
  icon: string
  title: string
  description: string
  path: string
  isHighlight?: boolean
  badge?: { text: string; style: string }
}

export default function HomePage() {
  const features: FeatureCard[] = [
    {
      icon: '🤖',
      title: 'AI 摘要工具',
      description: '貼上文章、網址或 YouTube 內容，AI 自動整理重點、摘要與關鍵字。免費無限使用。支援中英文內容。',
      path: '/summary',
      isHighlight: true,
      badge: { text: 'Free', style: 'bg-green-100 text-green-700' },
    },
    {
      icon: '🛍️',
      title: '商品搜尋與比價工具',
      description: '輸入商品名稱即可整理蝦皮商品清單、價格、銷量與評價資訊，並提供多種排序方式。（目前開發中，敬請期待）',
      path: '/shopping/search',
      badge: { text: 'Beta', style: 'bg-blue-100 text-blue-600' },
    },
    {
      icon: '💰',
      title: '補助懶人包',
      description: '每日更新政府補助、公告與反詐提醒，資料整理自官方網站',
      path: '/aids',
      badge: { text: 'Hot', style: 'bg-yellow-100 text-yellow-700' },
    },
    {
      icon: '🩺',
      title: '健康理財',
      description: '專家文章、健康保險、財務策略，清楚易懂',
      path: '/finance',
      badge: { text: 'New', style: 'bg-purple-100 text-purple-700' },
    },
    {
      icon: '📚',
      title: 'AI Tools Guide',
      description: '了解 AI 摘要工具的工作原理、技術架構與開發模板',
      path: '/tools/ai-summary',
      badge: { text: 'Guide', style: 'bg-indigo-100 text-indigo-700' },
    },
    {
      icon: '🏛️',
      title: '退休金專欄',
      description: '掌握退休金制度、安心理財與最新政策',
      path: '/pension',
    },
    {
      icon: '🍅',
      title: '番茄鐘',
      description: '專注計時、任務管理與時間統計，提升工作效率',
      path: '/pomodoro',
    },
    {
      icon: '✅',
      title: '待辦清單',
      description: '管理日常任務，追蹤完成進度，提升生產力',
      path: '/todo',
    },
    {
      icon: '🙏',
      title: '唸經集氣',
      description: '記錄念誦次數，發起集氣願望，與他人共同祈福',
      path: '/chant',
    },
  ]

  return (
    <>
      <SEO
        title="AI Tools Hub — Free AI Summary, Price Comparison & Useful Utilities"
        description="A collection of free AI tools including article summarizer, price comparison engine, government subsidy guides, and financial planning insights. Updated weekly."
        keywords="AI tools, free AI summary, AI utilities, price comparison, government subsidies, financial planner"
        url="https://pomodoro-app-eight-rouge.vercel.app"
        image="/seo-cover.png"
      />

      <main className="mx-auto max-w-4xl px-4 py-8 pb-24">
        {/* 置中大標題 */}
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-8">
          AI 工具與生活服務中心
        </h1>

        {/* 功能卡片網格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {features.map((feature) => {
            return (
              <Link
                key={feature.path}
                to={feature.path}
                className="group bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.01] flex justify-between items-start"
              >
                <div className="flex flex-col gap-2 w-[80%]">
                  <div className="text-4xl">
                    {feature.icon}
                  </div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    {feature.title}
                    {feature.badge && (
                      <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${feature.badge.style}`}>
                        {feature.badge.text}
                      </span>
                    )}
                  </h2>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-gray-400 group-hover:text-blue-500 text-2xl">
                  →
                </div>
              </Link>
            )
          })}
        </div>
      </main>
    </>
  )
}


import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

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
      description: '貼上文章、網址或 YouTube 內容，AI 自動整理重點、摘要與關鍵字。每天免費使用 3 次（午夜自動重置）。支援中英文內容。',
      path: '/summary',
      isHighlight: true,
      badge: { text: 'Free 3/day', style: 'bg-green-100 text-green-700' },
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
      <Helmet>
        <title>AI 工具與生活服務中心｜AI 摘要工具｜補助懶人包｜健康理財</title>
        <meta
          name="description"
          content="全台最好用的 AI 摘要工具！支援文章、網址與 YouTube 摘要，免費使用每月 3 次。提供補助懶人包、健康理財與生活服務。"
        />
        <meta
          name="keywords"
          content="AI 摘要, AI 擷取重點, 免費 AI 工具, 補助懶人包, 健康理財"
        />
        <meta property="og:title" content="AI 工具與生活服務中心" />
        <meta
          property="og:description"
          content="免費 AI 摘要工具，每月免費 3 次。支援 YouTube 摘要、文章重點擷取與關鍵字生成。"
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content="https://pomodoro-app-eight-rouge.vercel.app"
        />
        <meta property="og:image" content="/seo-cover.png" />
      </Helmet>

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


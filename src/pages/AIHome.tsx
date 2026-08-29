import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

export default function AIHome() {
  return (
    <>
      <Helmet>
        <title>RxV 企業級 AI 應用中心</title>
        <meta
          name="description"
          content="提供 AI 摘要、補助懶人包、金融知識、AI 工具管理與自動化服務，協助個人與企業快速提升效率、降低成本、打造 AI 工作流程。"
        />
      </Helmet>

      <div className="w-full flex flex-col items-center px-4 py-10 min-h-screen bg-gradient-to-b from-white to-blue-50 pb-20">
        {/* Hero Section */}
        <div className="text-center max-w-2xl">
          <h1 className="text-3xl font-bold mb-4">
            🚀 RxV 企業級 AI 應用中心
          </h1>
          <p className="text-gray-600 leading-relaxed">
            提供 AI 摘要、補助懶人包、金融知識、AI 工具管理與自動化服務，
            協助個人與企業快速提升效率、降低成本、打造 AI 工作流程。
          </p>
        </div>

        {/* 主功能區 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10 w-full max-w-5xl">
          {/* AI 摘要工具 */}
          <Link
            to="/summary"
            className="p-6 shadow rounded-xl border hover:shadow-lg transition bg-white"
          >
            <h2 className="font-bold text-lg mb-2">🤖 AI 摘要工具</h2>
            <p className="text-gray-600 text-sm">
              貼上文章、網址或 YouTube 內容，AI 自動生成摘要、重點與關鍵字。
            </p>
          </Link>

          {/* AI 短影音內容工廠 */}
          <Link
            to="/tools/ai-content-workflow"
            className="p-6 shadow rounded-xl border border-blue-200 hover:shadow-lg transition bg-white"
          >
            <h2 className="font-bold text-lg mb-2">AI 短影音內容工廠</h2>
            <p className="text-gray-600 text-sm">
              零 API 成本產生短影音總指令，整理圖片 Prompt、FLOW Prompt、Hook 與社群文案。
            </p>
          </Link>

          {/* 補助懶人包 */}
          <Link
            to="/aids"
            className="p-6 shadow rounded-xl border hover:shadow-lg transition bg-white"
          >
            <h2 className="font-bold text-lg mb-2">💰 補助懶人包</h2>
            <p className="text-gray-600 text-sm">
              每日更新政府補助、公告與反詐提醒，資料整理自官方網站。
            </p>
          </Link>

          {/* 健康理財 */}
          <Link
            to="/health"
            className="p-6 shadow rounded-xl border hover:shadow-lg transition bg-white"
          >
            <h2 className="font-bold text-lg mb-2">🩺 健康理財</h2>
            <p className="text-gray-600 text-sm">
              專家文章、健康保險、財務策略，清楚易懂。
            </p>
          </Link>

          {/* 退休金專欄 */}
          <Link
            to="/pension"
            className="p-6 shadow rounded-xl border hover:shadow-lg transition bg-white"
          >
            <h2 className="font-bold text-lg mb-2">🏛️ 退休金專欄</h2>
            <p className="text-gray-600 text-sm">
              掌握退休金制度、安心理財與最新政策。
            </p>
          </Link>

          {/* 金融知識 */}
          <Link
            to="/finance"
            className="p-6 shadow rounded-xl border hover:shadow-lg transition bg-white"
          >
            <h2 className="font-bold text-lg mb-2">💼 金融知識</h2>
            <p className="text-gray-600 text-sm">
              健康理財、退休規劃、防詐知識，專業易懂。
            </p>
          </Link>

          {/* AI 工具箱（預留） */}
          <Link
            to="/tools"
            className="p-6 shadow rounded-xl border hover:shadow-lg transition bg-white opacity-75"
          >
            <h2 className="font-bold text-lg mb-2">🧰 AI 工具箱（即將推出）</h2>
            <p className="text-gray-600 text-sm">
              常用 AI 模組、文件轉換、批次工具、開發者 API。
            </p>
          </Link>

          {/* 自動化中心（預留） */}
          <Link
            to="/automation"
            className="p-6 shadow rounded-xl border hover:shadow-lg transition bg-white opacity-75"
          >
            <h2 className="font-bold text-lg mb-2">⚙️ 自動化工作中心（即將推出）</h2>
            <p className="text-gray-600 text-sm">
              自動摘要、自動發布、自動匯整，打造完整 AI 工作流。
            </p>
          </Link>
        </div>
      </div>
    </>
  )
}


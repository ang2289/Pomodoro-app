import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function FinancePage() {
  return (
    <>
      <Helmet>
        <title>📖 健康與理財專欄｜RxV 夢想創作工作室</title>
        <meta
          name="description"
          content="整合健康生活與理財知識，探討身心平衡、退休規劃與投資心態。幫助您在快節奏生活中找到安定力量。"
        />
        <meta name="keywords" content="健康理財, 退休規劃, 投資心態, 財富管理, 心靈健康, RxV" />
        <meta property="og:title" content="健康與理財專欄" />
        <meta property="og:description" content="從心靈與財務兩面提升生活品質，掌握理財與健康平衡之道。" />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://rxv-dreamstudio.vercel.app/finance" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "健康與理財專欄",
            "url": "https://rxv-dreamstudio.vercel.app/finance",
            "description": "整合健康生活與退休理財的專題內容，幫助使用者建立平衡的幸福人生。",
            "inLanguage": "zh-TW",
            "publisher": {
              "@type": "Organization",
              "name": "RxV 夢想創作工作室",
              "url": "https://rxv-dreamstudio.vercel.app"
            }
          })}
        </script>
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-right mb-4">
          <Link
            to="/"
            className="bg-blue-500 !text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600"
          >
            回首頁
          </Link>
        </div>
        <h1 className="text-2xl font-bold mb-4">📖 健康與理財專欄</h1>
        <p className="text-gray-600 mb-6">
          收錄健康生活與退休理財文章，幫助你在身心健康與財務穩定間取得平衡。
          包含飲食建議、退休規劃、投資心態與心理健康專題。
        </p>

        {/* 文章列表 */}
        <section className="grid md:grid-cols-2 gap-6">
          <article className="p-5 rounded-xl border bg-white shadow-sm">
            <h2 className="text-xl font-bold mb-2">
              💖 身心平衡理財術｜讓健康與財務穩定同行
            </h2>
            <p className="text-gray-600 mb-3 text-sm">
              健康與理財並非衝突，而是相互支撐的關係。從飲食、運動到預算規劃，打造穩定的人生結構。
            </p>
            <p className="text-gray-500 text-xs mb-3">2025-03-01</p>
            <Link
              to="/finance/health-balance-2025"
              className="text-blue-600 font-semibold"
            >
              閱讀詳情 →
            </Link>
          </article>

          <article className="p-5 rounded-xl border bg-white shadow-sm">
            <h2 className="text-xl font-bold mb-2">
              🧘‍♀️ 退休健康金三角｜醫療、儲蓄與生活品質兼顧
            </h2>
            <p className="text-gray-600 mb-3 text-sm">
              從醫療保險到生活品質，建立退休後的健康金三角，讓身心與財務皆能長期穩定。
            </p>
            <p className="text-gray-500 text-xs mb-3">2025-04-01</p>
            <Link
              to="/finance/retire-plan-2025"
              className="text-blue-600 font-semibold"
            >
              閱讀詳情 →
            </Link>
          </article>
        </section>
      </div>
    </>
  );
}


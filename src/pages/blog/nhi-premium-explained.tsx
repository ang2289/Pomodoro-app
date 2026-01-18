import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import SEO from "../../components/SEO";

export default function NHIPremiumExplainedPage() {
  // 獲取今天的日期（格式：YYYY-MM-DD）
  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <SEO
        title="健保費是怎麼算的？為什麼每個人繳的不一樣？"
        description="健保費完整解析：用白話方式說明健保費的計算基礎，薪資、眷屬與補充保費的差別，以及一般人最常誤會的地方。"
        keywords="健保費, 健保, 補充保費, 政策解釋"
        url="https://pomodoro-app-eight-rouge.vercel.app/blog/nhi-premium-explained"
      />

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-6">
          <Link
            to="/blog/policy-explained"
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            ← 返回政策白話解釋
          </Link>
        </div>

        <article className="bg-white rounded-2xl shadow-md p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🏥 健保費是怎麼算的？為什麼每個人繳的不一樣？
            </h1>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                政策白話解釋
              </span>
              <span>{today}</span>
            </div>
          </header>

          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <p className="mb-4">
              健保費是根據你的「投保薪資」來計算的，不是固定金額。每個人繳的健保費不一樣，主要是因為投保薪資不同、有沒有眷屬、以及有沒有其他收入需要繳補充保費。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">健保費的計算基礎</h2>
            <p className="mb-4">
              健保費的計算主要看兩個東西：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>投保薪資</strong>：這是計算健保費的基礎，通常是你的月薪，但會有一個「級距」範圍</li>
              <li><strong>費率</strong>：目前健保費率是固定的百分比（約 5.17%），但會根據投保身分和是否有眷屬而有所不同</li>
            </ul>
            <p className="mb-4">
              例如，如果你的月薪是 3 萬元，投保薪資可能是 30,300 元（對應到某個級距），然後用這個金額乘以費率，再乘以負擔比例（通常是 30%，雇主負擔 60%，政府負擔 10%），就是你每個月要繳的健保費。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">薪資、眷屬與補充保費的差別</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">一般保費（薪資計算）：</h3>
            <p className="mb-4">
              這是每個月從薪水裡扣的健保費，計算方式是：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>投保薪資 × 費率 × 負擔比例（通常是 30%）</li>
              <li>如果有眷屬，會加計眷屬的保費（但通常有上限）</li>
            </ul>
            <p className="mb-4">
              例如，如果你的投保薪資是 30,300 元，費率是 5.17%，負擔比例是 30%，那每個月要繳的健保費就是：30,300 × 5.17% × 30% = 約 470 元。
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">補充保費：</h3>
            <p className="mb-4">
              除了每個月的健保費，如果你有其他收入（例如獎金、兼職、股利、利息等），超過一定金額（目前是 2 萬元）的部分，還要繳「補充保費」。
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>補充保費的費率是 2.11%</li>
              <li>只針對「超過 2 萬元」的部分計算</li>
              <li>例如，如果你領了 5 萬元的獎金，補充保費就是：(50,000 - 20,000) × 2.11% = 約 633 元</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">一般人最常誤會的地方</h2>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">誤會一：健保費是固定金額</h3>
              <p className="mb-4">
                不對。健保費是根據你的投保薪資計算的，薪資越高，健保費就越高。而且如果有眷屬或其他收入，還要加計額外的保費。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">誤會二：投保薪資就是實際薪資</h3>
              <p className="mb-4">
                不一定。投保薪資是根據「投保薪資級距」來決定的，不是你的實際薪資。例如，如果你的實際月薪是 28,000 元，但投保薪資級距可能是 30,300 元，那健保費就是用 30,300 元來計算。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">誤會三：補充保費是額外收費</h3>
              <p className="mb-4">
                對，但補充保費只針對「超過 2 萬元」的其他收入計算，不是全部收入。而且補充保費的費率（2.11%）比一般保費的費率（5.17%）低。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">誤會四：有眷屬會讓保費變很多</h3>
              <p className="mb-4">
                不一定。如果有眷屬，確實會加計眷屬的保費，但通常有上限（例如最多加計 3 個眷屬）。而且眷屬的保費計算方式跟本人一樣，都是根據投保薪資來計算。
              </p>
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-4">為什麼有人覺得繳很多、有人卻沒感覺？</h2>
            <p className="mb-4">
              這是因為健保費的計算方式讓不同情況的人感受不同：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>高薪族</strong>：投保薪資高，每個月要繳的健保費也比較多，而且如果有獎金或其他收入，還要繳補充保費，所以感覺繳很多</li>
              <li><strong>低薪族</strong>：投保薪資低，每個月要繳的健保費比較少，而且通常沒有其他收入需要繳補充保費，所以感覺沒那麼多</li>
              <li><strong>有眷屬的人</strong>：如果家裡有老人或小孩，要加計眷屬的保費，所以感覺繳比較多</li>
              <li><strong>單身族</strong>：只有自己的保費，沒有眷屬，所以感覺繳比較少</li>
            </ul>
            <p className="mb-4">
              健保費的設計是「有能力的人多繳一點，能力較弱的人少繳一點」，所以不同情況的人感受會不同。
            </p>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg my-8">
              <p className="text-gray-700 leading-relaxed">
                <strong>提醒：</strong>健保費的計算方式和費率會隨著政策調整而改變，實際繳費金額請以健保局的最新規定為準。建議定期查詢自己的投保薪資和保費明細，了解實際繳費情況。
              </p>
            </div>
          </div>

          {/* 相關文章區塊 */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              相關政策白話解釋文章
            </h3>
            <p className="text-gray-600 mb-6">
              如果你正在了解政策或制度，以下文章也可能與你有關。
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <Link
                to="/blog/labor-insurance-explained"
                className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-3xl mb-3">🛡️</div>
                <h4 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  勞保是什麼？你每個月繳的錢到底保障了哪些事情？
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  了解勞保的保障範圍，包括生病、失能、退休等各種情況的保障內容
                </p>
              </Link>
              <Link
                to="/blog/labor-insurance-pension-explained"
                className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-3xl mb-3">💼</div>
                <h4 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  勞保年金是什麼？什麼情況下領得到？一般人最容易搞錯的重點
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  了解勞保年金與一次領的差別，什麼情況才能請領，以及常見誤解
                </p>
              </Link>
            </div>
          </div>

          {/* 導流區塊：摘要模組 */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                看不懂健保或保險公告？
              </h3>
              <p className="text-gray-700 mb-6">
                把公告或新聞貼上來，幫你整理成「跟你有沒有關係」的重點
              </p>
              <Link
                to="/summary"
                className="inline-block px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg drop-shadow-md"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
              >
                貼上文章，幫我整理
              </Link>
            </div>
          </div>

          {/* 延伸閱讀區塊 */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              延伸閱讀
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/blog/labor-insurance-explained"
                  className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <span className="text-2xl mt-1">🛡️</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                      勞保是什麼？你每個月繳的錢到底保障了哪些事情？
                    </h4>
                    <p className="text-sm text-gray-600">
                      了解勞保的保障範圍，包括生病、失能、退休等各種情況的保障內容
                    </p>
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  to="/blog/labor-insurance-pension-explained"
                  className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <span className="text-2xl mt-1">💼</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                      勞保年金是什麼？什麼情況下領得到？一般人最容易搞錯的重點
                    </h4>
                    <p className="text-sm text-gray-600">
                      了解勞保年金與一次領的差別，什麼情況才能請領，以及常見誤解
                    </p>
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  to="/blog/minimum-wage-explained"
                  className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <span className="text-2xl mt-1">💼</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                      什麼是基本工資？調整後老闆與員工各自會遇到什麼影響？
                    </h4>
                    <p className="text-sm text-gray-600">
                      了解基本工資的定義、調整原因，以及對月薪制、時薪制的實際差異
                    </p>
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  to="/blog/income-tax-brackets-explained"
                  className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <span className="text-2xl mt-1">💰</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                      所得稅級距是什麼？為什麼加薪反而繳更多稅？一次白話說清楚
                    </h4>
                    <p className="text-sm text-gray-600">
                      用白話方式解釋什麼是所得稅級距，為什麼不是全部收入都用最高稅率
                    </p>
                  </div>
                </Link>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link
              to="/blog/policy-explained"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← 返回政策白話解釋列表
            </Link>
          </div>
        </article>
      </div>

      {/* Article JSON-LD 結構化資料 */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "健保費是怎麼算的？為什麼每個人繳的不一樣？",
            "description": "健保費完整解析：用白話方式說明健保費的計算基礎，薪資、眷屬與補充保費的差別，以及一般人最常誤會的地方。",
            "author": {
              "@type": "Organization",
              "name": "AI 工具與生活服務中心"
            },
            "publisher": {
              "@type": "Organization",
              "name": "AI 工具與生活服務中心"
            },
            "datePublished": today,
            "dateModified": today,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://pomodoro-app-eight-rouge.vercel.app/blog/nhi-premium-explained"
            }
          })}
        </script>
      </Helmet>
    </>
  );
}

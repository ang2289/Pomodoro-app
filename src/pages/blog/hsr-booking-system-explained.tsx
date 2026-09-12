import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import SEO from "../../components/SEO";
import ArticleCTA from "@/components/ArticleCTA";

export default function HSRBookingSystemExplainedPage() {
  // 獲取今天的日期（格式：YYYY-MM-DD）
  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <SEO
        title="高鐵訂票為什麼這麼難？售票制度是怎麼設計的？"
        description="高鐵訂票制度完整解析：用白話方式說明為什麼一開賣就容易滿，系統怎麼分配座位，以及為什麼不是先來先得這麼簡單。"
        keywords="高鐵訂票, 高鐵售票, 高鐵系統, 政策解釋"
        url="https://pomodoro-app-eight-rouge.vercel.app/blog/hsr-booking-system-explained"
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
              🚄 高鐵訂票為什麼這麼難？售票制度是怎麼設計的？
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
              很多人都有搶高鐵票的經驗，一開賣就秒殺，為什麼會這樣？高鐵的售票制度是怎麼設計的？其實這背後有一套複雜的系統，不只是「先來先得」這麼簡單。
            </p>

            <ArticleCTA placement="start" focus="summary" />


            <h2 className="text-2xl font-semibold mt-8 mb-4">為什麼一開賣就容易滿？</h2>
            <p className="mb-4">
              高鐵票一開賣就秒殺的主要原因有幾個：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>需求量遠超過供給量</strong>：台灣高鐵一天只有固定班次，但想要搭車的人數遠超過可提供的座位數</li>
              <li><strong>集中時段需求</strong>：連假、週末、特定時段的需求特別高，這些時段的票很快就會賣完</li>
              <li><strong>提前訂票的習慣</strong>：很多人都習慣提前訂票，所以一開賣就很多人同時搶票</li>
              <li><strong>系統負載限制</strong>：即使高鐵系統可以同時處理很多訂票，但在極大流量下，還是會有限制</li>
            </ul>
            <p className="mb-4">
              所以即使高鐵系統運作正常，在需求量遠超過供給量的情況下，一開賣就秒殺是很正常的現象。
            </p>

            <ArticleCTA placement="middle" focus="summary" />

            <h2 className="text-2xl font-semibold mt-8 mb-4">系統怎麼分配座位？</h2>
            <p className="mb-4">
              高鐵的座位分配系統並不是「先來先得」這麼簡單，而是有一套複雜的邏輯：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>優先保留座位</strong>：系統會保留一定數量的座位給特定對象，例如團體票、定期票、特定身分等</li>
              <li><strong>座位類型分配</strong>：系統會根據需求分配不同類型的座位（例如商務艙、標準艙、無障礙座位等）</li>
              <li><strong>連號座位優先</strong>：如果有多人同時訂票，系統會優先分配連號座位</li>
              <li><strong>班次平衡</strong>：系統會盡量平衡各班次的座位使用率，避免某些班次過度集中</li>
            </ul>
            <p className="mb-4">
              所以即使你很早訂票，也不一定能訂到想要的座位或班次，因為系統還要考慮其他因素。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">為什麼不是先來先得這麼簡單？</h2>
            <p className="mb-4">
              如果高鐵系統真的採用「先來先得」的方式，可能會出現以下問題：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>不公平問題</strong>：如果只看訂票時間，可能會讓某些人（例如有特殊需求的人、團體等）無法訂到票</li>
              <li><strong>系統負載問題</strong>：如果所有人都同時搶票，系統可能會因為負載過高而當機</li>
              <li><strong>座位使用效率</strong>：如果完全不考慮座位類型、連號等，可能會降低座位使用效率</li>
              <li><strong>服務公平性</strong>：系統需要考慮不同對象的需求，例如老人、身心障礙者、團體等</li>
            </ul>
            <p className="mb-4">
              所以高鐵系統需要平衡「效率」和「公平」，不是單純的「先來先得」。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">一般人應有的正確期待</h2>
            <p className="mb-4">
              對一般乘客來說，了解高鐵訂票制度要注意：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>提前規劃很重要</strong>：如果要在連假或熱門時段搭車，建議提前訂票，不要等到最後一刻</li>
              <li><strong>彈性安排時間</strong>：如果某個時段或班次已經滿了，可以考慮其他時段或班次</li>
              <li><strong>了解系統運作</strong>：了解系統的運作方式，不要期待「先來先得」這麼簡單的邏輯</li>
              <li><strong>保持耐心</strong>：在需求量遠超過供給量的情況下，訂不到票是很正常的，不要過度焦慮</li>
            </ul>
            <p className="mb-4">
              高鐵系統設計的目標是「盡量讓最多人可以使用」，而不是「讓最先訂票的人一定訂得到」。
            </p>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg my-8">
              <p className="text-gray-700 leading-relaxed">
                <strong>提醒：</strong>高鐵的售票制度和系統設計可能會隨著時間調整，實際訂票時請以高鐵公司的最新規定為準。建議提早規劃行程，提前訂票，並保持彈性安排時間。
              </p>
            </div>
          </div>

          <ArticleCTA placement="afterFaq" focus="summary" />

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
                to="/blog/college-entrance-exam-explained"
                className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-3xl mb-3">📚</div>
                <h4 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  大學學測在考什麼？制度怎麼設計？跟以前聯考差在哪？
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  了解為什麼會有學測，學測成績怎麼被使用，以及家長與學生最容易誤會的地方
                </p>
              </Link>
              <Link
                to="/blog/minimum-wage-explained"
                className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-3xl mb-3">💼</div>
                <h4 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  什麼是基本工資？調整後老闆與員工各自會遇到什麼影響？
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  了解基本工資的定義、調整原因，以及對月薪制、時薪制的實際差異
                </p>
              </Link>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                看不懂交通或制度公告？
              </h3>
              <p className="text-gray-700 mb-6">
                把公告或新聞貼上來，幫你整理成「跟你有沒有關係」的重點
              </p>
              <Link
                to="/summary"
                className="inline-block bg-blue-600 text-white px-5 py-3 rounded-lg text-base font-medium hover:bg-blue-700 transition"
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
                  to="/blog/college-entrance-exam-explained"
                  className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <span className="text-2xl mt-1">📚</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                      大學學測在考什麼？制度怎麼設計？跟以前聯考差在哪？
                    </h4>
                    <p className="text-sm text-gray-600">
                      了解為什麼會有學測，學測成績怎麼被使用，以及家長與學生最容易誤會的地方
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
                  to="/blog/long-term-care-subsidy-explained"
                  className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <span className="text-2xl mt-1">👵</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                      長照補助是什麼？家裡有人需要時，政府實際能幫到哪裡？
                    </h4>
                    <p className="text-sm text-gray-600">
                      了解長照補助在補什麼，哪些人比較容易符合，以及常見錯誤期待與實際差異
                    </p>
                  </div>
                </Link>
              </li>
            </ul>
          </div>
          <ArticleCTA placement="bottom" focus="summary" />

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
            "headline": "高鐵訂票為什麼這麼難？售票制度是怎麼設計的？",
            "description": "高鐵訂票制度完整解析：用白話方式說明為什麼一開賣就容易滿，系統怎麼分配座位，以及為什麼不是先來先得這麼簡單。",
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
              "@id": "https://pomodoro-app-eight-rouge.vercel.app/blog/hsr-booking-system-explained"
            }
          })}
        </script>
      </Helmet>
    </>
  );
}

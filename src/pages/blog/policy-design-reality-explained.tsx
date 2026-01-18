import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import SEO from "../../components/SEO";

export default function PolicyDesignRealityExplainedPage() {
  // 獲取今天的日期（格式：YYYY-MM-DD）
  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <SEO
        title="為什麼政策看起來對你好，實際卻無感？制度設計的現實原因"
        description="政策設計現實解析：用白話方式說明政策設計的取捨邏輯，為什麼不可能人人都直接受惠，以及一般民眾該怎麼看政策比較不焦慮。"
        keywords="政策設計, 政策影響, 政策解釋"
        url="https://pomodoro-app-eight-rouge.vercel.app/blog/policy-design-reality-explained"
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
              🤔 為什麼政策看起來對你好，實際卻無感？制度設計的現實原因
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
              很多人看到政策新聞會覺得「這個政策對我好」，但實際執行後卻發現「沒什麼感覺」。這不是因為「政策沒用」，而是因為「政策設計的現實原因」。政策不可能讓所有人都直接受惠，通常會有取捨和限制。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">政策設計的取捨邏輯</h2>
            <p className="mb-4">
              政策設計時會有取捨，不可能讓所有人都滿意：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>資源有限</strong>：政府的資源有限，不可能讓所有人都直接受惠，所以會優先給「最需要的人」或「符合政策目標的人」</li>
              <li><strong>公平性考量</strong>：政策要考慮「公平性」，不能讓某些人「過度受惠」，也不能讓某些人「完全沒受惠」</li>
              <li><strong>執行可行性</strong>：政策要考慮「執行可行性」，如果範圍太廣、條件太寬，可能無法有效執行</li>
              <li><strong>政策目標</strong>：每個政策都有特定的「政策目標」，不是「讓所有人都滿意」，而是「達成特定目標」</li>
            </ul>
            <p className="mb-4">
              所以政策設計時會有取捨，不可能讓所有人都直接受惠。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">為什麼不可能人人都直接受惠？</h2>
            <p className="mb-4">
              這是因為：
            </p>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">原因一：資源有限</h3>
              <p className="mb-4">
                政府的資源有限，不可能讓所有人都直接受惠。如果所有人都直接受惠，資源會被稀釋，每個人得到的幫助就會變少。所以政策通常會「優先給最需要的人」，而不是「給所有人」。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">原因二：政策目標不同</h3>
              <p className="mb-4">
                每個政策都有特定的「政策目標」，不是「讓所有人都滿意」。例如，某個補助的目標可能是「幫助低收入戶」，所以只有「低收入戶」才能申請，其他人就申請不到。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">原因三：執行可行性</h3>
              <p className="mb-4">
                如果政策範圍太廣、條件太寬，可能無法有效執行。例如，如果某個補助「給所有人」，行政管理的成本會很高，而且可能無法有效執行。所以政策通常會有「適用對象」和「申請條件」。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">原因四：公平性考量</h3>
              <p className="mb-4">
                政策要考慮「公平性」，不能讓某些人「過度受惠」，也不能讓某些人「完全沒受惠」。所以政策通常會有「適用對象」和「申請條件」，確保資源分配相對公平。
              </p>
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-4">新聞與實際感受落差的原因</h2>
            <p className="mb-4">
              新聞和實際感受會有落差的原因主要有幾個：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>新聞標題誇大</strong>：很多新聞標題會用誇大的用詞，讓讀者以為「政策對所有人都好」，其實可能只對「特定對象」好</li>
              <li><strong>不了解適用對象</strong>：很多人不了解政策的「適用對象」，以為「所有人都能受惠」，其實可能只對「特定對象」受惠</li>
              <li><strong>期待過高</strong>：很多人期待「政策應該要讓所有人都滿意」，但實際上政策只對「特定對象」受惠</li>
              <li><strong>資訊不完整</strong>：很多人只看新聞標題，沒有仔細看政策內容，所以不了解「適用對象」和「申請條件」</li>
            </ul>
            <p className="mb-4">
              所以新聞和實際感受會有落差，不是因為「政策沒用」，而是因為「你不在適用對象內」或「期待過高」。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">一般民眾該怎麼看政策比較不焦慮？</h2>
            <p className="mb-4">
              對一般民眾來說，看政策要注意：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>不要只看新聞標題</strong>：新聞標題可能會誇大，要仔細看政策內容，了解「適用對象」和「申請條件」</li>
              <li><strong>了解政策目標</strong>：每個政策都有特定的「政策目標」，不是「讓所有人都滿意」，而是「達成特定目標」</li>
              <li><strong>不要期待過高</strong>：政策不可能讓所有人都直接受惠，通常會有取捨和限制，不要期待「政策應該要讓所有人都滿意」</li>
              <li><strong>理解取捨邏輯</strong>：政策設計時會有取捨，不可能讓所有人都滿意，要理解「為什麼會有這些取捨」</li>
            </ul>
            <p className="mb-4">
              建議看政策時，先了解「適用對象」和「申請條件」，如果不符合，就要理解「政策不是給所有人的」，不要過度焦慮。
            </p>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg my-8">
              <p className="text-gray-700 leading-relaxed">
                <strong>提醒：</strong>政策的適用對象和申請條件會隨著時間而改變，實際適用時請以政府的最新公告為準。建議先了解政策的「適用對象」和「申請條件」，如果不符合，就要理解「政策不是給所有人的」。
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
                to="/blog/government-announcement-impact-explained"
                className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-3xl mb-3">📢</div>
                <h4 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  政府公告一定會影響你嗎？哪些政策其實跟多數人無關？
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  了解為什麼政府公告這麼多，哪些是「資訊型」不是「影響型」
                </p>
              </Link>
              <Link
                to="/blog/subsidy-visibility-explained"
                className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-3xl mb-3">💰</div>
                <h4 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  政府補助為什麼常常看不到？不是沒有，是你不在適用對象
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  了解補助為什麼不是「全民型」，常見被排除的幾種身分情境
                </p>
              </Link>
            </div>
          </div>

          {/* 導流區塊：摘要模組 */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                看不懂政策公告或新聞？
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
                  to="/blog/government-announcement-impact-explained"
                  className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <span className="text-2xl mt-1">📢</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                      政府公告一定會影響你嗎？哪些政策其實跟多數人無關？
                    </h4>
                    <p className="text-sm text-gray-600">
                      了解為什麼政府公告這麼多，哪些是「資訊型」不是「影響型」
                    </p>
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  to="/blog/subsidy-visibility-explained"
                  className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <span className="text-2xl mt-1">💰</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                      政府補助為什麼常常看不到？不是沒有，是你不在適用對象
                    </h4>
                    <p className="text-sm text-gray-600">
                      了解補助為什麼不是「全民型」，常見被排除的幾種身分情境
                    </p>
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  to="/blog/minimum-wage-impact-explained"
                  className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <span className="text-2xl mt-1">💰</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                      基本工資是什麼？為什麼調整後有人加薪、有人卻更辛苦？
                    </h4>
                    <p className="text-sm text-gray-600">
                      了解基本工資的設計目的，調整後對不同身分的實際影響
                    </p>
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  to="/blog/subsidy-eligibility-explained"
                  className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <span className="text-2xl mt-1">💰</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                      政府補助怎麼判斷？為什麼別人領得到，你卻不行？一次搞懂常見關鍵條件
                    </h4>
                    <p className="text-sm text-gray-600">
                      了解補助申請的關鍵判斷條件，包括身分、收入、居住地、用途等條件
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
            "headline": "為什麼政策看起來對你好，實際卻無感？制度設計的現實原因",
            "description": "政策設計現實解析：用白話方式說明政策設計的取捨邏輯，為什麼不可能人人都直接受惠，以及一般民眾該怎麼看政策比較不焦慮。",
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
              "@id": "https://pomodoro-app-eight-rouge.vercel.app/blog/policy-design-reality-explained"
            }
          })}
        </script>
      </Helmet>
    </>
  );
}

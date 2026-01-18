import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import SEO from "../../components/SEO";

export default function SubsidyVisibilityExplainedPage() {
  // 獲取今天的日期（格式：YYYY-MM-DD）
  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <SEO
        title="政府補助為什麼常常看不到？不是沒有，是你不在適用對象"
        description="政府補助可見性完整解析：用白話方式說明補助為什麼不是「全民型」，常見被排除的幾種身分情境，以及一般人該如何正確理解補助存在的方式。"
        keywords="政府補助, 補助適用對象, 補助排除, 政策解釋"
        url="https://pomodoro-app-eight-rouge.vercel.app/blog/subsidy-visibility-explained"
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
              💰 政府補助為什麼常常看不到？不是沒有，是你不在適用對象
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
              很多人覺得「政府補助都看不到」，其實不是沒有補助，而是「你不在適用對象內」。政府補助很少是「全民型」的，通常都有特定的適用對象，如果你不符合條件，就看不到或申請不到。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">補助為什麼不是「全民型」？</h2>
            <p className="mb-4">
              補助不是「全民型」的原因主要有幾個：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>資源有限</strong>：政府的資源有限，不可能給所有人都補助，所以會優先給「最需要的人」</li>
              <li><strong>政策目標</strong>：每個補助都有特定的政策目標，例如幫助低收入戶、鼓勵生育、支持特定產業等</li>
              <li><strong>公平性考量</strong>：如果所有人都補助，可能會讓「不需要的人」也拿到，造成資源浪費</li>
              <li><strong>行政管理</strong>：如果補助範圍太廣，行政管理的成本會很高，而且可能無法有效執行</li>
            </ul>
            <p className="mb-4">
              所以補助通常都有「適用對象」，不是所有人都能申請。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">常見被排除的幾種身分情境</h2>
            <p className="mb-4">
              很多補助會排除以下幾種身分：
            </p>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">情境一：收入超過門檻</h3>
              <p className="mb-4">
                很多補助會設定「收入門檻」，如果你的收入超過這個門檻，就不能申請。例如，某個補助可能只給「家庭年收入 100 萬元以下」的人，如果你的家庭年收入是 120 萬元，就不能申請。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">情境二：財產超過限制</h3>
              <p className="mb-4">
                很多補助會設定「財產限制」，如果你的財產超過這個限制，就不能申請。例如，某個補助可能只給「名下沒有不動產」的人，如果你有房子，就不能申請。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">情境三：身分不符合</h3>
              <p className="mb-4">
                很多補助會限定「特定身分」，如果你不符合這個身分，就不能申請。例如，某個補助可能只給「65 歲以上老人」，如果你還沒 65 歲，就不能申請。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">情境四：戶籍不在指定地區</h3>
              <p className="mb-4">
                很多補助會限定「特定地區」，如果你的戶籍不在這個地區，就不能申請。例如，某個補助可能只給「設籍在台北市」的人，如果你的戶籍在台中，就不能申請。
              </p>
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-4">為什麼很多人覺得「政府都沒幫」？</h2>
            <p className="mb-4">
              這是因為：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>補助不是「全民型」</strong>：很多人以為「所有人都能申請補助」，其實補助通常都有適用對象，如果你不符合條件，就申請不到</li>
              <li><strong>資訊不流通</strong>：很多人不知道有補助，或是不清楚申請條件，所以覺得「政府都沒幫」</li>
              <li><strong>條件太嚴格</strong>：很多補助的條件很嚴格，例如收入門檻、財產限制等，讓很多人覺得「根本申請不到」</li>
              <li><strong>期待過高</strong>：很多人期待「政府應該要幫所有人」，但實際上補助只給「最需要的人」</li>
            </ul>
            <p className="mb-4">
              所以不是「政府都沒幫」，而是「你不在適用對象內」。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">一般人該如何正確理解補助存在的方式</h2>
            <p className="mb-4">
              對一般人來說，理解補助要注意：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>補助不是「全民型」</strong>：補助通常都有適用對象，不是所有人都能申請</li>
              <li><strong>要主動了解</strong>：補助資訊不會自動送到你面前，要主動去了解、查詢</li>
              <li><strong>要看條件</strong>：申請補助前，要先確認自己是否符合條件，不要期待「一定申請得到」</li>
              <li><strong>要理解政策目標</strong>：每個補助都有特定的政策目標，如果你不符合目標對象，就申請不到</li>
            </ul>
            <p className="mb-4">
              建議如果覺得「政府都沒幫」，可以先查詢一下有哪些補助，看看自己是否符合條件。如果不符合，就要理解「補助不是給所有人的」。
            </p>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg my-8">
              <p className="text-gray-700 leading-relaxed">
                <strong>提醒：</strong>補助的適用對象和申請條件會隨著政策調整而改變，實際申請時請以各縣市政府的最新公告為準。建議直接到各縣市政府的網站查詢，或到相關單位詢問。
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
                to="/blog/subsidy-eligibility-explained"
                className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-3xl mb-3">💰</div>
                <h4 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  政府補助怎麼判斷？為什麼別人領得到，你卻不行？一次搞懂常見關鍵條件
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  了解補助申請的關鍵判斷條件，包括身分、收入、居住地、用途等條件
                </p>
              </Link>
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
            </div>
          </div>

          {/* 導流區塊：摘要模組 */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                看不懂補助公告或新聞？
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
                  to="/blog/household-registration-explained"
                  className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <span className="text-2xl mt-1">📋</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                      戶籍遷出遷入有差嗎？為什麼這麼多補助都看戶籍？
                    </h4>
                    <p className="text-sm text-gray-600">
                      了解戶籍在政策中的實際用途，為什麼補助常以戶籍為判斷
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
            "headline": "政府補助為什麼常常看不到？不是沒有，是你不在適用對象",
            "description": "政府補助可見性完整解析：用白話方式說明補助為什麼不是「全民型」，常見被排除的幾種身分情境，以及一般人該如何正確理解補助存在的方式。",
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
              "@id": "https://pomodoro-app-eight-rouge.vercel.app/blog/subsidy-visibility-explained"
            }
          })}
        </script>
      </Helmet>
    </>
  );
}

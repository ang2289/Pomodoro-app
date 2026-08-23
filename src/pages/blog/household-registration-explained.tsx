import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import SEO from "../../components/SEO";
import ArticleCTA from "@/components/ArticleCTA";

export default function HouseholdRegistrationExplainedPage() {
  // 獲取今天的日期（格式：YYYY-MM-DD）
  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <SEO
        title="戶籍遷出遷入有差嗎？為什麼這麼多補助都看戶籍？"
        description="戶籍制度完整解析：用白話方式說明戶籍在政策中的實際用途，為什麼補助常以戶籍為判斷，以及租屋族最常踩到的誤區。"
        keywords="戶籍, 遷出遷入, 補助, 政策解釋"
        url="https://pomodoro-app-eight-rouge.vercel.app/blog/household-registration-explained"
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
              📋 戶籍遷出遷入有差嗎？為什麼這麼多補助都看戶籍？
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
              戶籍是政府在管理人口和分配資源時的重要依據，很多補助、福利、甚至選舉權都跟戶籍有關。很多人以為戶籍只是「登記地址」，其實戶籍在政策中有很多實際用途，遷出遷入確實會有差別。
            </p>

            <ArticleCTA placement="start" focus="summary" />


            <h2 className="text-2xl font-semibold mt-8 mb-4">戶籍在政策中的實際用途</h2>
            <p className="mb-4">
              戶籍在政策中的用途主要有幾個：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>補助申請</strong>：很多補助會要求「設籍在特定縣市」，例如地方政府的補助、學費補助等</li>
              <li><strong>選舉權</strong>：選舉時要在戶籍地投票，如果戶籍遷出，可能無法在原本的地方投票</li>
              <li><strong>就學</strong>：公立學校的入學通常會看戶籍，如果戶籍不在學區內，可能無法入學</li>
              <li><strong>社會福利</strong>：很多社會福利會根據戶籍來判斷，例如老人福利、育兒補助等</li>
              <li><strong>稅務</strong>：某些稅務優惠或減免會看戶籍，例如房屋稅、地價稅等</li>
            </ul>
            <p className="mb-4">
              所以戶籍不只是「登記地址」，而是政府在分配資源和提供服務時的重要依據。
            </p>

            <ArticleCTA placement="middle" focus="summary" />

            <h2 className="text-2xl font-semibold mt-8 mb-4">為什麼補助常以戶籍為判斷？</h2>
            <p className="mb-4">
              補助常以戶籍為判斷的原因主要有幾個：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>資源分配</strong>：地方政府提供的補助，通常只給「設籍在該縣市」的居民，這是為了確保資源分配給「真正住在這裡的人」</li>
              <li><strong>行政管理</strong>：用戶籍來判斷，可以簡化行政流程，不需要每個補助都去查「實際居住地」</li>
              <li><strong>防止重複申請</strong>：用戶籍來判斷，可以防止同一個人重複申請不同縣市的補助</li>
              <li><strong>公平性</strong>：用戶籍來判斷，可以確保補助給「真正需要的人」，而不是「臨時搬來的人」</li>
            </ul>
            <p className="mb-4">
              所以補助常以戶籍為判斷，不是「故意為難」，而是「行政管理的需要」。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">租屋族最常踩到的誤區</h2>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">誤區一：戶籍不重要，實際居住地才重要</h3>
              <p className="mb-4">
                不對。雖然實際居住地很重要，但很多補助、福利、甚至選舉權都跟戶籍有關。如果戶籍不在補助要求的縣市，即使實際住在這裡，也可能無法申請補助。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">誤區二：房東不給遷戶籍，就沒辦法申請補助</h3>
              <p className="mb-4">
                不一定。如果房東不給遷戶籍，你可以：
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>跟房東溝通，說明遷戶籍不會影響房東的權益</li>
                <li>如果房東堅持不給遷，可以考慮換租屋處</li>
                <li>某些補助可能可以用「實際居住證明」來申請，但這要看各縣市的規定</li>
              </ul>
              <p className="mb-4">
                但要注意，如果戶籍不在補助要求的縣市，即使有實際居住證明，也可能無法申請補助。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">誤區三：遷戶籍很麻煩，不遷也沒關係</h3>
              <p className="mb-4">
                不一定。如果戶籍不在你實際居住的縣市，可能會影響：
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>無法申請該縣市的補助</li>
                <li>無法在該縣市投票</li>
                <li>無法讓小孩在該縣市的公立學校就讀</li>
                <li>無法享受該縣市的社會福利</li>
              </ul>
              <p className="mb-4">
                所以如果長期在某個縣市居住，建議把戶籍遷到該縣市，這樣才能享受當地的補助和福利。
              </p>
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-4">一般人該注意的現實影響</h2>
            <p className="mb-4">
              對一般人來說，了解戶籍要注意：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>戶籍很重要</strong>：很多補助、福利、甚至選舉權都跟戶籍有關，不要以為戶籍不重要</li>
              <li><strong>遷戶籍有影響</strong>：如果戶籍不在你實際居住的縣市，可能會影響補助申請、選舉權、就學等</li>
              <li><strong>租屋時要考慮</strong>：如果長期在某個縣市租屋，建議把戶籍遷到該縣市，這樣才能享受當地的補助和福利</li>
              <li><strong>補助要看戶籍</strong>：申請補助時，要先確認戶籍是否在補助要求的縣市，如果不在，可能無法申請</li>
            </ul>
            <p className="mb-4">
              建議如果長期在某個縣市居住，要把戶籍遷到該縣市，這樣才能享受當地的補助和福利。
            </p>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg my-8">
              <p className="text-gray-700 leading-relaxed">
                <strong>提醒：</strong>戶籍遷出遷入的規定和影響會隨著政策調整而改變，實際申請時請以各縣市戶政事務所的最新規定為準。建議直接到戶政事務所詢問，會有專人協助辦理。
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
                to="/blog/long-term-care-subsidy-explained"
                className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-3xl mb-3">👵</div>
                <h4 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  長照補助是什麼？家裡有人需要時，政府實際能幫到哪裡？
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  了解長照補助在補什麼，哪些人比較容易符合，以及常見錯誤期待與實際差異
                </p>
              </Link>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                看不懂戶籍或補助公告？
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
              <li>
                <Link
                  to="/blog/house-tax-explained"
                  className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <span className="text-2xl mt-1">🏠</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                      房屋稅是什麼？自住、出租、空屋差在哪？一般人一定要懂的重點整理
                    </h4>
                    <p className="text-sm text-gray-600">
                      了解自住、出租、空屋在房屋稅認定與稅率上的差異，以及一般房屋持有者需要知道的重點
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
            "headline": "戶籍遷出遷入有差嗎？為什麼這麼多補助都看戶籍？",
            "description": "戶籍制度完整解析：用白話方式說明戶籍在政策中的實際用途，為什麼補助常以戶籍為判斷，以及租屋族最常踩到的誤區。",
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
              "@id": "https://pomodoro-app-eight-rouge.vercel.app/blog/household-registration-explained"
            }
          })}
        </script>
      </Helmet>
    </>
  );
}

import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import SEO from "../../components/SEO";

export default function SubsidyEligibilityExplainedPage() {
  return (
    <>
      <SEO
        title="政府補助怎麼判斷？為什麼別人領得到，你卻不行？一次搞懂常見關鍵條件"
        description="政府補助完整解析：了解補助申請的關鍵判斷條件，包括身分、收入、居住地、用途等條件，快速判斷自己是否符合補助資格。"
        keywords="政府補助, 補助申請, 補助條件, 補助資格, 政策解釋"
        url="https://pomodoro-app-eight-rouge.vercel.app/blog/subsidy-eligibility-explained"
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
              💰 政府補助怎麼判斷？為什麼別人領得到，你卻不行？一次搞懂常見關鍵條件
            </h1>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                政策白話解釋
              </span>
              <span>2026-01-17</span>
            </div>
          </header>

          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <p className="mb-4">
              每當政府推出補助政策，總會看到很多人分享「我有領到」、「這個很好申請」，但實際自己去看公告時，卻常常看不懂，也不知道自己到底符不符合。
            </p>

            <p className="mb-4">
              其實，大多數補助的判斷邏輯都不複雜，只是公告寫法偏向行政用語，讓一般人很難快速理解。
            </p>

            <p className="mb-6">
              以下是補助最常見的幾個判斷關鍵。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">第一，身分條件</h2>
            <p className="mb-4">
              很多補助會限定特定身分，例如學生、青年、長者、身心障礙者、家庭照顧者，或特定職業別。只要身分不符合，後續條件再好也無法申請。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">第二，收入或財產條件</h2>
            <p className="mb-4">
              補助常會搭配所得級距、家庭總收入或名下財產限制。即使你本人收入不高，也可能因為家庭成員而不符合。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">第三，居住地與戶籍</h2>
            <p className="mb-4">
              不少補助是地方政府提供，會要求設籍在特定縣市，或實際居住一定時間以上。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">第四，用途與行為條件</h2>
            <p className="mb-4">
              例如是否實際就學、就業、照顧、租屋或使用特定服務，這些都會影響是否符合補助資格。
            </p>

            {/* 中段導覽區塊 */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-5 rounded-r-lg my-8">
              <p className="text-gray-700 mb-4 leading-relaxed">
                除了補助，稅制與關稅政策也常影響補助資格與生活成本。
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/blog/house-tax-explained"
                  className="inline-flex items-center px-4 py-2 bg-white border border-blue-300 rounded-lg text-blue-700 font-medium hover:bg-blue-100 hover:border-blue-400 transition-all duration-200"
                >
                  <span className="mr-2">🏠</span>
                  房屋稅是什麼？
                </Link>
                <Link
                  to="/blog/taiwan-us-tariff-explained"
                  className="inline-flex items-center px-4 py-2 bg-white border border-blue-300 rounded-lg text-blue-700 font-medium hover:bg-blue-100 hover:border-blue-400 transition-all duration-200"
                >
                  <span className="mr-2">🇺🇸</span>
                  為什麼最近一直在談台美關稅？
                </Link>
              </div>
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-4">很多人不是「不能領」，而是「不知道自己卡在哪一個條件」</h2>
            <p className="mb-4">
              如果你不確定自己到底行不行，其實不需要自己一條一條對照法規。
            </p>

            <p className="mb-6">
              你可以把補助公告或新聞內容貼上來，系統會幫你整理成白話版本，快速告訴你「這個補助跟你有沒有關係」。
            </p>
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
                to="/blog/tariff-adjustment-impact"
                className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-3xl mb-3">💼</div>
                <h4 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  關稅調整會影響哪些東西？一般人會被影響嗎？
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  關稅調整完整解析：了解關稅調整可能影響的項目，包含進口商品價格、汽車、家電、日用品等，用一般人能懂的方式說明對生活的實際影響。
                </p>
              </Link>
              <Link
                to="/blog/232-clause-explained"
                className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-3xl mb-3">📜</div>
                <h4 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  232 條款是什麼？為什麼台灣一直被提到？一次白話解釋
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  232 條款完整解析：了解什麼是 232 條款，為何與國家安全、進口關稅有關，以及為什麼台灣會被頻繁提及。
                </p>
              </Link>
            </div>
          </div>

          {/* 導流區塊：摘要模組 */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                不確定補助能不能申請？
              </h3>
              <p className="text-gray-700 mb-6">
                把補助公告貼上來，幫你快速判斷是否符合基本條件
              </p>
              <Link
                to="/summary"
                className="inline-block px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg drop-shadow-md"
              >
                貼上公告，幫我判斷
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
                  to="/blog/taiwan-us-tariff-explained"
                  className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <span className="text-2xl mt-1">🇺🇸</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                      為什麼最近一直在談台美關稅？跟你我有什麼關係？
                    </h4>
                    <p className="text-sm text-gray-600">
                      整理近期新聞常出現「台美關稅」的原因，說明政府、產業與一般民眾的關聯差異
                    </p>
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  to="/blog/tariff-adjustment-impact"
                  className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <span className="text-2xl mt-1">💼</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                      關稅調整會影響哪些東西？一般人會被影響嗎？
                    </h4>
                    <p className="text-sm text-gray-600">
                      了解關稅調整可能影響的項目，包含進口商品價格、汽車、家電、日用品等
                    </p>
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  to="/blog/232-clause-explained"
                  className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <span className="text-2xl mt-1">📜</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                      232 條款是什麼？為什麼台灣一直被提到？一次白話解釋
                    </h4>
                    <p className="text-sm text-gray-600">
                      了解什麼是 232 條款，為何與國家安全、進口關稅有關，以及為什麼台灣會被頻繁提及
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
              <li>
                <Link
                  to="/blog/car-import-tariff-explained"
                  className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <span className="text-2xl mt-1">🚗</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                      汽車關稅是什麼？會影響車價嗎？一般人一定要懂的重點整理（2026 最新）
                    </h4>
                    <p className="text-sm text-gray-600">
                      了解進口車關稅如何計算、對車價的影響，以及一般消費者需要知道的重點
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
            "headline": "政府補助怎麼判斷？為什麼別人領得到，你卻不行？一次搞懂常見關鍵條件",
            "description": "政府補助完整解析：了解補助申請的關鍵判斷條件，包括身分、收入、居住地、用途等條件，快速判斷自己是否符合補助資格。",
            "author": {
              "@type": "Organization",
              "name": "AI 工具與生活服務中心"
            },
            "publisher": {
              "@type": "Organization",
              "name": "AI 工具與生活服務中心"
            },
            "datePublished": "2026-01-17",
            "dateModified": "2026-01-17",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://pomodoro-app-eight-rouge.vercel.app/blog/subsidy-eligibility-explained"
            }
          })}
        </script>
      </Helmet>
    </>
  );
}

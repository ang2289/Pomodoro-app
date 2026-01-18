import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import SEO from "../../components/SEO";

export default function Clause232ExplainedPage() {
  return (
    <>
      <SEO
        title="232 條款是什麼？為什麼台灣一直被提到？一次白話解釋"
        description="232 條款完整解析：了解什麼是 232 條款，為何與國家安全、進口關稅有關，以及為什麼台灣會被頻繁提及。用一般人能懂的方式說明對生活的影響。"
        keywords="232 條款, 國家安全, 進口關稅, 台灣, 政策解釋"
        url="https://pomodoro-app-eight-rouge.vercel.app/blog/232-clause-explained"
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
              📜 232 條款是什麼？為什麼台灣一直被提到？一次白話解釋
            </h1>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                政策白話解釋
              </span>
              <span>2026-01-18</span>
            </div>
          </header>

          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <p className="mb-4">
              232 條款是美國貿易法中的一個條款，主要與國家安全和進口關稅有關。近年來，這個條款經常在新聞中被提及，特別是與台灣相關的討論。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">什麼是 232 條款？</h2>
            <p className="mb-4">
              232 條款是美國《1962 年貿易擴展法》（Trade Expansion Act of 1962）中的一個條款，允許美國總統在認為進口商品對國家安全構成威脅時，可以對這些商品加徵關稅或實施其他貿易限制措施。
            </p>

            <p className="mb-4">
              這個條款的設計初衷是保護美國的國家安全，但實際上也被用於保護國內產業，特別是鋼鐵、鋁等關鍵產業。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">為什麼與台灣有關？</h2>
            <p className="mb-4">
              台灣之所以經常被提及，主要有幾個原因：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>台灣是重要的半導體和電子產品製造基地，許多產品出口到美國</li>
              <li>在美中貿易關係緊張的背景下，台灣的戰略地位更加突出</li>
              <li>如果美國對特定商品實施 232 條款關稅，可能影響台灣相關產業的出口</li>
              <li>台灣的產業結構與全球供應鏈緊密相連，任何貿易政策調整都可能產生連鎖反應</li>
            </ul>

            {/* 中段導覽區塊 */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-5 rounded-r-lg my-8">
              <p className="text-gray-700 mb-4 leading-relaxed">
                如果你對關稅相關議題還不熟，可以一起看這幾篇白話整理。
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/blog/taiwan-us-tariff-explained"
                  className="inline-flex items-center px-4 py-2 bg-white border border-blue-300 rounded-lg text-blue-700 font-medium hover:bg-blue-100 hover:border-blue-400 transition-all duration-200"
                >
                  <span className="mr-2">🇺🇸</span>
                  為什麼最近一直在談台美關稅？
                </Link>
                <Link
                  to="/blog/tariff-adjustment-impact"
                  className="inline-flex items-center px-4 py-2 bg-white border border-blue-300 rounded-lg text-blue-700 font-medium hover:bg-blue-100 hover:border-blue-400 transition-all duration-200"
                >
                  <span className="mr-2">💼</span>
                  關稅調整會影響哪些東西？
                </Link>
              </div>
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-4">這跟你有沒有直接關係？</h2>
            <p className="mb-4">
              雖然 232 條款看起來是國際貿易政策，但實際上可能影響一般人的生活：
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">物價層面</h3>
            <p className="mb-4">
              如果 232 條款導致進口商品關稅提高，這些成本可能會轉嫁到消費者身上，讓日常用品的價格上漲。例如，如果鋼鐵或鋁製品關稅提高，使用這些原料的產品（如汽車、家電、建築材料）價格可能會上升。
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">產業層面</h3>
            <p className="mb-4">
              對於在相關產業工作的台灣人來說，232 條款的實施可能直接影響工作機會和產業發展。如果台灣的出口產品被加徵關稅，相關企業的競爭力可能下降，進而影響就業市場。
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">工作層面</h3>
            <p className="mb-4">
              在電子、半導體、鋼鐵、機械等相關產業工作的上班族，可能會感受到訂單變化、公司營運調整等影響。如果產業受到衝擊，可能影響薪資、獎金，甚至工作穩定性。
            </p>

            <p className="mb-6">
              不過，這些影響通常是間接且漸進的，不會立即對個人生活造成明顯變化。重要的是了解政策動向，以便提前做好準備。
            </p>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg mb-6">
              <p className="text-sm text-gray-700">
                <strong>提醒：</strong>若政策調整，實際適用仍以政府公告為準。
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
                to="/blog/taiwan-us-tariff-explained"
                className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-3xl mb-3">🇺🇸</div>
                <h4 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  為什麼最近一直在談台美關稅？跟你我有什麼關係？
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  台美關稅完整解析：整理近期新聞常出現「台美關稅」的原因，說明政府、產業與一般民眾的關聯差異，並加入常見誤解 Q&A。
                </p>
              </Link>
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
            "headline": "232 條款是什麼？為什麼台灣一直被提到？一次白話解釋",
            "description": "232 條款完整解析：了解什麼是 232 條款，為何與國家安全、進口關稅有關，以及為什麼台灣會被頻繁提及。用一般人能懂的方式說明對生活的影響。",
            "author": {
              "@type": "Organization",
              "name": "AI 工具與生活服務中心"
            },
            "publisher": {
              "@type": "Organization",
              "name": "AI 工具與生活服務中心"
            },
            "datePublished": "2026-01-18",
            "dateModified": "2026-01-18",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://pomodoro-app-eight-rouge.vercel.app/blog/232-clause-explained"
            }
          })}
        </script>
      </Helmet>
    </>
  );
}

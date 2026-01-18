import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import SEO from "../../components/SEO";

export default function TariffAdjustmentImpactPage() {
  return (
    <>
      <SEO
        title="關稅調整會影響哪些東西？一般人會被影響嗎？"
        description="關稅調整完整解析：了解關稅調整可能影響的項目，包含進口商品價格、汽車、家電、日用品等，用一般人能懂的方式說明對生活的實際影響。"
        keywords="關稅調整, 進口商品, 汽車關稅, 家電價格, 日用品價格, 政策解釋"
        url="https://pomodoro-app-eight-rouge.vercel.app/blog/tariff-adjustment-impact"
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
              💼 關稅調整會影響哪些東西？一般人會被影響嗎？
            </h1>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                政策白話解釋
              </span>
              <span>2026-01-19</span>
            </div>
          </header>

          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <p className="mb-4">
              每當新聞提到「關稅調整」，很多人會想：這跟我有關係嗎？我會感覺到什麼變化嗎？
            </p>

            <p className="mb-4">
              其實，關稅調整確實可能影響一般人的生活，但影響的程度和方式，取決於你平常買什麼、用什麼。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">你可能會感覺到的影響</h2>

            {/* 中段導覽區塊 */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-5 rounded-r-lg my-8">
              <p className="text-gray-700 mb-4 leading-relaxed">
                如果你對關稅相關議題還不熟，可以一起看這幾篇白話整理。
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/blog/232-clause-explained"
                  className="inline-flex items-center px-4 py-2 bg-white border border-blue-300 rounded-lg text-blue-700 font-medium hover:bg-blue-100 hover:border-blue-400 transition-all duration-200"
                >
                  <span className="mr-2">📜</span>
                  232 條款是什麼？
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

            <h3 className="text-xl font-semibold mt-6 mb-3">進口商品價格上漲</h3>
            <p className="mb-4">
              如果關稅提高，進口商品的成本會增加，這些成本通常會轉嫁到消費者身上。你可能會發現：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>進口品牌的商品變貴了</li>
              <li>原本想買的進口商品，價格超出預算</li>
              <li>需要重新考慮是否購買，或尋找替代品</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">汽車價格變化</h3>
            <p className="mb-4">
              如果你正在考慮買車，特別是進口車，關稅調整可能會直接影響你的購車預算：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>進口車的價格可能上漲</li>
              <li>原本看好的車款，可能需要增加預算</li>
              <li>部分車商可能會調整促銷方案或優惠</li>
            </ul>
            <p className="mb-4">
              不過，如果你已經有車，或短期內沒有買車計畫，這個影響可能不會立即感受到。
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">家電價格波動</h3>
            <p className="mb-4">
              家電是很多家庭會定期購買的商品，關稅調整可能影響：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>進口家電品牌（如日系、韓系、歐系）的價格</li>
              <li>大型家電（冰箱、洗衣機、冷氣）的購買成本</li>
              <li>小型家電（咖啡機、吸塵器、空氣清淨機）的價格</li>
            </ul>
            <p className="mb-4">
              如果你剛好要換家電，可能會明顯感受到價格變化。但如果家電還能正常使用，這個影響可能暫時與你無關。
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">日用品價格微調</h3>
            <p className="mb-4">
              部分進口日用品可能因為關稅調整而漲價，例如：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>進口食品、零食、飲料</li>
              <li>進口化妝品、保養品</li>
              <li>進口服飾、配件</li>
              <li>進口文具、生活用品</li>
            </ul>
            <p className="mb-4">
              這些商品的價格變化通常比較細微，你可能會慢慢感覺到，但不會突然大幅上漲。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">你可能感覺不到的影響</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">產業鏈的間接影響</h3>
            <p className="mb-4">
              關稅調整可能影響整個產業鏈，但這些影響通常是間接的，一般人不容易立即察覺：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>相關產業的工作機會可能受到影響</li>
              <li>公司營運成本變化，可能影響員工福利或薪資調整</li>
              <li>市場競爭格局改變，長期可能影響商品選擇</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">如果你主要使用國產商品</h3>
            <p className="mb-4">
              如果你平常主要購買國產商品，關稅調整對你的直接影響可能很小：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>國產商品的價格通常不受進口關稅影響</li>
              <li>你的日常消費習慣可能不會有明顯變化</li>
              <li>但要注意，部分國產商品可能使用進口原料，間接受到影響</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">如何應對關稅調整的影響？</h2>
            <p className="mb-4">
              如果你擔心關稅調整會影響你的生活，可以考慮：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>關注相關商品的價格變化，提前規劃大額消費</li>
              <li>比較進口與國產商品的性價比，選擇最適合自己的選項</li>
              <li>不急著購買的商品，可以觀察價格走勢再決定</li>
              <li>了解政策動向，但不需要過度焦慮</li>
            </ul>

            <p className="mb-6">
              最重要的是，關稅調整的影響通常是漸進的，不會突然大幅改變你的生活。保持平常心，根據實際需求做決定即可。
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
            "headline": "關稅調整會影響哪些東西？一般人會被影響嗎？",
            "description": "關稅調整完整解析：了解關稅調整可能影響的項目，包含進口商品價格、汽車、家電、日用品等，用一般人能懂的方式說明對生活的實際影響。",
            "author": {
              "@type": "Organization",
              "name": "AI 工具與生活服務中心"
            },
            "publisher": {
              "@type": "Organization",
              "name": "AI 工具與生活服務中心"
            },
            "datePublished": "2026-01-19",
            "dateModified": "2026-01-19",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://pomodoro-app-eight-rouge.vercel.app/blog/tariff-adjustment-impact"
            }
          })}
        </script>
      </Helmet>
    </>
  );
}

import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import SEO from "../../components/SEO";

export default function TaiwanUSTariffExplainedPage() {
  return (
    <>
      <SEO
        title="為什麼最近一直在談台美關稅？跟你我有什麼關係？"
        description="台美關稅完整解析：整理近期新聞常出現「台美關稅」的原因，說明政府、產業與一般民眾的關聯差異，並加入常見誤解 Q&A，幫助讀者快速判斷這是不是需要關注的議題。"
        keywords="台美關稅, 台灣美國關稅, 貿易政策, 關稅談判, 政策解釋"
        url="https://pomodoro-app-eight-rouge.vercel.app/blog/taiwan-us-tariff-explained"
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
              🇺🇸 為什麼最近一直在談台美關稅？跟你我有什麼關係？
            </h1>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                政策白話解釋
              </span>
              <span>2026-01-20</span>
            </div>
          </header>

          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <p className="mb-4">
              最近新聞經常提到「台美關稅」，很多人可能會好奇：為什麼突然這麼多討論？這跟我有什麼關係嗎？
            </p>

            <p className="mb-4">
              其實，台美關稅議題之所以頻繁出現，背後有幾個重要原因，而這些原因對不同層面的人，影響程度也不同。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">為什麼最近一直在談台美關稅？</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">國際貿易環境變化</h3>
            <p className="mb-4">
              全球貿易環境持續變化，各國都在重新評估貿易關係。台灣與美國作為重要的貿易夥伴，關稅議題自然成為討論焦點。
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">產業競爭與供應鏈調整</h3>
            <p className="mb-4">
              台灣在電子、半導體、機械等產業具有重要地位，這些產業的產品出口到美國時，關稅政策會直接影響競爭力。隨著供應鏈調整，關稅議題更受關注。
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">政策協商與談判</h3>
            <p className="mb-4">
              台美之間持續進行各種貿易協商，關稅是其中重要議題。這些協商過程中的討論和進展，會反映在新聞報導中。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">對不同層面的影響差異</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">政府層面</h3>
            <p className="mb-4">
              對政府來說，關稅議題涉及：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>貿易談判與外交關係</li>
              <li>產業政策與經濟發展</li>
              <li>國家競爭力與國際地位</li>
            </ul>
            <p className="mb-4">
              這是政府需要積極處理的重要議題，但對一般民眾來說，這些層面的影響通常是間接的。
            </p>

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
                  to="/blog/tariff-adjustment-impact"
                  className="inline-flex items-center px-4 py-2 bg-white border border-blue-300 rounded-lg text-blue-700 font-medium hover:bg-blue-100 hover:border-blue-400 transition-all duration-200"
                >
                  <span className="mr-2">💼</span>
                  關稅調整會影響哪些東西？
                </Link>
              </div>
            </div>

            <h3 className="text-xl font-semibold mt-6 mb-3">產業層面</h3>
            <p className="mb-4">
              對相關產業來說，關稅調整可能直接影響：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>出口產品的價格競爭力</li>
              <li>企業營運成本與獲利</li>
              <li>市場拓展與訂單變化</li>
            </ul>
            <p className="mb-4">
              如果你在相關產業工作，可能會感受到公司營運調整、訂單變化等影響。但這些影響通常是漸進的，不會突然大幅改變。
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">一般民眾層面</h3>
            <p className="mb-4">
              對一般民眾來說，台美關稅的影響通常是間接且漸進的：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>如果關稅調整影響進口商品，可能間接影響物價</li>
              <li>如果相關產業受到影響，可能影響就業市場</li>
              <li>但這些影響通常需要時間才會顯現，不會立即改變日常生活</li>
            </ul>
            <p className="mb-4">
              大多數人可能不會立即感受到明顯變化，除非你剛好要購買受影響的商品，或在相關產業工作。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">常見誤解 Q&A</h2>

            <div className="space-y-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Q1：台美關稅調整，是不是代表所有進口商品都會漲價？
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  <strong>A：</strong>不一定。關稅調整通常針對特定商品或產業，不是所有進口商品都會受到影響。即使有影響，價格變化也需要時間才會反映在市場上，而且可能只影響部分商品。
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Q2：我應該現在就開始囤貨或改變消費習慣嗎？
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  <strong>A：</strong>通常不需要。關稅調整的影響是漸進的，不會突然大幅改變。除非你剛好要進行大額消費（如買車、大型家電），否則不需要特別改變日常消費習慣。
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Q3：這是不是代表台灣經濟會受到很大衝擊？
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  <strong>A：</strong>不一定。關稅議題是持續協商的過程，通常會有各種配套措施和緩衝期。而且台灣經濟結構多元，單一關稅調整的影響通常是局部的，不會全面衝擊整體經濟。
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Q4：我需要特別關注這個議題嗎？
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  <strong>A：</strong>取決於你的情況。如果你在相關產業工作、近期有大額消費計畫，或對貿易政策有興趣，可以適度關注。但對大多數人來說，不需要過度焦慮，保持平常心即可。
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-4">如何判斷這是不是需要關注的議題？</h2>
            <p className="mb-4">
              你可以根據以下幾點來判斷：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>你是否在相關產業工作？如果是，可以適度關注產業動態</li>
              <li>你近期是否有大額消費計畫（如買車、大型家電）？如果是，可以關注相關商品價格變化</li>
              <li>你對貿易政策或國際關係有興趣嗎？如果是，可以作為了解時事的參考</li>
              <li>如果以上都不是，通常不需要特別關注，保持平常心即可</li>
            </ul>

            <p className="mb-6">
              最重要的是，關稅議題的影響通常是漸進且局部的，不會突然大幅改變一般人的生活。了解基本概念即可，不需要過度焦慮。
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
            "headline": "為什麼最近一直在談台美關稅？跟你我有什麼關係？",
            "description": "台美關稅完整解析：整理近期新聞常出現「台美關稅」的原因，說明政府、產業與一般民眾的關聯差異，並加入常見誤解 Q&A，幫助讀者快速判斷這是不是需要關注的議題。",
            "author": {
              "@type": "Organization",
              "name": "AI 工具與生活服務中心"
            },
            "publisher": {
              "@type": "Organization",
              "name": "AI 工具與生活服務中心"
            },
            "datePublished": "2026-01-20",
            "dateModified": "2026-01-20",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://pomodoro-app-eight-rouge.vercel.app/blog/taiwan-us-tariff-explained"
            }
          })}
        </script>
      </Helmet>
    </>
  );
}

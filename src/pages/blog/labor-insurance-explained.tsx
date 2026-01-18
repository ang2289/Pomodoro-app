import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import SEO from "../../components/SEO";

export default function LaborInsuranceExplainedPage() {
  // 獲取今天的日期（格式：YYYY-MM-DD）
  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <SEO
        title="勞保是什麼？你每個月繳的錢到底保障了哪些事情？"
        description="勞保完整解析：了解勞保在保什麼，包括生病、失能、退休各怎麼用，以及為什麼很多人快退休才發現不夠，用白話方式一次澄清常見迷思。"
        keywords="勞保, 勞工保險, 退休金, 失能給付, 政策解釋"
        url="https://pomodoro-app-eight-rouge.vercel.app/blog/labor-insurance-explained"
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
              🛡️ 勞保是什麼？你每個月繳的錢到底保障了哪些事情？
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
              勞保（勞工保險）是政府強制雇主幫員工投保的社會保險，每個月從你的薪水裡扣一部分錢，雇主也要出一部分。這筆錢主要保障你在工作期間可能遇到的各種風險，包括生病、受傷、失能、死亡、生育，還有最重要的退休。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">勞保在保什麼？</h2>
            <p className="mb-4">
              勞保主要保障以下幾種情況：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>普通傷病</strong>：如果因為生病或受傷不能工作，可以請領傷病給付</li>
              <li><strong>職業災害</strong>：如果因為工作受傷或生病，保障更完整</li>
              <li><strong>失能</strong>：如果因為受傷或生病導致失能，可以請領失能給付</li>
              <li><strong>死亡</strong>：如果不幸死亡，家屬可以請領死亡給付</li>
              <li><strong>生育</strong>：女性員工生產可以請領生育給付</li>
              <li><strong>老年給付（退休金）</strong>：這是最多人關心的，退休後可以按月領或一次領</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">生病、失能、退休各怎麼用？</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">生病時：</h3>
            <p className="mb-4">
              如果因為普通傷病住院，不能工作也沒有薪水，可以請領「普通傷病給付」。通常是住院第 4 天開始，按你平均月投保薪資的 50% 給付，最多可以領 6 個月。
            </p>
            <p className="mb-4">
              如果是因為工作受傷或職業病，可以請領「職業災害傷病給付」，保障更完整，給付比例也更高。
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">失能時：</h3>
            <p className="mb-4">
              如果因為受傷或生病導致失能，可以請領「失能給付」。失能程度分為 15 個等級，最嚴重的是第 1 級，可以一次領到 1,200 日的平均月投保薪資。
            </p>
            <p className="mb-4">
              如果是職業災害導致的失能，給付標準會更高。
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">退休時：</h3>
            <p className="mb-4">
              這是勞保最重要的保障。退休時可以選擇：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>一次請領</strong>：把累積的年資換算成一次性的退休金</li>
              <li><strong>按月領（年金）</strong>：每個月領固定的金額，領到過世為止</li>
            </ul>
            <p className="mb-4">
              一般來說，如果年資夠長，按月領會比較划算，因為可以領一輩子。但如果你有其他規劃，也可以選擇一次領。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">為什麼很多人快退休才發現不夠？</h2>
            <p className="mb-4">
              這是因為很多人對勞保的退休金有誤解：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>以為勞保就夠用</strong>：其實勞保的退休金通常不夠維持退休後的生活，需要搭配其他儲蓄或投資</li>
              <li><strong>投保薪資太低</strong>：如果雇主用最低的投保薪資幫你投保，退休金就會比較少</li>
              <li><strong>年資中斷</strong>：如果換工作時有中斷投保，年資會重新計算，影響退休金</li>
              <li><strong>沒有提早規劃</strong>：很多人以為有勞保就夠了，沒有另外存退休金，等到快退休才發現不夠</li>
            </ul>
            <p className="mb-4">
              勞保的退休金只是基本保障，如果想要過更好的退休生活，還是需要自己另外儲蓄或投資。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">常見迷思一次澄清</h2>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">迷思一：勞保退休金就是全部退休金</h3>
              <p className="mb-4">
                不對。勞保只是基本保障，通常不夠維持退休後的生活。建議還是要另外存退休金，例如勞退新制、個人儲蓄、投資等。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">迷思二：投保薪資越高越好</h3>
              <p className="mb-4">
                對，但不完全對。投保薪資高，退休金確實會比較多，但每個月要繳的保費也會比較多。而且投保薪資不能超過「最高投保薪資級距」，目前是 45,800 元。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">迷思三：換工作會影響退休金</h3>
              <p className="mb-4">
                會，但影響不大。如果換工作時有中斷投保，年資會重新計算，但之前的年資不會消失。只要新工作也有投保，年資會繼續累積。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">迷思四：勞保和勞退是一樣的</h3>
              <p className="mb-4">
                不一樣。勞保是「保險」，保障工作期間的各種風險；勞退是「退休金制度」，是雇主另外幫你存的退休金。兩者是分開的，退休時可以同時領。
              </p>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg my-8">
              <p className="text-gray-700 leading-relaxed">
                <strong>提醒：</strong>勞保的給付標準和計算方式會隨著政策調整而改變，實際請領時請以勞保局的最新規定為準。建議定期查詢自己的勞保年資和投保薪資，提早規劃退休生活。
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
                to="/blog/income-tax-brackets-explained"
                className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-3xl mb-3">💰</div>
                <h4 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  所得稅級距是什麼？為什麼加薪反而繳更多稅？一次白話說清楚
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  用白話方式解釋什麼是所得稅級距，為什麼不是全部收入都用最高稅率
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

          {/* 導流區塊：摘要模組 */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                看不懂勞保或社會保險公告？
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
            "headline": "勞保是什麼？你每個月繳的錢到底保障了哪些事情？",
            "description": "勞保完整解析：了解勞保在保什麼，包括生病、失能、退休各怎麼用，以及為什麼很多人快退休才發現不夠，用白話方式一次澄清常見迷思。",
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
              "@id": "https://pomodoro-app-eight-rouge.vercel.app/blog/labor-insurance-explained"
            }
          })}
        </script>
      </Helmet>
    </>
  );
}

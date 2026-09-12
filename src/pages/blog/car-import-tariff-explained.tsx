import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import SEO from "../../components/SEO";
import ArticleCTA from "@/components/ArticleCTA";

export default function CarImportTariffExplainedPage() {
  return (
    <>
      <SEO
        title="汽車關稅是什麼？會影響車價嗎？一般人一定要懂的重點整理（2026 最新）"
        description="汽車關稅完整解析：了解進口車關稅如何計算、對車價的影響，以及一般消費者需要知道的重點。"
        keywords="汽車關稅, 進口車關稅, 車價, 關稅計算, 政策解釋"
        url="https://pomodoro-app-eight-rouge.vercel.app/blog/car-import-tariff-explained"
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
              🚗 汽車關稅是什麼？會影響車價嗎？一般人一定要懂的重點整理（2026 最新）
            </h1>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                政策白話解釋
              </span>
              <span>2026-01-15</span>
            </div>
          </header>

          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            {/* TODO: 請在此處填入《汽車關稅》完整文章正文 */}
            <p className="mb-4">
              這篇文章將為你詳細解釋汽車關稅的運作方式，以及它如何影響你購買的車價。
            </p>

            <ArticleCTA placement="start" focus="summary" />

            <h2 className="text-2xl font-semibold mt-8 mb-4">什麼是汽車關稅？</h2>
            <p className="mb-4">
              汽車關稅是政府對進口汽車課徵的稅費，主要目的是保護國內汽車產業，同時也是政府的重要稅收來源。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">關稅如何影響車價？</h2>
            <p className="mb-4">
              進口車的關稅會直接反映在最終售價上，通常會讓進口車的價格比原產地高出一定比例。
            </p>

            <ArticleCTA placement="middle" focus="summary" />

            <h2 className="text-2xl font-semibold mt-8 mb-4">一般消費者需要知道的重點</h2>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>關稅會影響進口車的價格</li>
              <li>不同排氣量的車輛關稅率可能不同</li>
              <li>除了關稅，還有其他稅費會影響最終車價</li>
            </ul>

            {/* 文章正文內容請在此處填入 */}
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
              <Link
                to="/blog/subsidy-eligibility-explained"
                className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-3xl mb-3">💰</div>
                <h4 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  政府補助怎麼判斷？為什麼別人領得到，你卻不行？一次搞懂常見關鍵條件
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  政府補助完整解析：了解補助申請的關鍵判斷條件，包括身分、收入、居住地、用途等條件，快速判斷自己是否符合補助資格。
                </p>
              </Link>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                看不懂新聞？其實你不用自己研究
              </h3>
              <p className="text-gray-700 mb-6">
                把政策或新聞貼上來，幫你整理成「跟你有關的重點」
              </p>
              <Link
                to="/summary"
                className="inline-block bg-blue-600 text-white px-5 py-3 rounded-lg text-base font-medium hover:bg-blue-700 transition"
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
            "headline": "汽車關稅是什麼？會影響車價嗎？一般人一定要懂的重點整理（2026 最新）",
            "description": "汽車關稅完整解析：了解進口車關稅如何計算、對車價的影響，以及一般消費者需要知道的重點。",
            "author": {
              "@type": "Organization",
              "name": "AI 工具與生活服務中心"
            },
            "publisher": {
              "@type": "Organization",
              "name": "AI 工具與生活服務中心"
            },
            "datePublished": "2026-01-15",
            "dateModified": "2026-01-15",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://pomodoro-app-eight-rouge.vercel.app/blog/car-import-tariff-explained"
            }
          })}
        </script>
      </Helmet>
    </>
  );
}

import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import SEO from "../../components/SEO";
import ArticleCTA from "@/components/ArticleCTA";

export default function MinimumWageExplainedPage() {
  // 獲取今天的日期（格式：YYYY-MM-DD）
  const today = new Date().toISOString().split('T')[0];
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Q1：基本工資調整後，我的薪水會自動調高嗎？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A：如果你的薪水已經高於基本工資，通常不會自動調高。但如果你的薪水剛好在基本工資邊緣或低於基本工資，雇主必須調高到至少符合新標準。不過，有些公司會因為基本工資調整，連帶調整其他員工的薪水，這要看公司的政策。",
        },
      },
      {
        "@type": "Question",
        name: "Q2：基本工資調整會影響加班費嗎？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A：會。因為加班費的計算基礎是「平日每小時工資額」，如果基本工資調高，你的時薪基礎也會跟著提高，加班費自然也會增加。例如，平日加班前 2 小時是 1.34 倍，如果時薪基礎提高，加班費也會提高。",
        },
      },
      {
        "@type": "Question",
        name: "Q3：如果雇主沒有調高到基本工資標準，該怎麼辦？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A：如果雇主給你的薪水低於基本工資，這是違法的。你可以：向勞動部或地方勞工局申訴、要求雇主補足差額、如果雇主不配合，可以申請勞資爭議調解或提起訴訟。基本工資是法律強制規定，雇主不能以任何理由不遵守。",
        },
      },
    ],
  };

  return (
    <>
      <SEO
        title="什麼是基本工資？調整後老闆與員工各自會遇到什麼影響？"
        description="基本工資完整解析：了解基本工資的定義、為什麼每年會調整，以及對月薪制、時薪制的實際差異，用一般上班族看得懂的方式說明。"
        keywords="基本工資, 最低工資, 月薪制, 時薪制, 政策解釋"
        url="https://pomodoro-app-eight-rouge.vercel.app/blog/minimum-wage-explained"
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
              💼 什麼是基本工資？調整後老闆與員工各自會遇到什麼影響？
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
              基本工資是政府規定的最低工資標準，不管是月薪制還是時薪制，雇主給員工的薪水都不能低於這個標準。每年政府會根據物價、經濟狀況等因素調整基本工資，這會直接影響到很多上班族的收入。
            </p>

            <ArticleCTA placement="start" focus="summary" />


            <h2 className="text-2xl font-semibold mt-8 mb-4">什麼是基本工資？</h2>
            <p className="mb-4">
              基本工資就是法律規定的最低工資標準，分為兩種：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>月薪制基本工資</strong>：全職員工每個月的最低工資</li>
              <li><strong>時薪制基本工資</strong>：按時計薪員工每小時的最低工資</li>
            </ul>
            <p className="mb-4">
              不管你是正職、兼職、還是工讀生，只要是在台灣工作，雇主給你的薪水都不能低於基本工資。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">為什麼每年會調整？</h2>
            <p className="mb-4">
              基本工資每年調整的原因主要有幾個：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>物價上漲</strong>：如果物價一直漲，但工資不漲，員工的購買力就會下降</li>
              <li><strong>經濟成長</strong>：如果經濟狀況好，通常會調高基本工資，讓員工也能分享經濟成長的成果</li>
              <li><strong>就業市場狀況</strong>：考慮失業率、就業率等指標，平衡勞工權益與企業成本</li>
            </ul>
            <p className="mb-4">
              政府會組成「基本工資審議委員會」，由勞方、資方、政府、學者等代表一起討論，決定當年度要不要調整、調整多少。
            </p>

            <ArticleCTA placement="middle" focus="summary" />

            <h2 className="text-2xl font-semibold mt-8 mb-4">對月薪制、時薪制的實際差異</h2>
            <p className="mb-4">
              <strong>月薪制員工：</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>如果你的月薪已經高於基本工資，調整後通常不會直接影響你的薪水</li>
              <li>但如果你的月薪剛好在基本工資邊緣，調整後雇主必須跟著調高</li>
              <li>有些公司會因為基本工資調整，連帶調整其他員工的薪水，維持內部薪資結構</li>
            </ul>
            <p className="mb-4">
              <strong>時薪制員工：</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>時薪制基本工資調整後，你的時薪必須至少達到新標準</li>
              <li>這對兼職、工讀生、服務業等按時計薪的工作影響最直接</li>
              <li>如果原本時薪低於新標準，雇主必須立即調高</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">一般勞工最關心的 3 個問題</h2>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">Q1：基本工資調整後，我的薪水會自動調高嗎？</h3>
              <p className="mb-4">
                A：如果你的薪水已經高於基本工資，通常不會自動調高。但如果你的薪水剛好在基本工資邊緣或低於基本工資，雇主必須調高到至少符合新標準。不過，有些公司會因為基本工資調整，連帶調整其他員工的薪水，這要看公司的政策。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">Q2：基本工資調整會影響加班費嗎？</h3>
              <p className="mb-4">
                A：會。因為加班費的計算基礎是「平日每小時工資額」，如果基本工資調高，你的時薪基礎也會跟著提高，加班費自然也會增加。例如，平日加班前 2 小時是 1.34 倍，如果時薪基礎提高，加班費也會提高。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">Q3：如果雇主沒有調高到基本工資標準，該怎麼辦？</h3>
              <p className="mb-4">
                A：如果雇主給你的薪水低於基本工資，這是違法的。你可以：
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>向勞動部或地方勞工局申訴</li>
                <li>要求雇主補足差額</li>
                <li>如果雇主不配合，可以申請勞資爭議調解或提起訴訟</li>
              </ul>
              <p className="mb-4">
                基本工資是法律強制規定，雇主不能以任何理由不遵守。
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
                to="/blog/labor-insurance-explained"
                className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-3xl mb-3">🛡️</div>
                <h4 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  勞保是什麼？你每個月繳的錢到底保障了哪些事情？
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  了解勞保的保障範圍，包括生病、失能、退休等各種情況的保障內容
                </p>
              </Link>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                看不懂勞工政策公告或新聞？
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
                  to="/blog/labor-insurance-explained"
                  className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <span className="text-2xl mt-1">🛡️</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                      勞保是什麼？你每個月繳的錢到底保障了哪些事情？
                    </h4>
                    <p className="text-sm text-gray-600">
                      了解勞保的保障範圍，包括生病、失能、退休等各種情況的保障內容
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
            "headline": "什麼是基本工資？調整後老闆與員工各自會遇到什麼影響？",
            "description": "基本工資完整解析：了解基本工資的定義、為什麼每年會調整，以及對月薪制、時薪制的實際差異，用一般上班族看得懂的方式說明。",
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
              "@id": "https://pomodoro-app-eight-rouge.vercel.app/blog/minimum-wage-explained"
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(faqJsonLd)}
        </script>
      </Helmet>
    </>
  );
}

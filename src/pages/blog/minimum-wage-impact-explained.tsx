import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import SEO from "../../components/SEO";

export default function MinimumWageImpactExplainedPage() {
  // 獲取今天的日期（格式：YYYY-MM-DD）
  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <SEO
        title="基本工資是什麼？為什麼調整後有人加薪、有人卻更辛苦？"
        description="基本工資調整影響完整解析：用白話方式說明基本工資的設計目的，調整後對不同身分的實際影響，以及為什麼不是所有人都直接受惠。"
        keywords="基本工資, 最低工資, 工資調整, 政策解釋"
        url="https://pomodoro-app-eight-rouge.vercel.app/blog/minimum-wage-impact-explained"
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
              💰 基本工資是什麼？為什麼調整後有人加薪、有人卻更辛苦？
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
              基本工資是政府規定的最低工資標準，每年調整時，有些人會加薪，有些人卻可能面臨更多壓力。為什麼會有這樣的差異？其實跟基本工資的設計目的和對不同身分的實際影響有關。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">基本工資的設計目的</h2>
            <p className="mb-4">
              基本工資的設計目的主要有幾個：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>保障基本生活</strong>：確保勞工的最低工資能夠維持基本生活水準</li>
              <li><strong>調整物價影響</strong>：當物價上漲時，透過調整基本工資，讓勞工的購買力不會下降太多</li>
              <li><strong>減少低薪問題</strong>：防止雇主給過低的工資，改善低薪勞工的生活</li>
              <li><strong>維持社會穩定</strong>：透過保障基本生活，減少社會問題和勞資糾紛</li>
            </ul>
            <p className="mb-4">
              所以基本工資調整的主要目標是「保障低薪勞工」，而不是「讓所有人都加薪」。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">調整後對不同身分的實際影響</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">時薪制勞工：</h3>
            <p className="mb-4">
              如果原本時薪低於新標準，調整後時薪會直接提高，這對兼職、工讀生、服務業等按時計薪的工作影響最直接。
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">月薪制勞工：</h3>
            <p className="mb-4">
              如果原本月薪已經高於基本工資，調整後通常不會直接影響薪水。但如果月薪剛好在基本工資邊緣，雇主必須調高到至少符合新標準。有些公司會因為基本工資調整，連帶調整其他員工的薪水，但這要看公司的政策。
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">雇主（特別是中小企業）：</h3>
            <p className="mb-4">
              基本工資調整會增加人事成本，對原本就用最低工資的雇主影響最大。如果經營狀況不好，可能會面臨：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>成本增加，但收入沒有增加</li>
              <li>可能需要減少人力或調整經營模式</li>
              <li>如果無法吸收成本，可能會影響公司營運</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">為什麼不是所有人都直接受惠？</h2>
            <p className="mb-4">
              這是因為基本工資調整的影響是「間接的」，不是「直接的」：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>只影響低薪勞工</strong>：如果原本薪水就高於基本工資，調整後通常不會直接影響薪水</li>
              <li><strong>成本壓力轉移</strong>：雇主可能需要吸收成本增加，或轉移給其他員工或消費者</li>
              <li><strong>產業差異</strong>：不同產業的影響不同，服務業、零售業等低薪產業影響較大，科技業、金融業等影響較小</li>
              <li><strong>地區差異</strong>：不同地區的生活成本和經營狀況不同，影響也會不同</li>
            </ul>
            <p className="mb-4">
              所以基本工資調整「對低薪勞工是好消息」，但「對雇主可能是壓力」，而「對原本薪水就高的勞工影響不大」。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">常見社會誤解一次說清楚</h2>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">誤解一：基本工資調整，所有人都會加薪</h3>
              <p className="mb-4">
                不對。基本工資調整只會直接影響「原本薪水低於新標準」的勞工。如果原本薪水就高於基本工資，調整後通常不會直接加薪。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">誤解二：基本工資調整會讓物價上漲</h3>
              <p className="mb-4">
                不一定。雖然基本工資調整會增加人事成本，但物價上漲的原因很多，不完全是因為基本工資調整。而且基本工資調整通常只是「跟上物價」，而不是「造成物價上漲」。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">誤解三：基本工資調整會讓企業倒閉</h3>
              <p className="mb-4">
                不一定。雖然基本工資調整會增加人事成本，但企業倒閉的原因很多，不完全是因為基本工資調整。而且基本工資調整通常都是「小幅調整」，不會突然大幅增加成本。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">誤解四：基本工資調整會減少就業機會</h3>
              <p className="mb-4">
                不一定。雖然基本工資調整可能會讓某些雇主減少人力，但影響通常不大。而且基本工資調整的主要目的是「保障低薪勞工」，不是「減少就業機會」。
              </p>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg my-8">
              <p className="text-gray-700 leading-relaxed">
                <strong>提醒：</strong>基本工資調整的影響會隨著時間和產業環境而改變，實際影響請以勞動部的最新統計和研究為準。建議了解基本工資的設計目的和影響範圍，不要過度期待或擔憂。
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

          {/* 導流區塊：摘要模組 */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                看不懂勞動政策公告或新聞？
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
                  to="/blog/labor-insurance-pension-explained"
                  className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <span className="text-2xl mt-1">💼</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                      勞保年金是什麼？什麼情況下領得到？一般人最容易搞錯的重點
                    </h4>
                    <p className="text-sm text-gray-600">
                      了解勞保年金與一次領的差別，什麼情況才能請領，以及常見誤解
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
            "headline": "基本工資是什麼？為什麼調整後有人加薪、有人卻更辛苦？",
            "description": "基本工資調整影響完整解析：用白話方式說明基本工資的設計目的，調整後對不同身分的實際影響，以及為什麼不是所有人都直接受惠。",
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
              "@id": "https://pomodoro-app-eight-rouge.vercel.app/blog/minimum-wage-impact-explained"
            }
          })}
        </script>
      </Helmet>
    </>
  );
}

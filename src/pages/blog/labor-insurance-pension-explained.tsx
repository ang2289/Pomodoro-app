import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import SEO from "../../components/SEO";

export default function LaborInsurancePensionExplainedPage() {
  // 獲取今天的日期（格式：YYYY-MM-DD）
  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <SEO
        title="勞保年金是什麼？什麼情況下領得到？一般人最容易搞錯的重點"
        description="勞保年金完整解析：用白話方式說明勞保年金與一次領的差別，什麼情況才能請領，以及一般人最容易搞錯的重點，包括年資、年齡、金額等常見誤解。"
        keywords="勞保年金, 勞保一次領, 退休金, 年資, 政策解釋"
        url="https://pomodoro-app-eight-rouge.vercel.app/blog/labor-insurance-pension-explained"
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
              💼 勞保年金是什麼？什麼情況下領得到？一般人最容易搞錯的重點
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
              勞保年金是退休後「按月領」的退休金，跟「一次領」是兩種不同的選擇。很多人以為勞保年金隨時都可以領，或以為金額會很高，其實都有很多條件和限制。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">勞保年金與一次領的差別</h2>
            <p className="mb-4">
              <strong>勞保年金（按月領）：</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>每個月領固定的金額，可以領到過世為止</li>
              <li>如果年資夠長，通常比一次領更划算</li>
              <li>但如果中途過世，剩下的就沒有了</li>
              <li>需要符合特定的年資和年齡條件</li>
            </ul>
            <p className="mb-4">
              <strong>一次領：</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>把累積的年資換算成一次性的退休金</li>
              <li>領完就沒有了，不會繼續按月給付</li>
              <li>適合有其他投資規劃或急需用錢的人</li>
              <li>金額通常比按月領的總額少</li>
            </ul>
            <p className="mb-4">
              一般來說，如果年資夠長（例如 20 年以上），按月領會比較划算。但如果年資不長，或是有其他規劃，也可以選擇一次領。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">什麼情況才能請領？</h2>
            <p className="mb-4">
              請領勞保年金需要同時符合以下條件：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>年齡條件</strong>：通常需要達到法定退休年齡（目前是 65 歲），或符合特定條件（例如從事危險工作、年資足夠等）</li>
              <li><strong>年資條件</strong>：通常需要勞保年資滿 15 年以上</li>
              <li><strong>投保條件</strong>：必須已經退保（不再工作），或在特定情況下可以繼續投保</li>
            </ul>
            <p className="mb-4">
              要注意的是，如果年資不足或年齡不夠，可能只能選擇一次領，或是要等到符合條件才能請領年金。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">常見誤解（年資、年齡、金額）</h2>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">誤解一：年資只要滿 15 年就可以領</h3>
              <p className="mb-4">
                不對。年資滿 15 年只是「符合請領年金的資格」之一，還要同時符合年齡條件。如果年齡不夠，即使年資夠長，也可能要等到符合年齡條件才能請領。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">誤解二：年金金額會很高</h3>
              <p className="mb-4">
                不一定。年金金額是根據「平均月投保薪資」和「年資」計算的。如果投保薪資一直很低，或年資不長，年金金額也會比較少。很多人以為有勞保年金就夠退休生活，其實通常不夠，還是需要另外存退休金。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">誤解三：可以隨時請領</h3>
              <p className="mb-4">
                不對。必須同時符合年資和年齡條件，而且必須「退保」（不再工作）才能請領。如果還在工作，通常不能請領年金。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">誤解四：一次領比較划算</h3>
              <p className="mb-4">
                不一定。如果年資夠長（例如 20 年以上），按月領的總額通常會超過一次領的金額。而且按月領可以領一輩子，如果活得夠久，總額會更高。但如果年資不長，或是有其他投資規劃，一次領也是個選擇。
              </p>
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-4">為什麼很多人快退休才發現差很多？</h2>
            <p className="mb-4">
              這是因為很多人對勞保年金有誤解：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>以為有勞保就夠用</strong>：其實勞保年金的金額通常不夠維持退休後的生活</li>
              <li><strong>投保薪資太低</strong>：如果雇主用最低的投保薪資幫你投保，年金金額也會比較少</li>
              <li><strong>年資中斷</strong>：如果換工作時有中斷投保，年資可能不夠，或是平均投保薪資會被拉低</li>
              <li><strong>沒有提早規劃</strong>：很多人以為有勞保年金就夠了，沒有另外存退休金，等到快退休才發現不夠</li>
            </ul>
            <p className="mb-4">
              建議提早查詢自己的勞保年資和投保薪資，計算一下退休後可以領多少年金，如果發現不夠，就要提早規劃其他退休金來源。
            </p>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg my-8">
              <p className="text-gray-700 leading-relaxed">
                <strong>提醒：</strong>勞保年金的計算方式和請領條件會隨著政策調整而改變，實際請領時請以勞保局的最新規定為準。建議定期查詢自己的勞保年資和投保薪資，提早規劃退休生活。
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
            </div>
          </div>

          {/* 導流區塊：摘要模組 */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                看不懂勞保或退休金公告？
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
            "headline": "勞保年金是什麼？什麼情況下領得到？一般人最容易搞錯的重點",
            "description": "勞保年金完整解析：用白話方式說明勞保年金與一次領的差別，什麼情況才能請領，以及一般人最容易搞錯的重點，包括年資、年齡、金額等常見誤解。",
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
              "@id": "https://pomodoro-app-eight-rouge.vercel.app/blog/labor-insurance-pension-explained"
            }
          })}
        </script>
      </Helmet>
    </>
  );
}

import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import SEO from "../../components/SEO";
import ArticleCTA from "@/components/ArticleCTA";

export default function LaborPensionNewSystemExplainedPage() {
  // 獲取今天的日期（格式：YYYY-MM-DD）
  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <SEO
        title="勞退新制是什麼？雇主提撥的錢真的都給你嗎？"
        description="勞退新制完整解析：用一般上班族能看懂的語氣說明勞退新制與舊制的核心差異，6% 提撥實際怎麼運作，以及一般人最容易誤解的地方。"
        keywords="勞退新制, 勞退舊制, 6% 提撥, 退休金, 政策解釋"
        url="https://pomodoro-app-eight-rouge.vercel.app/blog/labor-pension-new-system-explained"
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
              💰 勞退新制是什麼？雇主提撥的錢真的都給你嗎？
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
              勞退新制是 2005 年開始實施的退休金制度，跟舊制最大的差別是「雇主每個月要提撥 6% 到你的個人專戶」。很多人以為這 6% 就是全部給你的，其實不完全對，因為這筆錢要等到退休才能領，而且還要看投資收益。
            </p>

            <ArticleCTA placement="start" focus="summary" />


            <h2 className="text-2xl font-semibold mt-8 mb-4">勞退新制與舊制的核心差異</h2>
            <p className="mb-4">
              <strong>勞退舊制：</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>退休金是雇主在員工退休時一次給付</li>
              <li>金額是根據工作年資和最後的薪資計算</li>
              <li>如果中途離職，可能領不到或領很少</li>
              <li>退休金是「公司負擔」，不是「個人專戶」</li>
            </ul>
            <p className="mb-4">
              <strong>勞退新制：</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>雇主每個月要提撥 6% 到你的「個人專戶」</li>
              <li>這筆錢會一直累積，直到你退休才能領</li>
              <li>如果中途離職，這筆錢還是你的，可以帶著走</li>
              <li>退休金是「個人專戶」，屬於你個人所有</li>
            </ul>
            <p className="mb-4">
              所以新制的好處是「帶著走」，即使換工作，之前累積的退休金還是你的。但缺點是「要等到退休才能領」，不能提前領。
            </p>

            <ArticleCTA placement="middle" focus="summary" />

            <h2 className="text-2xl font-semibold mt-8 mb-4">6% 提撥實際怎麼運作</h2>
            <p className="mb-4">
              勞退新制的 6% 提撥是這樣運作的：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>提撥基礎</strong>：根據你的「月提繳工資」計算，通常是你的月薪，但會對應到「提繳工資級距」</li>
              <li><strong>提撥金額</strong>：月提繳工資 × 6%，例如如果你的月提繳工資是 30,300 元，那每個月就是 1,818 元</li>
              <li><strong>提撥方式</strong>：雇主每個月會把這筆錢匯到你的「個人專戶」，由勞保局統一管理</li>
              <li><strong>投資收益</strong>：這筆錢會由勞保局統一投資，投資收益會分配到你的個人專戶</li>
            </ul>
            <p className="mb-4">
              所以這 6% 確實是「給你的」，但：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>要等到退休才能領（通常是 60 歲）</li>
              <li>金額會根據投資收益而有所增減</li>
              <li>如果投資虧損，你的退休金可能會減少</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">一般人最容易誤解的地方</h2>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">誤解一：6% 就是全部給你的</h3>
              <p className="mb-4">
                對，但也不完全對。這 6% 確實是「給你的」，但要等到退休才能領，而且金額會根據投資收益而有所增減。如果投資虧損，你的退休金可能會減少。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">誤解二：可以隨時領</h3>
              <p className="mb-4">
                不對。勞退新制的退休金要等到「符合請領條件」才能領，通常是 60 歲，或是符合特定條件（例如年資滿 15 年且年滿 55 歲）。不能提前領。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">誤解三：投資一定賺錢</h3>
              <p className="mb-4">
                不對。勞退新制的投資是由勞保局統一管理，投資收益會分配到個人專戶，但如果投資虧損，你的退休金可能會減少。所以不是「一定賺錢」。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">誤解四：6% 就夠退休了</h3>
              <p className="mb-4">
                不一定。6% 只是「基本保障」，通常不夠維持退休後的生活。建議還是要另外存退休金，例如個人儲蓄、投資等。
              </p>
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-4">為什麼很多人到離職才開始在意？</h2>
            <p className="mb-4">
              這是因為：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>平時看不到</strong>：勞退新制的錢是存在「個人專戶」裡，平時看不到，所以很多人不會特別在意</li>
              <li><strong>要等到退休才能領</strong>：因為要等到退休才能領，所以很多人覺得「還早」，不會特別關心</li>
              <li><strong>以為有勞保就夠了</strong>：很多人以為有勞保就夠了，不知道勞退新制是另外一筆退休金</li>
              <li><strong>離職時才會查</strong>：只有到離職時，才會去查自己的勞退專戶，看看累積了多少錢</li>
            </ul>
            <p className="mb-4">
              建議提早查詢自己的勞退專戶，了解累積了多少退休金，如果發現不夠，就要提早規劃其他退休金來源。
            </p>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg my-8">
              <p className="text-gray-700 leading-relaxed">
                <strong>提醒：</strong>勞退新制的請領條件和投資收益會隨著政策調整而改變，實際請領時請以勞保局的最新規定為準。建議定期查詢自己的勞退專戶，了解累積了多少退休金。
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
                to="/blog/labor-insurance-pension-explained"
                className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-3xl mb-3">💼</div>
                <h4 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  勞保年金是什麼？什麼情況下領得到？一般人最容易搞錯的重點
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  了解勞保年金與一次領的差別，什麼情況才能請領，以及常見誤解
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
                看不懂退休金或勞動政策公告？
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
                  to="/blog/nhi-premium-explained"
                  className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <span className="text-2xl mt-1">🏥</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                      健保費是怎麼算的？為什麼每個人繳的不一樣？
                    </h4>
                    <p className="text-sm text-gray-600">
                      了解健保費的計算基礎，薪資、眷屬與補充保費的差別
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
            "headline": "勞退新制是什麼？雇主提撥的錢真的都給你嗎？",
            "description": "勞退新制完整解析：用一般上班族能看懂的語氣說明勞退新制與舊制的核心差異，6% 提撥實際怎麼運作，以及一般人最容易誤解的地方。",
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
              "@id": "https://pomodoro-app-eight-rouge.vercel.app/blog/labor-pension-new-system-explained"
            }
          })}
        </script>
      </Helmet>
    </>
  );
}

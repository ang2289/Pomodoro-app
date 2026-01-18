import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import SEO from "../../components/SEO";

export default function UnemploymentBenefitExplainedPage() {
  // 獲取今天的日期（格式：YYYY-MM-DD）
  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <SEO
        title="失業給付是什麼？非自願離職一定領得到嗎？"
        description="失業給付完整解析：用實際情境說明什麼是失業給付，為什麼一定要非自願離職，以及為什麼很多人以為能領卻領不到。"
        keywords="失業給付, 非自願離職, 失業, 政策解釋"
        url="https://pomodoro-app-eight-rouge.vercel.app/blog/unemployment-benefit-explained"
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
              💼 失業給付是什麼？非自願離職一定領得到嗎？
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
              失業給付是政府提供給失業勞工的暫時性補助，但很多人以為只要失業就能領，其實不是。失業給付有很嚴格的條件，其中最重要的就是「非自願離職」。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">什麼是失業給付？</h2>
            <p className="mb-4">
              失業給付是勞保的一種給付，當你因為「非自願離職」而失業時，可以申請暫時性的補助。給付金額通常是離職前 6 個月平均投保薪資的 60%，最多可以領 6 個月。
            </p>
            <p className="mb-4">
              例如，如果你離職前 6 個月的平均投保薪資是 3 萬元，那失業給付就是 18,000 元（30,000 × 60%），每個月可以領一次，最多領 6 個月。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">一定要「非自願離職」的原因</h2>
            <p className="mb-4">
              失業給付的設計目的是「保障非自願失業的勞工」，而不是「補助所有失業的人」。所以只有「非自願離職」才能申請，如果是「自願離職」就不能申請。
            </p>
            <p className="mb-4">
              <strong>什麼是「非自願離職」？</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>公司倒閉、歇業、解散</li>
              <li>公司裁員、資遣</li>
              <li>公司違反勞動契約，你因此離職</li>
              <li>公司對你有不當行為（例如性騷擾、職場霸凌），你因此離職</li>
              <li>其他符合「非自願離職」定義的情況</li>
            </ul>
            <p className="mb-4">
              <strong>什麼是「自願離職」？</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>你自己主動提出離職</li>
              <li>你因為個人原因（例如想換工作、家庭因素）而離職</li>
              <li>你因為工作不適應而離職</li>
            </ul>
            <p className="mb-4">
              所以如果你是自己想離職，或是因為個人原因離職，就不能申請失業給付。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">為什麼很多人以為能領卻領不到？</h2>
            <p className="mb-4">
              這是因為很多人對失業給付的條件有誤解：
            </p>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">誤解一：只要失業就能領</h3>
              <p className="mb-4">
                不對。失業給付只給「非自願離職」的勞工，如果是「自願離職」就不能申請。而且還要符合其他條件，例如要有勞保年資、離職前 3 年內有投保滿 1 年等。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">誤解二：非自願離職一定領得到</h3>
              <p className="mb-4">
                不一定。即使是非自願離職，還要符合其他條件，例如：
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>離職前 3 年內，勞保年資要滿 1 年</li>
                <li>離職後要立即到就業服務站辦理求職登記</li>
                <li>離職後 14 天內要申請失業給付</li>
                <li>要持續找工作，不能拒絕就業服務站介紹的工作</li>
              </ul>
              <p className="mb-4">
                如果不符合這些條件，即使是非自願離職，也可能領不到失業給付。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">誤解三：可以一直領到找到工作</h3>
              <p className="mb-4">
                不對。失業給付最多只能領 6 個月，而且如果你找到工作、拒絕就業服務站介紹的工作、或是沒有持續找工作，就會停止給付。
              </p>
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-4">一般上班族該有的正確認知</h2>
            <p className="mb-4">
              對一般上班族來說，了解失業給付要注意：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>失業給付不是「失業補助」</strong>：只給非自願離職的勞工，不是所有失業的人都能領</li>
              <li><strong>條件很嚴格</strong>：除了要非自願離職，還要符合年資、求職登記、持續找工作等條件</li>
              <li><strong>給付有期限</strong>：最多只能領 6 個月，而且如果找到工作或拒絕介紹的工作，就會停止</li>
              <li><strong>金額有限</strong>：給付金額通常是離職前 6 個月平均投保薪資的 60%，不是全額</li>
            </ul>
            <p className="mb-4">
              建議如果遇到非自願離職的情況，要立即到就業服務站辦理求職登記和申請失業給付，不要等到最後一刻才申請。
            </p>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg my-8">
              <p className="text-gray-700 leading-relaxed">
                <strong>提醒：</strong>失業給付的申請條件和給付標準會隨著政策調整而改變，實際申請時請以就業服務站的最新規定為準。建議直接到就業服務站詢問，會有專人協助申請。
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
            "headline": "失業給付是什麼？非自願離職一定領得到嗎？",
            "description": "失業給付完整解析：用實際情境說明什麼是失業給付，為什麼一定要非自願離職，以及為什麼很多人以為能領卻領不到。",
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
              "@id": "https://pomodoro-app-eight-rouge.vercel.app/blog/unemployment-benefit-explained"
            }
          })}
        </script>
      </Helmet>
    </>
  );
}

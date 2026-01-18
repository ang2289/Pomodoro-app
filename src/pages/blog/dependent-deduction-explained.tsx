import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import SEO from "../../components/SEO";

export default function DependentDeductionExplainedPage() {
  // 獲取今天的日期（格式：YYYY-MM-DD）
  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <SEO
        title="扶養父母真的可以少繳稅嗎？很多人其實報錯了"
        description="扶養扣除額完整解析：用生活案例說明扶養在制度上的真正意思，為什麼不是有給錢就算，以及一般家庭該有的正確認知。"
        keywords="扶養, 扶養扣除額, 所得稅, 政策解釋"
        url="https://pomodoro-app-eight-rouge.vercel.app/blog/dependent-deduction-explained"
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
              👨‍👩‍👧 扶養父母真的可以少繳稅嗎？很多人其實報錯了
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
              很多人以為「有給父母錢就可以報扶養」，其實不是。扶養在制度上有很嚴格的條件，不是「有給錢就算」，而是要符合「扶養事實」和「扶養條件」。很多人因為不了解這些條件，所以報錯了。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">扶養在制度上的真正意思</h2>
            <p className="mb-4">
              扶養在制度上的意思是「你實際負擔了這個人的生活費用」，不只是「有給錢」：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>扶養事實</strong>：你實際負擔了這個人的生活費用，例如食衣住行、醫療、教育等</li>
              <li><strong>扶養條件</strong>：這個人符合「扶養親屬」的條件，例如年齡、收入、身分等</li>
              <li><strong>扶養關係</strong>：你跟這個人有「扶養關係」，例如父母、祖父母、子女等</li>
            </ul>
            <p className="mb-4">
              所以不是「有給錢就算」，而是要「實際負擔生活費用」且「符合扶養條件」。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">為什麼不是有給錢就算？</h2>
            <p className="mb-4">
              這是因為「給錢」和「扶養」是兩回事：
            </p>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">情境一：偶爾給零用錢</h3>
              <p className="mb-4">
                如果你只是「偶爾給父母零用錢」，例如過年給紅包、生日給禮金等，這不算「扶養」。因為「扶養」是要「實際負擔生活費用」，不是「偶爾給錢」。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">情境二：父母有收入</h3>
              <p className="mb-4">
                如果父母有收入（例如退休金、租金、投資等），而且收入超過一定金額，可能就不符合「扶養條件」。因為「扶養」是要「實際負擔生活費用」，如果父母自己有收入，可能就不算「扶養」。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">情境三：兄弟姊妹共同負擔</h3>
              <p className="mb-4">
                如果兄弟姊妹共同負擔父母的生活費用，可能只有「主要負擔者」才能報扶養。因為「扶養」是要「實際負擔生活費用」，如果多個人共同負擔，可能只有「主要負擔者」才能報扶養。
              </p>
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-4">常見錯誤申報的原因</h2>
            <p className="mb-4">
              很多人報錯扶養的原因主要有幾個：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>以為「有給錢就算」</strong>：很多人以為「有給父母錢就可以報扶養」，其實不是，還要符合「扶養事實」和「扶養條件」</li>
              <li><strong>不了解「扶養條件」</strong>：很多人不了解「扶養條件」，例如父母有收入、兄弟姊妹共同負擔等，所以報錯了</li>
              <li><strong>以為「報越多越好」</strong>：很多人以為「報越多扶養親屬，就可以少繳稅」，其實不是，只有符合「扶養條件」的才能報</li>
              <li><strong>不了解「扶養事實」</strong>：很多人不了解「扶養事實」，例如只是「偶爾給零用錢」不算「扶養」，所以報錯了</li>
            </ul>
            <p className="mb-4">
              所以報扶養前，要先確認是否符合「扶養事實」和「扶養條件」。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">一般家庭該有的正確認知</h2>
            <p className="mb-4">
              對一般家庭來說，了解扶養要注意：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>扶養不是「有給錢就算」</strong>：扶養是要「實際負擔生活費用」，不是「偶爾給錢」</li>
              <li><strong>要符合「扶養條件」</strong>：扶養親屬要符合「扶養條件」，例如年齡、收入、身分等</li>
              <li><strong>要符合「扶養事實」</strong>：扶養親屬要符合「扶養事實」，例如實際負擔生活費用、共同居住等</li>
              <li><strong>不能重複申報</strong>：如果多個人共同負擔，可能只有「主要負擔者」才能報扶養，不能重複申報</li>
            </ul>
            <p className="mb-4">
              建議報扶養前，要先確認是否符合「扶養事實」和「扶養條件」，不要因為「想少繳稅」就隨便報。
            </p>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg my-8">
              <p className="text-gray-700 leading-relaxed">
                <strong>提醒：</strong>扶養扣除額的條件和計算方式會隨著政策調整而改變，實際申報時請以國稅局的最新規定為準。建議使用國稅局的試算工具，了解自己是否符合扶養條件。
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
                to="/blog/income-tax-exemption-explained"
                className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-3xl mb-3">💰</div>
                <h4 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  為什麼有些人不用繳所得稅？免稅門檻到底怎麼算？
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  了解為什麼有些人不用繳所得稅，免稅額、扣除額在實際生活中的意思
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
                看不懂稅務公告或新聞？
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
                  to="/blog/income-tax-exemption-explained"
                  className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <span className="text-2xl mt-1">💰</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                      為什麼有些人不用繳所得稅？免稅門檻到底怎麼算？
                    </h4>
                    <p className="text-sm text-gray-600">
                      了解為什麼有些人不用繳所得稅，免稅額、扣除額在實際生活中的意思
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
            "headline": "扶養父母真的可以少繳稅嗎？很多人其實報錯了",
            "description": "扶養扣除額完整解析：用生活案例說明扶養在制度上的真正意思，為什麼不是有給錢就算，以及一般家庭該有的正確認知。",
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
              "@id": "https://pomodoro-app-eight-rouge.vercel.app/blog/dependent-deduction-explained"
            }
          })}
        </script>
      </Helmet>
    </>
  );
}

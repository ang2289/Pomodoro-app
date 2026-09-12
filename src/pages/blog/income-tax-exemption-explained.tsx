import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import SEO from "../../components/SEO";
import ArticleCTA from "@/components/ArticleCTA";

export default function IncomeTaxExemptionExplainedPage() {
  // 獲取今天的日期（格式：YYYY-MM-DD）
  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <SEO
        title="為什麼有些人不用繳所得稅？免稅門檻到底怎麼算？"
        description="所得稅免稅門檻完整解析：用生活情境說明為什麼有些人不用繳所得稅，免稅額、扣除額在實際生活中的意思，以及一般家庭最容易誤會的地方。"
        keywords="所得稅, 免稅門檻, 免稅額, 扣除額, 政策解釋"
        url="https://pomodoro-app-eight-rouge.vercel.app/blog/income-tax-exemption-explained"
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
              💰 為什麼有些人不用繳所得稅？免稅門檻到底怎麼算？
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
              很多人以為「有收入就要繳稅」，其實不是。所得稅有「免稅門檻」，如果你的收入低於這個門檻，就不用繳稅。但這個門檻不是固定金額，而是根據你的「免稅額」和「扣除額」來計算的。
            </p>

            <ArticleCTA placement="start" focus="summary" />


            <h2 className="text-2xl font-semibold mt-8 mb-4">所得稅不是人人都要繳的原因</h2>
            <p className="mb-4">
              所得稅的設計原則是「有能力的人多繳一點，能力較弱的人少繳或不繳」。所以如果你的收入不高，可能就不用繳稅。
            </p>
            <p className="mb-4">
              例如，如果你是一個人，年收入 20 萬元，扣除免稅額和扣除額後，可能就不用繳稅。但如果你是一個人，年收入 100 萬元，扣除免稅額和扣除額後，可能就要繳稅。
            </p>

            <ArticleCTA placement="middle" focus="summary" />

            <p className="mb-4">
              所以「不用繳稅」不是「不用報稅」，而是「報稅後發現不用繳稅」。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">免稅額、扣除額在實際生活中的意思</h2>
            <p className="mb-4">
              <strong>免稅額：</strong>
            </p>
            <p className="mb-4">
              免稅額是「每個人基本的生活保障」，不管你的收入多少，都可以扣除這個金額。例如，如果你是一個人，免稅額可能是 9.2 萬元；如果你有扶養父母，每個父母可以再加 13.8 萬元。
            </p>
            <p className="mb-4">
              用生活情境來說，就是「政府認為每個人基本生活需要這麼多錢，這部分不用繳稅」。
            </p>
            <p className="mb-4">
              <strong>扣除額：</strong>
            </p>
            <p className="mb-4">
              扣除額是「特定支出的扣除」，例如：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>標準扣除額</strong>：每個人可以扣除固定金額（例如單身 12.4 萬元、夫妻 24.8 萬元）</li>
              <li><strong>列舉扣除額</strong>：如果你有特定支出（例如醫療、保險、房貸利息等），可以選擇用列舉扣除額，通常會比標準扣除額多</li>
              <li><strong>特別扣除額</strong>：例如薪資特別扣除額（20.7 萬元）、身心障礙特別扣除額（20.7 萬元）等</li>
            </ul>
            <p className="mb-4">
              用生活情境來說，就是「這些支出可以從你的收入中扣除，不用繳稅」。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">為什麼薪水不高卻還是有人被扣？</h2>
            <p className="mb-4">
              這是因為「薪水」和「年收入」不一樣：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>薪水是月收入</strong>：每個月的薪水，例如 3 萬元</li>
              <li><strong>年收入是總收入</strong>：一年的總收入，例如 3 萬元 × 12 個月 = 36 萬元</li>
              <li><strong>還要加上其他收入</strong>：例如獎金、兼職、股利、利息等</li>
            </ul>
            <p className="mb-4">
              例如，如果你的月薪是 3 萬元，年收入就是 36 萬元，再加上年終獎金 6 萬元，總收入就是 42 萬元。扣除免稅額和扣除額後，如果還有剩餘，就要繳稅。
            </p>
            <p className="mb-4">
              所以即使「薪水不高」，但如果「年收入」加上其他收入後，超過免稅門檻，還是要繳稅。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">一般家庭最容易誤會的地方</h2>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">誤會一：有收入就要繳稅</h3>
              <p className="mb-4">
                不對。如果你的收入低於免稅門檻（免稅額 + 扣除額），就不用繳稅。例如，如果你是一個人，年收入 20 萬元，扣除免稅額 9.2 萬元和標準扣除額 12.4 萬元後，可能就不用繳稅。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">誤會二：免稅額和扣除額是一樣的</h3>
              <p className="mb-4">
                不對。免稅額是「每個人基本的生活保障」，扣除額是「特定支出的扣除」。兩者是分開計算的，可以同時扣除。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">誤會三：薪水不高就不用繳稅</h3>
              <p className="mb-4">
                不一定。即使薪水不高，但如果年收入加上其他收入（例如獎金、兼職、股利等）後，超過免稅門檻，還是要繳稅。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">誤會四：不用繳稅就不用報稅</h3>
              <p className="mb-4">
                不一定。即使不用繳稅，但如果你的年收入超過一定金額（例如 20 萬元），還是要報稅。只是報稅後發現不用繳稅而已。
              </p>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg my-8">
              <p className="text-gray-700 leading-relaxed">
                <strong>提醒：</strong>所得稅的免稅額和扣除額會隨著政策調整而改變，實際計算時請以國稅局的最新規定為準。建議使用國稅局的試算工具，了解自己是否需要繳稅。
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
                to="/blog/nhi-premium-explained"
                className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-3xl mb-3">🏥</div>
                <h4 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  健保費是怎麼算的？為什麼每個人繳的不一樣？
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  了解健保費的計算基礎，薪資、眷屬與補充保費的差別
                </p>
              </Link>
            </div>
          </div>
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
            "headline": "為什麼有些人不用繳所得稅？免稅門檻到底怎麼算？",
            "description": "所得稅免稅門檻完整解析：用生活情境說明為什麼有些人不用繳所得稅，免稅額、扣除額在實際生活中的意思，以及一般家庭最容易誤會的地方。",
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
              "@id": "https://pomodoro-app-eight-rouge.vercel.app/blog/income-tax-exemption-explained"
            }
          })}
        </script>
      </Helmet>
    </>
  );
}

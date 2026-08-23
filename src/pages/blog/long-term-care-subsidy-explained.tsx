import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import SEO from "../../components/SEO";
import ArticleCTA from "@/components/ArticleCTA";

export default function LongTermCareSubsidyExplainedPage() {
  // 獲取今天的日期（格式：YYYY-MM-DD）
  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <SEO
        title="長照補助是什麼？家裡有人需要時，政府實際能幫到哪裡？"
        description="長照補助完整解析：用一般家庭能理解的方式說明長照補助在補什麼，哪些人比較容易符合，以及為什麼很多家庭一開始都不知道能申請。"
        keywords="長照補助, 長期照顧, 長照服務, 政策解釋"
        url="https://pomodoro-app-eight-rouge.vercel.app/blog/long-term-care-subsidy-explained"
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
              👵 長照補助是什麼？家裡有人需要時，政府實際能幫到哪裡？
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
              長照補助是政府提供給需要長期照顧的家庭的協助，包括照顧服務、喘息服務、輔具補助等。但很多家庭一開始都不知道可以申請，或是不清楚政府到底能幫到什麼程度。
            </p>

            <ArticleCTA placement="start" focus="summary" />


            <h2 className="text-2xl font-semibold mt-8 mb-4">長照補助在補什麼？</h2>
            <p className="mb-4">
              長照補助主要包含以下幾種：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>照顧服務</strong>：居家照顧、日間照顧、機構照顧等，協助無法自理生活的人</li>
              <li><strong>喘息服務</strong>：讓主要照顧者可以休息，例如短期入住機構或臨時照顧服務</li>
              <li><strong>輔具補助</strong>：補助購買輪椅、病床、助行器等輔助器具</li>
              <li><strong>居家無障礙環境改善</strong>：補助改裝居家環境，例如加裝扶手、防滑地板等</li>
              <li><strong>交通接送</strong>：補助就醫或復健的交通費用</li>
            </ul>
            <p className="mb-4">
              這些補助的額度會根據家庭收入、失能程度等因素有所不同，不是所有人都能獲得全額補助。
            </p>

            <ArticleCTA placement="middle" focus="summary" />

            <h2 className="text-2xl font-semibold mt-8 mb-4">哪些人比較容易符合？</h2>
            <p className="mb-4">
              長照補助主要是針對以下幾種情況：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>65 歲以上失能老人</strong>：如果日常生活無法自理，例如無法自己吃飯、洗澡、上廁所等</li>
              <li><strong>50 歲以上失智症患者</strong>：如果被診斷為失智症，需要長期照顧</li>
              <li><strong>身心障礙者</strong>：如果領有身心障礙證明，且需要長期照顧</li>
              <li><strong>55 歲以上原住民</strong>：如果日常生活無法自理</li>
            </ul>
            <p className="mb-4">
              需要特別注意的是，不是所有老人或身心障礙者都符合，必須經過「長照需求評估」，確認確實需要長期照顧才會通過。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">為什麼很多家庭一開始都不知道能申請？</h2>
            <p className="mb-4">
              這是因為：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>資訊不流通</strong>：很多人不知道有長照補助，或是不清楚申請流程</li>
              <li><strong>以為要很窮才能申請</strong>：其實長照補助不是只看收入，主要是看失能程度和照顧需求</li>
              <li><strong>覺得申請很麻煩</strong>：其實申請流程比想像中簡單，而且有專人協助</li>
              <li><strong>不知道去哪裡問</strong>：可以打電話到各縣市的長照管理中心，或到衛生所、社會局詢問</li>
            </ul>
            <p className="mb-4">
              建議如果家裡有人需要長期照顧，可以直接聯繫長照管理中心，他們會派專人到家中評估，協助申請適合的補助。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">常見錯誤期待與實際差異</h2>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">錯誤期待一：補助會全額負擔所有費用</h3>
              <p className="mb-4">
                不對。長照補助通常只是「部分補助」，家庭還是要負擔一部分費用。補助額度會根據家庭收入和失能程度有所不同，收入較低的家庭補助比例會比較高，但通常不會到 100%。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">錯誤期待二：申請了馬上就可以用</h3>
              <p className="mb-4">
                不一定。申請後需要經過評估，確認符合資格後才會開始提供服務。整個流程可能需要幾週到一個月的時間，所以如果家裡有人需要長期照顧，建議提早申請。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">錯誤期待三：所有長照服務都可以補助</h3>
              <p className="mb-4">
                不對。長照補助只補助特定的服務項目，例如居家照顧、日間照顧、喘息服務等。如果是私人聘請的看護、或是醫療費用，通常不在長照補助的範圍內。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">錯誤期待四：收入太高就不能申請</h3>
              <p className="mb-4">
                不一定。長照補助不是只看收入，主要是看失能程度和照顧需求。即使收入較高，只要經過評估確認需要長期照顧，還是可以申請補助，只是補助比例可能會比較低。
              </p>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg my-8">
              <p className="text-gray-700 leading-relaxed">
                <strong>提醒：</strong>長照補助的申請資格和補助額度會隨著政策調整而改變，實際申請時請以各縣市長照管理中心的最新規定為準。建議直接聯繫長照管理中心（電話：1966），會有專人協助評估和申請。
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
                to="/blog/subsidy-eligibility-explained"
                className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-3xl mb-3">💰</div>
                <h4 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  政府補助怎麼判斷？為什麼別人領得到，你卻不行？一次搞懂常見關鍵條件
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  了解補助申請的關鍵判斷條件，包括身分、收入、居住地、用途等條件
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
                看不懂長照或補助公告？
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
            "headline": "長照補助是什麼？家裡有人需要時，政府實際能幫到哪裡？",
            "description": "長照補助完整解析：用一般家庭能理解的方式說明長照補助在補什麼，哪些人比較容易符合，以及為什麼很多家庭一開始都不知道能申請。",
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
              "@id": "https://pomodoro-app-eight-rouge.vercel.app/blog/long-term-care-subsidy-explained"
            }
          })}
        </script>
      </Helmet>
    </>
  );
}

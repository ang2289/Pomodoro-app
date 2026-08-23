import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import SEO from "../../components/SEO";
import ArticleCTA from "@/components/ArticleCTA";

export default function GovernmentAnnouncementImpactExplainedPage() {
  // 獲取今天的日期（格式：YYYY-MM-DD）
  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <SEO
        title="政府公告一定會影響你嗎？哪些政策其實跟多數人無關？"
        description="政府公告影響解析：用白話方式說明為什麼政府公告這麼多，哪些是「資訊型」不是「影響型」，以及一般民眾該怎麼判斷要不要關心。"
        keywords="政府公告, 政策影響, 政策解釋"
        url="https://pomodoro-app-eight-rouge.vercel.app/blog/government-announcement-impact-explained"
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
              📢 政府公告一定會影響你嗎？哪些政策其實跟多數人無關？
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
              每天都有很多政府公告，但並不是每個公告都會影響你。有些公告是「資訊型」的，只是告訴你發生了什麼事；有些公告是「影響型」的，會直接影響你的生活。很多人會被新聞標題嚇到，以為每個公告都很重要，其實不是。
            </p>

            <ArticleCTA placement="start" focus="summary" />


            <h2 className="text-2xl font-semibold mt-8 mb-4">為什麼政府公告這麼多？</h2>
            <p className="mb-4">
              政府公告這麼多的原因主要有幾個：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>資訊透明</strong>：政府有義務公開資訊，讓民眾知道政府在做什么</li>
              <li><strong>法律要求</strong>：很多法律規定政府必須公告某些事項，例如法規修正、招標公告等</li>
              <li><strong>行政流程</strong>：很多行政流程需要公告，例如聽證會、徵求意見等</li>
              <li><strong>服務提供</strong>：很多服務需要公告，例如補助申請、活動資訊等</li>
            </ul>
            <p className="mb-4">
              所以政府公告這麼多，不是「故意製造混亂」，而是「資訊透明和行政流程的需要」。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">哪些是「資訊型」不是「影響型」？</h2>
            <p className="mb-4">
              <strong>資訊型公告：</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>只是告訴你發生了什麼事，不會直接影響你的生活</li>
              <li>例如：某個會議的記錄、某個研究的結果、某個活動的資訊等</li>
              <li>這些公告通常是「參考用」，不需要特別關心</li>
            </ul>
            <p className="mb-4">
              <strong>影響型公告：</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>會直接影響你的生活，需要特別注意</li>
              <li>例如：稅制調整、補助申請、法規修正、服務變更等</li>
              <li>這些公告通常是「行動用」，需要了解並採取行動</li>
            </ul>
            <p className="mb-4">
              所以不是每個公告都很重要，要學會區分「資訊型」和「影響型」。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">一般民眾該怎麼判斷要不要關心？</h2>
            <p className="mb-4">
              對一般民眾來說，判斷要不要關心政府公告可以看幾個重點：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>看標題與重點字</strong>：如果標題提到「稅」、「補助」、「申請」、「調整」等字詞，通常比較重要</li>
              <li><strong>看適用對象</strong>：如果公告提到「一般民眾」、「所有國民」等，通常比較重要；如果只提到「特定行業」、「特定地區」等，可能跟你無關</li>
              <li><strong>看生效時間</strong>：如果公告提到「即日起」、「下個月開始」等，通常比較重要；如果只是「資訊公告」，可能不需要特別關心</li>
              <li><strong>看是否需要行動</strong>：如果公告提到「需要申請」、「需要登記」等，通常比較重要；如果只是「資訊提供」，可能不需要特別關心</li>
            </ul>
            <p className="mb-4">
              建議先看標題與重點字，如果覺得可能跟你有關，再仔細看內容；如果覺得跟你無關，就可以跳過。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">為什麼很多人會被新聞標題嚇到？</h2>
            <p className="mb-4">
              這是因為：
            </p>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">原因一：新聞標題為了吸引點擊，會用誇張的用詞</h3>
              <p className="mb-4">
                很多新聞標題會用「重大」、「影響所有人」、「立即生效」等誇張的用詞，讓讀者以為很重要，其實可能只是「資訊型」公告，不會直接影響你的生活。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">原因二：沒有區分「資訊型」和「影響型」</h3>
              <p className="mb-4">
                很多人看到政府公告就以為「很重要」，沒有區分「資訊型」和「影響型」，所以會被嚇到。其實很多公告只是「資訊提供」，不會直接影響你的生活。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">原因三：不了解政策的實際影響範圍</h3>
              <p className="mb-4">
                很多人不了解政策的實際影響範圍，以為「所有政策都會影響所有人」，其實很多政策只影響特定對象，跟多數人無關。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">原因四：沒有判斷標準</h3>
              <p className="mb-4">
                很多人沒有判斷標準，不知道「哪些公告要關心、哪些可以跳過」，所以看到公告就以為很重要，會被嚇到。
              </p>
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-4">哪些政策其實跟多數人無關？</h2>
            <p className="mb-4">
              很多政策其實跟多數人無關，例如：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>特定行業的政策</strong>：例如某個行業的補助、某個行業的規範等，如果不是從事該行業，通常跟你無關</li>
              <li><strong>特定地區的政策</strong>：例如某個縣市的補助、某個地區的建設等，如果不在該地區，通常跟你無關</li>
              <li><strong>特定身分的政策</strong>：例如某個身分的補助、某個身分的優惠等，如果不符合該身分，通常跟你無關</li>
              <li><strong>資訊型公告</strong>：例如某個會議的記錄、某個研究的結果等，通常只是「資訊提供」，不會直接影響你的生活</li>
            </ul>
            <p className="mb-4">
              所以不是每個政策都很重要，要學會判斷「哪些政策跟你有關、哪些可以跳過」。
            </p>

            <ArticleCTA placement="middle" focus="summary" />

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg my-8">
              <p className="text-gray-700 leading-relaxed">
                <strong>提醒：</strong>政府公告的內容和影響會隨著時間而改變，實際影響請以政府的最新公告為準。建議先看標題與重點字，如果覺得可能跟你有關，再仔細看內容；如果覺得跟你無關，就可以跳過。
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
                to="/blog/household-registration-explained"
                className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-3xl mb-3">📋</div>
                <h4 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  戶籍遷出遷入有差嗎？為什麼這麼多補助都看戶籍？
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  了解戶籍在政策中的實際用途，為什麼補助常以戶籍為判斷，以及租屋族最常踩到的誤區
                </p>
              </Link>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                看不懂政府公告或新聞？
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
                  to="/blog/household-registration-explained"
                  className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <span className="text-2xl mt-1">📋</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                      戶籍遷出遷入有差嗎？為什麼這麼多補助都看戶籍？
                    </h4>
                    <p className="text-sm text-gray-600">
                      了解戶籍在政策中的實際用途，為什麼補助常以戶籍為判斷，以及租屋族最常踩到的誤區
                    </p>
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  to="/blog/cheng-li-chun-policy-role-explained"
                  className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <span className="text-2xl mt-1">👤</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                      為什麼新聞一直提到鄭麗君？她在政策裡扮演什麼角色？跟一般人有關嗎？
                    </h4>
                    <p className="text-sm text-gray-600">
                      了解鄭麗君在政策制定與執行中的角色定位，以及這些政策對一般民眾的實際影響
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
            "headline": "政府公告一定會影響你嗎？哪些政策其實跟多數人無關？",
            "description": "政府公告影響解析：用白話方式說明為什麼政府公告這麼多，哪些是「資訊型」不是「影響型」，以及一般民眾該怎麼判斷要不要關心。",
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
              "@id": "https://pomodoro-app-eight-rouge.vercel.app/blog/government-announcement-impact-explained"
            }
          })}
        </script>
      </Helmet>
    </>
  );
}

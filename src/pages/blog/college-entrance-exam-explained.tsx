import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import SEO from "../../components/SEO";
import ArticleCTA from "@/components/ArticleCTA";

export default function CollegeEntranceExamExplainedPage() {
  // 獲取今天的日期（格式：YYYY-MM-DD）
  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <SEO
        title="大學學測在考什麼？制度怎麼設計？跟以前聯考差在哪？"
        description="大學學測完整解析：用一般家庭能理解的方式說明為什麼會有學測，學測成績怎麼被使用，以及家長與學生最容易誤會的地方。"
        keywords="大學學測, 學測制度, 聯考, 升學制度, 政策解釋"
        url="https://pomodoro-app-eight-rouge.vercel.app/blog/college-entrance-exam-explained"
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
              📚 大學學測在考什麼？制度怎麼設計？跟以前聯考差在哪？
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
              大學學測（學科能力測驗）是目前台灣高中生升大學的主要管道之一，跟以前的聯考制度有很大差異。很多人對學測制度不太了解，或是還停留在聯考時代的觀念，其實兩者差很多。
            </p>

            <ArticleCTA placement="start" focus="summary" />


            <h2 className="text-2xl font-semibold mt-8 mb-4">為什麼會有學測？</h2>
            <p className="mb-4">
              學測是為了取代以前的聯考制度而設計的。聯考制度是「一次定終身」，只看一次考試的成績，而且每個科系都用同一套標準。學測制度則希望：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>讓學生有更多機會選擇自己想要的科系</li>
              <li>減少「一次定終身」的壓力</li>
              <li>讓大學可以根據科系特色選擇適合的學生</li>
              <li>降低只看分數、不看其他能力的問題</li>
            </ul>
            <p className="mb-4">
              所以學測不只是「考試」，而是一個「升學管道」的起點，之後還會有「申請入學」、「分發入學」等不同管道。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">學測成績怎麼被使用？</h2>
            <p className="mb-4">
              學測成績主要用於以下幾種升學管道：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>申請入學</strong>：用學測成績加上書面審查、面試等，申請想要的大學科系</li>
              <li><strong>繁星推薦</strong>：讓偏鄉或社區高中的優秀學生，可以用在校成績和學測成績申請大學</li>
              <li><strong>分發入學</strong>：如果申請入學沒上，可以用學測成績加上指考（現在的分科測驗）成績參加分發</li>
            </ul>
            <p className="mb-4">
              所以學測成績不是「唯一的標準」，只是「其中一個條件」。每個科系會要求不同的科目成績，有些科系可能只看某些科目，有些科系可能會要求全部科目都要達到一定標準。
            </p>

            <ArticleCTA placement="middle" focus="summary" />

            <h2 className="text-2xl font-semibold mt-8 mb-4">家長與學生最容易誤會的地方</h2>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">誤會一：學測成績高就一定上得了好大學</h3>
              <p className="mb-4">
                不對。學測成績只是「申請入學」的其中一個條件，還需要看書面審查、面試等。而且每個科系的標準不同，有些科系可能不看總分，只看特定科目的成績。所以學測成績高，不代表一定上得了想要的科系。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">誤會二：學測跟聯考一樣，只看分數</h3>
              <p className="mb-4">
                不對。聯考是「只看一次考試的成績」，學測則是「多管道升學」。申請入學除了學測成績，還需要看書面審查、面試等，這些都會影響結果。而且不同科系的標準不同，不是只看總分。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">誤會三：學測沒考好就沒有機會了</h3>
              <p className="mb-4">
                不對。如果學測沒考好，還有「分發入學」這個管道。分發入學會用學測成績加上分科測驗（指考）成績，如果分科測驗考得好，還是有機會上想要的科系。而且每年都有很多學生是透過分發入學上大學的。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">誤會四：所有科系都用同一套標準</h3>
              <p className="mb-4">
                不對。每個科系的要求不同，有些科系可能只看某些科目的成績，有些科系可能會要求全部科目都要達到一定標準。所以不能只用「總分」來判斷，還要看各科系的具體要求。
              </p>
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-4">一般家庭該注意的重點</h2>
            <p className="mb-4">
              對一般家庭來說，了解學測制度要注意：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>學測不是唯一的升學管道</strong>：還有申請入學、分發入學等，不用把所有希望都放在學測上</li>
              <li><strong>每個科系的要求不同</strong>：不是只看總分，還要看各科系的具體要求</li>
              <li><strong>書面審查和面試很重要</strong>：申請入學除了學測成績，書面審查和面試也會影響結果</li>
              <li><strong>分科測驗也是選項</strong>：如果學測沒考好，分科測驗（指考）也是個選擇，而且每年都有很多學生是透過分發入學上大學的</li>
            </ul>
            <p className="mb-4">
              建議提早了解各科系的要求和升學管道，不要只專注在學測成績上，也要準備書面審查和面試等項目。
            </p>
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
                to="/blog/long-term-care-subsidy-explained"
                className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-3xl mb-3">👵</div>
                <h4 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  長照補助是什麼？家裡有人需要時，政府實際能幫到哪裡？
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  了解長照補助在補什麼，哪些人比較容易符合，以及常見錯誤期待與實際差異
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
                  了解補助申請的關鍵判斷條件，包括身分、收入、居住地、用途等條件
                </p>
              </Link>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                看不懂升學制度公告或新聞？
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
                  to="/blog/long-term-care-subsidy-explained"
                  className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <span className="text-2xl mt-1">👵</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                      長照補助是什麼？家裡有人需要時，政府實際能幫到哪裡？
                    </h4>
                    <p className="text-sm text-gray-600">
                      了解長照補助在補什麼，哪些人比較容易符合，以及常見錯誤期待與實際差異
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
            "headline": "大學學測在考什麼？制度怎麼設計？跟以前聯考差在哪？",
            "description": "大學學測完整解析：用一般家庭能理解的方式說明為什麼會有學測，學測成績怎麼被使用，以及家長與學生最容易誤會的地方。",
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
              "@id": "https://pomodoro-app-eight-rouge.vercel.app/blog/college-entrance-exam-explained"
            }
          })}
        </script>
      </Helmet>
    </>
  );
}

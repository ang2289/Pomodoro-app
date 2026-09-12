import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import SEO from "../../components/SEO";
import ArticleCTA from "@/components/ArticleCTA";

export default function OvertimePayExplainedPage() {
  // 獲取今天的日期（格式：YYYY-MM-DD）
  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <SEO
        title="加班費一定要給嗎？為什麼很多人其實拿不到？"
        description="加班費制度完整解析：用白話方式說明加班費制度存在的原意，為什麼實務上常常拿不到，以及上班族最容易誤解的地方。"
        keywords="加班費, 責任制, 補休, 勞動權益, 政策解釋"
        url="https://pomodoro-app-eight-rouge.vercel.app/blog/overtime-pay-explained"
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
              ⏰ 加班費一定要給嗎？為什麼很多人其實拿不到？
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
              加班費是法律規定的，雇主應該要給，但很多人其實拿不到。這不是因為「法律沒規定」，而是因為實務上有很多「灰色地帶」，例如責任制、補休、或是雇主用其他方式規避。
            </p>

            <ArticleCTA placement="start" focus="summary" />


            <h2 className="text-2xl font-semibold mt-8 mb-4">加班費制度存在的原意</h2>
            <p className="mb-4">
              加班費制度的設計原意是「保障勞工權益」和「防止過度加班」：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>保障勞工權益</strong>：如果勞工要加班，雇主應該要給額外的報酬，不能讓勞工「免費加班」</li>
              <li><strong>防止過度加班</strong>：透過提高加班成本，讓雇主不會輕易要求勞工加班</li>
              <li><strong>公平性</strong>：如果勞工要犧牲休息時間來工作，應該要得到合理的報酬</li>
            </ul>
            <p className="mb-4">
              所以加班費不是「福利」，而是「法律規定的權利」。
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">為什麼實務上常常拿不到？</h2>
            <p className="mb-4">
              這是因為實務上有很多「灰色地帶」：
            </p>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">原因一：責任制</h3>
              <p className="mb-4">
                很多雇主會用「責任制」來規避加班費，說「你的工作性質是責任制，不用給加班費」。但其實「責任制」有很嚴格的條件，不是雇主說了算。只有特定行業和職位才能適用責任制，而且還要經過主管機關核定。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">原因二：補休</h3>
              <p className="mb-4">
                很多雇主會用「補休」來代替加班費，說「你加班可以補休，不用給加班費」。但其實「補休」和「加班費」是兩回事，補休是「額外的福利」，不能代替「法定的加班費」。而且補休要在一定期限內休完，如果沒休完，還是要給加班費。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">原因三：雇主不承認是「加班」</h3>
              <p className="mb-4">
                很多雇主會說「這不是加班，是你自己留下來做事的」，或是「這是你應該要完成的工作，不算加班」。但其實只要「超過正常工作時間」的工作，就算是加班，應該要給加班費。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">原因四：勞工不敢要求</h3>
              <p className="mb-4">
                很多勞工不敢要求加班費，因為擔心「會被解雇」或「會被刁難」。所以即使知道應該要有加班費，也不敢跟雇主要求。
              </p>
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-4">常見灰色地帶（責任制、補休）</h2>
            <p className="mb-4">
              <strong>責任制：</strong>
            </p>
            <p className="mb-4">
              責任制不是「雇主說了算」，而是有很嚴格的條件：
            </p>

            <ArticleCTA placement="middle" focus="summary" />

            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>只有特定行業和職位才能適用責任制</li>
              <li>要經過主管機關核定</li>
              <li>即使適用責任制，如果工作時間超過合理範圍，還是要給加班費</li>
            </ul>
            <p className="mb-4">
              所以如果雇主說「你是責任制，不用給加班費」，要先確認是否符合責任制的條件。
            </p>
            <p className="mb-4">
              <strong>補休：</strong>
            </p>
            <p className="mb-4">
              補休和加班費是兩回事：
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>補休是「額外的福利」，不能代替「法定的加班費」</li>
              <li>如果選擇補休，要在一定期限內休完（通常是 6 個月內）</li>
              <li>如果沒休完，還是要給加班費</li>
              <li>補休的時數要等於加班的時數，不能「打折」</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">上班族最容易誤解的地方</h2>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">誤解一：責任制就不用給加班費</h3>
              <p className="mb-4">
                不對。責任制不是「雇主說了算」，而是有很嚴格的條件。即使適用責任制，如果工作時間超過合理範圍，還是要給加班費。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">誤解二：補休可以代替加班費</h3>
              <p className="mb-4">
                不對。補休是「額外的福利」，不能代替「法定的加班費」。如果選擇補休，要在一定期限內休完，如果沒休完，還是要給加班費。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">誤解三：自己留下來做事不算加班</h3>
              <p className="mb-4">
                不對。只要「超過正常工作時間」的工作，就算是加班，應該要給加班費。不管是「雇主要求」還是「自己留下來」，只要超過正常工作時間，就算是加班。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">誤解四：加班費是「福利」不是「權利」</h3>
              <p className="mb-4">
                不對。加班費是「法律規定的權利」，不是「雇主給的福利」。如果雇主不給加班費，是違法的。
              </p>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg my-8">
              <p className="text-gray-700 leading-relaxed">
                <strong>提醒：</strong>加班費的計算方式和給付標準會隨著政策調整而改變，實際適用時請以勞動部的最新規定為準。建議了解加班費的計算方式和給付標準，確保自己的權益。
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
                to="/blog/unemployment-benefit-explained"
                className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-3xl mb-3">💼</div>
                <h4 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  失業給付是什麼？非自願離職一定領得到嗎？
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  了解失業給付的定義，為什麼一定要非自願離職，以及為什麼很多人以為能領卻領不到
                </p>
              </Link>
            </div>
          </div>
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
                  to="/blog/unemployment-benefit-explained"
                  className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <span className="text-2xl mt-1">💼</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                      失業給付是什麼？非自願離職一定領得到嗎？
                    </h4>
                    <p className="text-sm text-gray-600">
                      了解失業給付的定義，為什麼一定要非自願離職，以及為什麼很多人以為能領卻領不到
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
                  to="/blog/minimum-wage-impact-explained"
                  className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <span className="text-2xl mt-1">💰</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                      基本工資是什麼？為什麼調整後有人加薪、有人卻更辛苦？
                    </h4>
                    <p className="text-sm text-gray-600">
                      了解基本工資的設計目的，調整後對不同身分的實際影響
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
            "headline": "加班費一定要給嗎？為什麼很多人其實拿不到？",
            "description": "加班費制度完整解析：用白話方式說明加班費制度存在的原意，為什麼實務上常常拿不到，以及上班族最容易誤解的地方。",
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
              "@id": "https://pomodoro-app-eight-rouge.vercel.app/blog/overtime-pay-explained"
            }
          })}
        </script>
      </Helmet>
    </>
  );
}

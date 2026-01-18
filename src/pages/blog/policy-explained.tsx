import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import SEO from "../../components/SEO";

export default function PolicyExplainedPage() {
  // 獲取今天的日期（格式：YYYY-MM-DD）
  const today = new Date().toISOString().split('T')[0];

  const articles = [
    {
      path: "/blog/income-tax-exemption-explained",
      title: "為什麼有些人不用繳所得稅？免稅門檻到底怎麼算？",
      description: "所得稅免稅門檻完整解析：用生活情境說明為什麼有些人不用繳所得稅，免稅額、扣除額在實際生活中的意思，以及一般家庭最容易誤會的地方。",
      date: today,
      image: "💰",
    },
    {
      path: "/blog/subsidy-visibility-explained",
      title: "政府補助為什麼常常看不到？不是沒有，是你不在適用對象",
      description: "政府補助可見性完整解析：用白話方式說明補助為什麼不是「全民型」，常見被排除的幾種身分情境，以及一般人該如何正確理解補助存在的方式。",
      date: today,
      image: "💰",
    },
    {
      path: "/blog/overtime-pay-explained",
      title: "加班費一定要給嗎？為什麼很多人其實拿不到？",
      description: "加班費制度完整解析：用白話方式說明加班費制度存在的原意，為什麼實務上常常拿不到，以及上班族最容易誤解的地方。",
      date: today,
      image: "⏰",
    },
    {
      path: "/blog/dependent-deduction-explained",
      title: "扶養父母真的可以少繳稅嗎？很多人其實報錯了",
      description: "扶養扣除額完整解析：用生活案例說明扶養在制度上的真正意思，為什麼不是有給錢就算，以及一般家庭該有的正確認知。",
      date: today,
      image: "👨‍👩‍👧",
    },
    {
      path: "/blog/policy-design-reality-explained",
      title: "為什麼政策看起來對你好，實際卻無感？制度設計的現實原因",
      description: "政策設計現實解析：用白話方式說明政策設計的取捨邏輯，為什麼不可能人人都直接受惠，以及一般民眾該怎麼看政策比較不焦慮。",
      date: today,
      image: "🤔",
    },
    {
      path: "/blog/nhi-premium-explained",
      title: "健保費是怎麼算的？為什麼每個人繳的不一樣？",
      description: "健保費完整解析：用白話方式說明健保費的計算基礎，薪資、眷屬與補充保費的差別，以及一般人最常誤會的地方。",
      date: today,
      image: "🏥",
    },
    {
      path: "/blog/unemployment-benefit-explained",
      title: "失業給付是什麼？非自願離職一定領得到嗎？",
      description: "失業給付完整解析：用實際情境說明什麼是失業給付，為什麼一定要非自願離職，以及為什麼很多人以為能領卻領不到。",
      date: today,
      image: "💼",
    },
    {
      path: "/blog/labor-pension-new-system-explained",
      title: "勞退新制是什麼？雇主提撥的錢真的都給你嗎？",
      description: "勞退新制完整解析：用一般上班族能看懂的語氣說明勞退新制與舊制的核心差異，6% 提撥實際怎麼運作，以及一般人最容易誤解的地方。",
      date: today,
      image: "💰",
    },
    {
      path: "/blog/household-registration-explained",
      title: "戶籍遷出遷入有差嗎？為什麼這麼多補助都看戶籍？",
      description: "戶籍制度完整解析：用白話方式說明戶籍在政策中的實際用途，為什麼補助常以戶籍為判斷，以及租屋族最常踩到的誤區。",
      date: today,
      image: "📋",
    },
    {
      path: "/blog/government-announcement-impact-explained",
      title: "政府公告一定會影響你嗎？哪些政策其實跟多數人無關？",
      description: "政府公告影響解析：用白話方式說明為什麼政府公告這麼多，哪些是「資訊型」不是「影響型」，以及一般民眾該怎麼判斷要不要關心。",
      date: today,
      image: "📢",
    },
    {
      path: "/blog/labor-insurance-pension-explained",
      title: "勞保年金是什麼？什麼情況下領得到？一般人最容易搞錯的重點",
      description: "勞保年金完整解析：用白話方式說明勞保年金與一次領的差別，什麼情況才能請領，以及一般人最容易搞錯的重點，包括年資、年齡、金額等常見誤解。",
      date: today,
      image: "💼",
    },
    {
      path: "/blog/long-term-care-subsidy-explained",
      title: "長照補助是什麼？家裡有人需要時，政府實際能幫到哪裡？",
      description: "長照補助完整解析：用一般家庭能理解的方式說明長照補助在補什麼，哪些人比較容易符合，以及為什麼很多家庭一開始都不知道能申請。",
      date: today,
      image: "👵",
    },
    {
      path: "/blog/college-entrance-exam-explained",
      title: "大學學測在考什麼？制度怎麼設計？跟以前聯考差在哪？",
      description: "大學學測完整解析：用一般家庭能理解的方式說明為什麼會有學測，學測成績怎麼被使用，以及家長與學生最容易誤會的地方。",
      date: today,
      image: "📚",
    },
    {
      path: "/blog/hsr-booking-system-explained",
      title: "高鐵訂票為什麼這麼難？售票制度是怎麼設計的？",
      description: "高鐵訂票制度完整解析：用白話方式說明為什麼一開賣就容易滿，系統怎麼分配座位，以及為什麼不是先來先得這麼簡單。",
      date: today,
      image: "🚄",
    },
    {
      path: "/blog/minimum-wage-impact-explained",
      title: "基本工資是什麼？為什麼調整後有人加薪、有人卻更辛苦？",
      description: "基本工資調整影響完整解析：用白話方式說明基本工資的設計目的，調整後對不同身分的實際影響，以及為什麼不是所有人都直接受惠。",
      date: today,
      image: "💰",
    },
    {
      path: "/blog/income-tax-brackets-explained",
      title: "所得稅級距是什麼？為什麼加薪反而繳更多稅？一次白話說清楚",
      description: "所得稅級距完整解析：用白話方式解釋什麼是所得稅級距，為什麼不是全部收入都用最高稅率，以及一般上班族最常誤解的地方。",
      date: today,
      image: "💰",
    },
    {
      path: "/blog/minimum-wage-explained",
      title: "什麼是基本工資？調整後老闆與員工各自會遇到什麼影響？",
      description: "基本工資完整解析：了解基本工資的定義、為什麼每年會調整，以及對月薪制、時薪制的實際差異，用一般上班族看得懂的方式說明。",
      date: today,
      image: "💼",
    },
    {
      path: "/blog/labor-insurance-explained",
      title: "勞保是什麼？你每個月繳的錢到底保障了哪些事情？",
      description: "勞保完整解析：了解勞保在保什麼，包括生病、失能、退休各怎麼用，以及為什麼很多人快退休才發現不夠，用白話方式一次澄清常見迷思。",
      date: today,
      image: "🛡️",
    },
    {
      path: "/blog/cheng-li-chun-policy-role-explained",
      title: "為什麼新聞一直提到鄭麗君？她在政策裡扮演什麼角色？跟一般人有關嗎？",
      description: "鄭麗君政策角色完整解析：了解鄭麗君在政策制定與執行中的角色定位，以及這些政策對一般民眾的實際影響。",
      date: today,
      image: "👤",
    },
    {
      path: "/blog/taiwan-us-tariff-explained",
      title: "為什麼最近一直在談台美關稅？跟你我有什麼關係？",
      description: "台美關稅完整解析：整理近期新聞常出現「台美關稅」的原因，說明政府、產業與一般民眾的關聯差異，並加入常見誤解 Q&A，幫助讀者快速判斷這是不是需要關注的議題。",
      date: "2026-01-20",
      image: "🇺🇸",
    },
    {
      path: "/blog/tariff-adjustment-impact",
      title: "關稅調整會影響哪些東西？一般人會被影響嗎？",
      description: "關稅調整完整解析：了解關稅調整可能影響的項目，包含進口商品價格、汽車、家電、日用品等，用一般人能懂的方式說明對生活的實際影響。",
      date: "2026-01-19",
      image: "💼",
    },
    {
      path: "/blog/232-clause-explained",
      title: "232 條款是什麼？為什麼台灣一直被提到？一次白話解釋",
      description: "232 條款完整解析：了解什麼是 232 條款，為何與國家安全、進口關稅有關，以及為什麼台灣會被頻繁提及。用一般人能懂的方式說明對生活的影響。",
      date: "2026-01-18",
      image: "📜",
    },
    {
      path: "/blog/subsidy-eligibility-explained",
      title: "政府補助怎麼判斷？為什麼別人領得到，你卻不行？一次搞懂常見關鍵條件",
      description: "政府補助完整解析：了解補助申請的關鍵判斷條件，包括身分、收入、居住地、用途等條件，快速判斷自己是否符合補助資格。",
      date: "2026-01-17",
      image: "💰",
    },
    {
      path: "/blog/house-tax-explained",
      title: "房屋稅是什麼？自住、出租、空屋差在哪？一般人一定要懂的重點整理",
      description: "房屋稅完整解析：了解自住、出租、空屋在房屋稅認定與稅率上的差異，以及一般房屋持有者需要知道的重點。",
      date: "2026-01-16",
      image: "🏠",
    },
    {
      path: "/blog/car-import-tariff-explained",
      title: "汽車關稅是什麼？會影響車價嗎？一般人一定要懂的重點整理（2026 最新）",
      description: "汽車關稅完整解析：了解進口車關稅如何計算、對車價的影響，以及一般消費者需要知道的重點。",
      date: "2026-01-15",
      image: "🚗",
    },
    // 未來可以在此新增更多政策白話解釋文章
  ];

  return (
    <>
      <SEO
        title="政策白話解釋｜看不懂政策新聞？幫你整理「跟你有沒有關係」"
        description="政策新聞、稅制、補助常常寫得很複雜，其實多數人只想知道一件事：這跟我有沒有關係？本區將常見政策與制度整理成白話版本，協助快速理解生活影響。"
        keywords="政策解釋, 政策白話, 政策新聞, 政策分析, 稅制解釋, 補助說明"
        url="https://pomodoro-app-eight-rouge.vercel.app/blog/policy-explained"
      />

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-6">
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            ← 返回首頁
          </Link>
        </div>

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            📋 政策白話解釋
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            看不懂政策新聞？幫你整理「跟你有沒有關係」
          </p>
          
          {/* 頁面頂部說明區塊 */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-8">
            <p className="text-gray-700 leading-relaxed">
              政策新聞、稅制、補助常常寫得很複雜，其實多數人只想知道一件事：<br />
              <strong className="text-gray-900">這跟我有沒有關係？</strong><br />
              本區將常見政策與制度整理成白話版本，協助快速理解生活影響。
            </p>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.path}
              to={article.path}
              className="group bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="text-4xl mb-4 text-center">{article.image}</div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-semibold">
                  政策白話解釋
                </span>
                <span className="text-xs text-gray-500">{article.date}</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">
                {article.title}
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm mb-4">
                {article.description}
              </p>
              <div className="text-blue-600 font-semibold text-sm text-center group-hover:text-blue-700 transition-colors">
                閱讀更多 →
              </div>
            </Link>
          ))}
        </div>

        {articles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">目前尚無文章</p>
          </div>
        )}

        {/* FAQ 區塊 */}
        <section className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            常見問題｜政策白話解釋
          </h2>
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Q1：什麼是政策白話解釋？
              </h3>
              <p className="text-gray-700 leading-relaxed">
                政策白話解釋是將政策、稅制、補助等原本較為複雜的官方資訊，用一般人能理解的方式重新整理，協助快速判斷是否與自己有關。
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Q2：這裡的內容適合哪些人？
              </h3>
              <p className="text-gray-700 leading-relaxed">
                適合看到政策新聞卻看不懂、需要快速了解生活影響的一般民眾，包含上班族、家庭、學生與長者。
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Q3：文章內容是否具有法律效力？
              </h3>
              <p className="text-gray-700 leading-relaxed">
                本區內容為資訊整理與白話說明，非法律意見或官方解釋，實際適用仍需以政府公告與主管機關說明為準。
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Q4：如果我還是不確定自己符不符合怎麼辦？
              </h3>
              <p className="text-gray-700 leading-relaxed">
                你可以將政策公告或新聞內容貼上來，系統會協助整理重點，幫你判斷是否可能與你有關。
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* FAQPage JSON-LD 結構化資料 */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "什麼是政策白話解釋？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "政策白話解釋是將政策、稅制、補助等原本較為複雜的官方資訊，用一般人能理解的方式重新整理，協助快速判斷是否與自己有關。"
                }
              },
              {
                "@type": "Question",
                "name": "這裡的內容適合哪些人？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "適合看到政策新聞卻看不懂、需要快速了解生活影響的一般民眾，包含上班族、家庭、學生與長者。"
                }
              },
              {
                "@type": "Question",
                "name": "文章內容是否具有法律效力？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "本區內容為資訊整理與白話說明，非法律意見或官方解釋，實際適用仍需以政府公告與主管機關說明為準。"
                }
              },
              {
                "@type": "Question",
                "name": "如果我還是不確定自己符不符合怎麼辦？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "你可以將政策公告或新聞內容貼上來，系統會協助整理重點，幫你判斷是否可能與你有關。"
                }
              }
            ]
          })}
        </script>
      </Helmet>
    </>
  );
}

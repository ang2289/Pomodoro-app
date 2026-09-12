import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SEO from "../../components/SEO";
import ArticleCTA from "@/components/ArticleCTA";

export default function AidsPage() {
  const { t, i18n } = useTranslation();
  const isEnglish = !i18n.language.startsWith("zh");

  return (
    <>
      <SEO
        title="Government Subsidy Guide 2025 — Financial Help & Application Tips"
        description="Updated reminders and guides for Taiwan government subsidies. Easy-to-read financial planning content and useful public benefit updates."
        keywords="government subsidy, Taiwan subsidy 2025, financial guide, anti-fraud, tax tips, government benefits"
        url="https://pomodoro-app-eight-rouge.vercel.app/aids"
      />

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-right mb-4">
          <Link
            to="/"
            className="bg-blue-600 !text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
          >
            {t("homepage")}
          </Link>
        </div>
        <h1 className="text-3xl font-extrabold mb-6">
          💰 {t("subsidy_package")}
        </h1>

        <p className="text-gray-700 leading-7 mb-6">
          {isEnglish
            ? "This section organizes common living subsidy programs in Taiwan (childcare allowance, housing rent subsidy, long-term care subsidy, etc.)."
            : "本區將整理台灣常見的生活補助項目（育兒津貼、房租補貼、長照補助…等）。"}
          <br />
          ⚠️{" "}
          {isEnglish
            ? "This page is continuously updated. Please refer to the latest government announcements."
            : "本頁持續更新中，以政府最新公告為準。"}
        </p>

        {/* 新增：精選最新兩篇 */}
        <section className="grid md:grid-cols-2 gap-6">
          <article className="p-5 rounded-xl border bg-white shadow-sm">
            <h2 className="text-xl font-bold mb-2">
              {isEnglish
                ? "🏠 2025 Rental Subsidy New System | 30 Billion Central Government Expanded Rental Subsidy"
                : "🏠 2025 租屋補助新制｜300 億中央擴大租金補貼"}
            </h2>
            <p className="text-gray-600 mb-3">
              {isEnglish
                ? "Applications accepted in 2025. Existing users are automatically imported by the system, new users apply online. Calculated based on actual rent, with monthly subsidy limits in various counties and cities, plus tax benefits for public landlords."
                : "114 年度受理，舊戶系統自動帶入，新戶線上申請；以實際租金核算，各縣市有月補貼上限，並搭配公益出租人稅務優惠。"}
            </p>
            <Link 
              to="/aids/rental-subsidy-2025" 
              className="inline-block bg-blue-600 !text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              style={{ color: '#ffffff', fontWeight: '700' }}
            >
              {isEnglish ? "Read More →" : "閱讀詳情 →"}
            </Link>
          </article>

          <article className="p-5 rounded-xl border bg-white shadow-sm">
            <h2 className="text-xl font-bold mb-2">
              {isEnglish
                ? "👵 Long-term Care 2.0 Update | 2025 Amendment and Benefit Expansion"
                : "👵 長照 2.0 更新｜114 年修法與給付擴充（2025）"}
            </h2>
            <p className="text-gray-600 mb-3">
              {isEnglish
                ? "Phased implementation starting from 2025/09/01. Expanded community-based services for families with foreign caregivers, inclusion of young-onset dementia and PAC, and smart assistive device rental up to 60,000 NTD/3 years."
                : "114/09/01 起分階段上路；放寬外籍看護家庭使用社區式服務、納入年輕型失智與 PAC、智慧輔具租賃最高 6 萬/3 年。"}
            </p>
            <Link 
              to="/aids/ltc-2025-update" 
              className="inline-block bg-blue-600 !text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              style={{ color: '#ffffff', fontWeight: '700' }}
            >
              {isEnglish ? "Read More →" : "閱讀詳情 →"}
            </Link>
          </article>

          <article className="p-5 rounded-xl border bg-white shadow-sm">
            <h2 className="text-xl font-bold mb-2">
              {isEnglish
                ? "🧑‍💼 Youth Employment / Career Transition Subsidy Guide (2026)"
                : "🧑‍💼 青年就業／轉職補助懶人包（2026）"}
            </h2>
            <p className="text-gray-600 mb-3">
              {isEnglish
                ? "A guide to common 2025–2026 youth employment and career transition subsidy programs, including application eligibility, subsidy amounts, and process explanations to help quickly determine if you meet the application requirements."
                : "整理 2025–2026 年青年就業與轉職常見補助方案，包含申請資格、補助金額與流程說明，協助快速了解是否符合申請條件。"}
            </p>
            <Link 
              to="/aids/youth-employment-2026" 
              className="inline-block bg-blue-600 !text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              style={{ color: '#ffffff', fontWeight: '700' }}
            >
              {isEnglish ? "Read More →" : "閱讀詳情 →"}
            </Link>
          </article>

          <article className="p-5 rounded-xl border bg-white shadow-sm">
            <h2 className="text-xl font-bold mb-2">
              {isEnglish
                ? "👶 Childcare / Daycare Subsidy Guide (2026)"
                : "👶 育兒／托育補助懶人包（2026）"}
            </h2>
            <p className="text-gray-600 mb-3">
              {isEnglish
                ? "A guide to common 2025–2026 childcare and daycare subsidies, helping you quickly understand application eligibility, subsidy methods, and important notes."
                : "整理 2025–2026 年育兒與托育常見補助，快速了解申請資格、補助方式與注意事項。"}
            </p>
            <Link 
              to="/aids/childcare-subsidy-2026" 
              className="inline-block bg-blue-600 !text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              style={{ color: '#ffffff', fontWeight: '700' }}
            >
              {isEnglish ? "Read More →" : "閱讀詳情 →"}
            </Link>
          </article>

          <article className="p-5 rounded-xl border bg-white shadow-sm">
            <h2 className="text-xl font-bold mb-2">
              {isEnglish
                ? "💰 Low-Income / Middle-Low-Income Household Subsidy Guide (2026)"
                : "💰 低收入戶／中低收入戶補助懶人包（2026）"}
            </h2>
            <p className="text-gray-600 mb-3">
              {isEnglish
                ? "A guide to common 2025–2026 low-income and middle-low-income household subsidy items and application highlights, helping you quickly understand basic eligibility requirements."
                : "整理 2025–2026 年低收入戶與中低收入戶常見補助項目與申請重點，協助快速了解基本資格。"}
            </p>
            <Link 
              to="/aids/low-income-subsidy-2026" 
              className="inline-block bg-blue-600 !text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              style={{ color: '#ffffff', fontWeight: '700' }}
            >
              {isEnglish ? "Read More →" : "閱讀詳情 →"}
            </Link>
          </article>

          <article className="p-5 rounded-xl border bg-white shadow-sm">
            <h2 className="text-xl font-bold mb-2">
              {isEnglish
                ? "🧓 Long-Term Care / Medical Subsidy Guide (2026)"
                : "🧓 長照／醫療補助懶人包（2026）"}
            </h2>
            <p className="text-gray-600 mb-3">
              {isEnglish
                ? "A guide to common 2025–2026 long-term care and medical subsidy items, helping you quickly understand application eligibility and basic procedures."
                : "整理 2025–2026 年長照與醫療常見補助項目，協助快速了解申請資格與基本流程。"}
            </p>
            <Link 
              to="/aids/ltc-medical-subsidy-2026" 
              className="inline-block bg-blue-600 !text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              style={{ color: '#ffffff', fontWeight: '700' }}
            >
              {isEnglish ? "Read More →" : "閱讀詳情 →"}
            </Link>
          </article>

          <article className="p-5 rounded-xl border bg-white shadow-sm">
            <h2 className="text-xl font-bold mb-2">
              {isEnglish
                ? "❓ Can Subsidies Be Received Simultaneously?"
                : "❓ 補助可以同時領嗎？"}
            </h2>
            <p className="text-gray-600 mb-3">
              {isEnglish
                ? "A guide to common rules and practical scenarios for whether government subsidies can be applied for simultaneously, helping you quickly determine the possibility of concurrent receipt."
                : "整理政府補助是否可同時申請的常見規則與實務情境，協助快速判斷併領可能性。"}
            </p>
            <Link 
              to="/aids/subsidy-concurrent-qa-2026" 
              className="inline-block bg-blue-600 !text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              style={{ color: '#ffffff', fontWeight: '700' }}
            >
              {isEnglish ? "Read More →" : "閱讀詳情 →"}
            </Link>
          </article>

          <article className="p-5 rounded-xl border bg-white shadow-sm">
            <h2 className="text-xl font-bold mb-2">
              {isEnglish
                ? "📋 Government Subsidy Quick Guide (2026)"
                : "📋 政府補助快速導覽（2026）"}
            </h2>
            <p className="text-gray-600 mb-3">
              {isEnglish
                ? "A quick guide to common 2026 government subsidy types to help you find suitable subsidy directions."
                : "快速整理 2026 年常見政府補助類型，協助找到適合的補助方向。"}
            </p>
            <Link 
              to="/aids/subsidy-overview-2026" 
              className="inline-block bg-blue-600 !text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              style={{ color: '#ffffff', fontWeight: '700' }}
            >
              {isEnglish ? "Read More →" : "閱讀詳情 →"}
            </Link>
          </article>

          <article className="p-5 rounded-xl border bg-white shadow-sm">
            <h2 className="text-xl font-bold mb-2">
              {isEnglish
                ? "🧭 Subsidy Self-Check"
                : "🧭 補助自我檢查"}
            </h2>
            <p className="text-gray-600 mb-3">
              {isEnglish
                ? "Quickly determine which government subsidies you may be eligible for through simple questions."
                : "透過簡單問題快速判斷，了解自己可能符合哪些政府補助。"}
            </p>
            <Link 
              to="/aids/subsidy-self-check-2026" 
              className="inline-block bg-blue-600 !text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              style={{ color: '#ffffff', fontWeight: '700' }}
            >
              {isEnglish ? "Read More →" : "閱讀詳情 →"}
            </Link>
          </article>

          <article className="p-5 rounded-xl border bg-white shadow-sm">
            <h2 className="text-xl font-bold mb-2">
              {isEnglish
                ? "🤖 How to Determine Subsidy Eligibility?"
                : "🤖 補助怎麼判斷？"}
            </h2>
            <p className="text-gray-600 mb-3">
              {isEnglish
                ? "Explains common government subsidy eligibility criteria to help understand application logic."
                : "說明政府補助常見判斷條件，協助理解申請邏輯。"}
            </p>
            <Link 
              to="/aids/subsidy-selection-guide-2026" 
              className="inline-block bg-blue-600 !text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              style={{ color: '#ffffff', fontWeight: '700' }}
            >
              {isEnglish ? "Read More →" : "閱讀詳情 →"}
            </Link>
          
        <ArticleCTA placement="start" focus="tools" />
        <ArticleCTA placement="middle" focus="tools" />
        <ArticleCTA placement="afterFaq" focus="tools" />
        <ArticleCTA placement="bottom" focus="tools" />

      </article>
        </section>

      </div>
    </>
  );
}


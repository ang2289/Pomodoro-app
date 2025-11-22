import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SEO from "../../components/SEO";

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
            className="bg-blue-500 !text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600"
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
              className="inline-block bg-blue-500 !text-white font-bold px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors duration-200"
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
              className="inline-block bg-blue-500 !text-white font-bold px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors duration-200"
              style={{ color: '#ffffff', fontWeight: '700' }}
            >
              {isEnglish ? "Read More →" : "閱讀詳情 →"}
            </Link>
          </article>
        </section>

      </div>
    </>
  );
}


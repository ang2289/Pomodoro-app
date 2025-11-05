import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ModuleDropdown from "@/components/ModuleDropdown";
import OfficialSourceNote from '@/components/OfficialSourceNote';

const AidArticles = [
  {
    title: "🏠 2025 租屋補助新制｜300 億中央擴大租金補貼專案",
    date: "2025-01-10",
    desc: "申請家庭成員兩人以上、或低收入／中低收入戶優先。租屋補貼放寬，協助減輕租金負擔。",
    link: "/aids/rental-subsidy-2025",
  },
  {
    title: "👵 長照 2.0 更新｜114 年修法與給付擴充（2025）",
    date: "2025-02-01",
    desc: "自 114/09 起分階段上路，放寬外籍看護家庭使用社區式服務，智慧輔具補助最高 6 萬／3 年。",
    link: "/aids/ltc-2025-update",
  },
];

export default function LazyHome() {
  const { t, i18n } = useTranslation();
  const [visibleCount, setVisibleCount] = useState(3);
  const visibleArticles = AidArticles.slice(0, visibleCount);
  const isEnglish = !i18n.language.startsWith("zh");
  
  return (
    <>
      <Helmet>
        <title>
          {isEnglish 
            ? "2025 Taiwan Living Subsidies & Retirement Guide | RxV Dream Creation Studio"
            : "2025 台灣生活補助與退休懶人包｜RxV 夢想創作工作室"
          }
        </title>
        <meta
          name="description"
          content={
            isEnglish
              ? "One-stop shop to understand Taiwan living subsidies, retirement pension calculations, and health financial knowledge. Made by RxV Dream Creation Studio to help you plan a stable retirement life."
              : "一站了解台灣生活補助、退休金試算與健康理財知識。由 RxV 夢想創作工作室製作，幫助您規劃安穩退休生活。"
          }
        />
        <meta name="keywords" content={isEnglish ? "retirement finance, Taiwan subsidies, labor pension, guide, health finance, RxV" : "退休理財, 台灣補助, 勞保退休金, 懶人包, 健康理財, RxV"} />
        <meta name="author" content="RxV 夢想創作工作室" />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content={
            isEnglish
              ? "2025 Taiwan Living Subsidies & Retirement Guide | RxV Dream Creation Studio"
              : "2025 台灣生活補助與退休懶人包｜RxV 夢想創作工作室"
          }
        />
        <meta
          property="og:description"
          content={t("homepage_description")}
        />
        <meta property="og:image" content="/images/cover-retirement.jpg" />
        <meta property="og:url" content="https://rxv-dreamstudio.vercel.app/" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "2025 台灣生活補助與退休懶人包",
            "url": "https://rxv-dreamstudio.vercel.app/",
            "author": {
              "@type": "Organization",
              "name": "RxV 夢想創作工作室",
              "url": "https://rxv-dreamstudio.vercel.app"
            },
            "description": "查找政府補助、退休金試算與健康理財知識，一站了解生活津貼與理財策略。",
            "inLanguage": "zh-TW",
            "publisher": {
              "@type": "Organization",
              "name": "RxV 夢想創作工作室",
              "logo": {
                "@type": "ImageObject",
                "url": "https://rxv-dreamstudio.vercel.app/logo.png"
              }
            },
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://rxv-dreamstudio.vercel.app/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            },
            "hasPart": [
              {
                "@type": "WebPage",
                "name": isEnglish ? "Subsidy Package" : "補助懶人包",
                "url": "https://rxv-dreamstudio.vercel.app/blog"
              },
              {
                "@type": "WebPage",
                "name": isEnglish ? "Health & Finance" : "健康與理財專欄",
                "url": "https://rxv-dreamstudio.vercel.app/blog"
              },
              {
                "@type": "WebPage",
                "name": isEnglish ? "Pension Column" : "退休金專欄",
                "url": "https://rxv-dreamstudio.vercel.app/blog"
              }
            ]
          })}
        </script>
      </Helmet>

      <div className="max-w-4xl mx-auto py-10">
        <div className="mb-4">
          <ModuleDropdown />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
          {isEnglish
            ? 'Welcome to Subsidy Info Portal'
            : '補助懶人包資訊中心'}
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed mb-10 text-center">
          {isEnglish
            ? 'Explore verified government programs, subsidies, and official announcements in one place.'
            : '在這裡查詢最新政府補助、政策公告與防詐提醒資訊，資料皆來自官方網站。'}
        </p>

        {/* 其他主題（示範區） */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl mx-auto">
          <Link
            to="/aids"
            className="border rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-all"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-2">💰 {t('subsidy_package')}</h2>
            <p className="text-gray-600 text-sm">
              {t('subsidy_package_desc')}
            </p>
          </Link>

          <Link
            to="/finance"
            className="border rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-all"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-2">🩺 {t('health_finance')}</h2>
            <p className="text-gray-600 text-sm">
              {t('health_finance_desc')}
            </p>
          </Link>

          <Link
            to="/retirement"
            className="border rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-all"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-2">🏦 {t('pension_column')}</h2>
            <p className="text-gray-600 text-sm">
              {t('pension_column_desc')}
            </p>
          </Link>
        </div>

        {/* 📢 最新官方公告 */}
        <section className="bg-gradient-to-b from-blue-50 to-white rounded-2xl shadow-md p-6 mb-10">
          <h2 className="text-xl font-semibold mb-4">
            📢 {isEnglish ? "Latest Official Announcement" : "最新官方公告"}
          </h2>

          <div className="border border-blue-100 rounded-lg p-5 hover:shadow transition-all duration-200">
            <h3 className="text-lg font-bold mb-2">
              <Link
                to="/finance/anti-fraud-2025"
                className="text-blue-700 hover:underline"
              >
                {isEnglish
                  ? "⚠️ NT$10,000 Subsidy Alert｜Beware of Scams!"
                  : "⚠️ 普發一萬元補助提醒｜認明官網防詐騙！"}
              </Link>
            </h3>
            <p className="text-gray-600 mb-3">2025-11-04</p>
            <p className="text-gray-800 mb-4">
              {isEnglish
                ? "The Executive Yuan announced the NT$10,000 subsidy program. Visit https://10000.gov.tw and beware of fake links or scams."
                : "行政院宣布普發一萬元補助方案即將開放，提醒民眾認明官方網站 https://10000.gov.tw，勿點陌生連結，防止詐騙。"}
            </p>

            <Link
              to="/finance/anti-fraud-2025"
              className="inline-block bg-blue-500 !text-white !font-bold px-4 py-2 rounded-full hover:bg-blue-600 transition-all duration-200"
              style={{ 
                color: '#ffffff', 
                fontWeight: '700',
                textDecoration: 'none',
                WebkitTextFillColor: '#ffffff'
              }}
            >
              <span style={{ color: '#ffffff', fontWeight: '700' }}>
                {isEnglish ? "Read More →" : "閱讀更多 →"}
              </span>
            </Link>
          </div>

          <OfficialSourceNote />
        </section>

        {/* 暫時隱藏送審用 */}
        {false && (
          <section className="mt-10">
            <h2 className="text-xl font-bold mb-4">📰 最新補助懶人包文章</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {visibleArticles.map((article, index) => (
                <div key={index} className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition">
                  <p className="text-gray-800 font-semibold mb-2">{article.title}</p>
                  <p className="text-gray-500 text-sm mb-2">{article.date}</p>
                  <p className="text-gray-600 mb-2">{article.desc}</p>
                  <Link to={article.link} className="text-blue-600 underline">閱讀更多 →</Link>
                </div>
              ))}
            </div>

            {visibleCount < AidArticles.length && (
              <div className="text-center mt-6">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 2)}
                  className="px-5 py-2 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition"
                >
                  載入更多
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </>
  );
}


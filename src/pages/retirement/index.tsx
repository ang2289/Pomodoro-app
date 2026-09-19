import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

export default function RetirementPage() {
  const { t, i18n } = useTranslation();
  const isEnglish = !i18n.language.startsWith("zh");

  return (
    <>
      <Helmet>
        <title>
          {isEnglish
            ? "📊 Labor Pension Calculation | 2025 Retirement Guide | RxV"
            : "📊 勞保退休金試算｜2025 退休金懶人包｜RxV"}
        </title>
        <meta
          name="description"
          content={
            isEnglish
              ? "Integrates Labor Insurance, Labor Pension, and Public Service Pension calculation tools and tutorials, helping you quickly understand retirement planning directions."
              : "整合勞保、勞退、公保退休金試算工具與教學，讓你快速了解退休準備方向。"
          }
        />
        <meta
          name="keywords"
          content={
            isEnglish
              ? "labor insurance pension, labor pension calculation, public service pension, retirement planning, RxV"
              : "勞保退休金, 勞退試算, 公保, 退休金計算, 理財規劃, RxV"
          }
        />
        <meta
          property="og:title"
          content={isEnglish ? "Labor Pension Calculation" : "勞保退休金試算"}
        />
        <meta
          property="og:description"
          content={
            isEnglish
              ? "Master retirement pension estimation methods to help you plan a stable retirement life early."
              : "掌握退休金估算方式，協助您提早規劃安穩退休生活。"
          }
        />
      </Helmet>

      <main className="max-w-5xl mx-auto py-10 px-4 text-gray-800">
        <div className="text-right mb-4">
          <Link
            to="/"
            className="bg-blue-600 !text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
          >
            {t("homepage")}
          </Link>
        </div>
        {/* 頁面標題 */}
        <h1 className="text-3xl font-bold mb-4 flex items-center">
          {isEnglish ? "📊 Labor Pension Calculation" : "📊 勞保退休金試算"}
        </h1>
        <p className="text-gray-600 mb-8">
          {isEnglish
            ? "Includes articles related to Labor Insurance and Labor Pension, helping you understand retirement pension calculation, application procedures, and tax-saving strategies. Each article contains official information sources for easy reference and backup."
            : "收錄勞保與勞退金相關文章，協助你了解退休金試算、申請流程與節稅策略。每篇皆含官方資訊來源，方便查詢與備份使用。"}
        </p>

        {/* 文章卡片區 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 卡片 1 */}
          <div className="border border-gray-200 rounded-2xl shadow-sm bg-white hover:shadow-md transition p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {isEnglish
                ? "💰 Labor Insurance Old-Age Benefit Calculation Guide | 2025 Latest Retirement Pension Application"
                : "💰 勞保老年給付試算懶人包｜2025 最新退休金申請教學"}
            </h2>
            <p className="text-gray-700 mb-3">
              {isEnglish
                ? "Want to know how much labor insurance old-age benefit you can receive after retirement? This guide teaches you to quickly grasp the latest regulations and calculation methods for 2025."
                : "想了解退休後可以領多少勞保老年給付嗎？這篇懶人包教你快速掌握 2025 年最新規定與試算方式。"}
            </p>
            <p className="text-gray-500 text-sm mb-4">2025-11-04</p>
            <Link
              to="/pension/insurance-oldage-2025"
              className="inline-block bg-blue-600 !text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              style={{ color: '#ffffff', fontWeight: '700' }}
            >
              {isEnglish ? "Read More →" : "閱讀詳情 →"}
            </Link>
          </div>

          {/* 卡片 2 */}
          <div className="border border-gray-200 rounded-2xl shadow-sm bg-white hover:shadow-md transition p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {isEnglish
                ? "🧾 Labor Pension Self-Contribution Guide | 2025 Benefits & Application Process"
                : "🧾 勞退金自提教學｜2025 一次看懂自提 6% 的好處與申請流程"}
            </h2>
            <p className="text-gray-700 mb-3">
              {isEnglish
                ? "Workers can voluntarily contribute 6% of their salary monthly to ensure better retirement benefits. This article teaches you how to apply and save on taxes."
                : "勞工可自願每月提繳薪資的 6%，讓退休金更有保障，本文教你如何申請與節稅。"}
            </p>
            <p className="text-gray-500 text-sm mb-4">2025-11-04</p>
            <Link
              to="/pension/self-contribution-2025"
              className="inline-block bg-blue-600 !text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              style={{ color: '#ffffff', fontWeight: '700' }}
            >
              {isEnglish ? "Read More →" : "閱讀詳情 →"}
            </Link>
          </div>
        </div>

      </main>
    </>
  );
}


import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function PensionPage() {
  const { t, i18n } = useTranslation();
  const isEnglish = !i18n.language.startsWith("zh");

  const pensionArticles = [
    {
      title: isEnglish
        ? "Labor Insurance Old-Age Benefit Calculation Guide | 2025 Latest Retirement Pension Application"
        : "勞保老年給付試算懶人包｜2025 最新退休金申請教學",
      date: "2025-11-04",
      desc: isEnglish
        ? "Quickly understand how to apply for and calculate Labor Insurance old-age benefits. This guide compiles 2025 conditions, calculation methods, and application procedures."
        : "快速了解勞保老年給付申請與試算方式。本文整理 2025 年勞保老年給付條件、金額試算與申請流程。",
      link: "/pension/insurance-oldage-2025",
    },
    {
      title: isEnglish
        ? "Labor Pension Self-Contribution Guide | 2025 Benefits & Application Process"
        : "勞退金自提教學｜2025 一次看懂自提 6% 的好處與申請流程",
      date: "2025-11-04",
      desc: isEnglish
        ? "Workers can voluntarily contribute 6% of their salary to their personal pension account, ensuring more secure retirement savings. This article explains the 2025 self-contribution process and benefits."
        : "勞退金可由勞工自願提繳 6%，讓退休金更有保障。本文說明 2025 年自提流程與注意事項。",
      link: "/pension/self-contribution-2025",
    },
  ];

  return (
    <>
      <Helmet>
        <title>
          {isEnglish
            ? "💰 Pension Guide | RxV Dream Creation Studio"
            : "💰 退休金懶人包｜RxV 夢想創作工作室"}
        </title>
        <meta
          name="description"
          content={
            isEnglish
              ? "Includes articles on Labor Insurance old-age benefits, Labor Pension self-contribution, and other retirement-related topics, helping you quickly understand eligibility requirements, calculation methods, and application procedures."
              : "收錄勞保老年給付、勞退金自提等退休金相關文章，幫助你快速了解申請條件、試算方式與申請流程。"
          }
        />
        <meta
          name="keywords"
          content={
            isEnglish
              ? "pension, labor insurance old-age benefit, labor pension, retirement planning, RxV"
              : "退休金, 勞保老年給付, 勞退金, 退休規劃, RxV 專欄"
          }
        />
        <meta
          property="og:title"
          content={isEnglish ? "Pension Guide" : "退休金懶人包"}
        />
        <meta
          property="og:description"
          content={
            isEnglish
              ? "The most comprehensive pension application guide, including Labor Insurance benefits and Labor Pension self-contribution, making retirement planning clearer."
              : "最完整的退休金申請教學，包含勞保給付與勞退自提，讓退休規劃更清晰。"
          }
        />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://rxv-dreamstudio.vercel.app/pension" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": isEnglish ? "Pension Guide" : "退休金懶人包",
            "url": "https://rxv-dreamstudio.vercel.app/pension",
            "description": isEnglish
              ? "Includes articles on Labor Insurance old-age benefits, Labor Pension self-contribution, and other retirement-related topics, helping users quickly understand eligibility requirements and procedures."
              : "收錄勞保老年給付、勞退金自提等退休金相關文章，幫助使用者快速了解申請條件與流程。",
            "inLanguage": isEnglish ? "en-US" : "zh-TW",
            "publisher": {
              "@type": "Organization",
              "name": "RxV 夢想創作工作室",
              "url": "https://rxv-dreamstudio.vercel.app"
            }
          })}
        </script>
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-right mb-4">
          <Link
            to="/"
            className="bg-blue-500 !text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600"
          >
            {t("homepage")}
          </Link>
        </div>
        <h1 className="text-2xl font-bold mb-4">
          {isEnglish ? "💰 Pension Guide" : "💰 退休金懶人包"}
        </h1>
        <p className="text-gray-600 mb-6">
          {isEnglish
            ? "Includes articles on Labor Insurance old-age benefits, Labor Pension self-contribution, and other retirement-related topics, helping you quickly understand eligibility requirements, calculation methods, and application procedures."
            : "收錄勞保老年給付、勞退金自提等退休金相關文章，幫助你快速了解申請條件、試算方式與申請流程。"}
        </p>

        {/* 文章列表 */}
        <section className="grid md:grid-cols-2 gap-6">
          {pensionArticles.map((article) => (
            <article key={article.link} className="p-5 rounded-xl border bg-white shadow-sm">
              <h2 className="text-xl font-bold mb-2">{article.title}</h2>
              <p className="text-gray-600 mb-3 text-sm">{article.desc}</p>
              <p className="text-gray-500 text-xs mb-3">{article.date}</p>
              <Link 
                to={article.link} 
                className="inline-block bg-blue-500 !text-white font-bold px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors duration-200"
                style={{ color: '#ffffff', fontWeight: '700' }}
              >
                {isEnglish ? "Read More →" : "閱讀詳情 →"}
              </Link>
            </article>
          ))}
        </section>
      </div>
    </>
  );
}


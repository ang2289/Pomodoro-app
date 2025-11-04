import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useFinanceArticles from "../../hooks/useFinanceArticles";
import OfficialSourceNote from '@/components/OfficialSourceNote';

export default function FinancePage() {
  const { t, i18n } = useTranslation();
  const isEnglish = !i18n.language.startsWith("zh");
  const articles = useFinanceArticles();

  // 將 hook 返回的文章轉換為頁面需要的格式
  const financeArticles = articles.map((article) => ({
    title: article.title,
    date: article.date,
    desc: article.summary,
    link: `/finance/${article.id === 'health-balance' ? 'health-balance-2025' : article.id === 'retirement-balance' ? 'retire-plan-2025' : 'anti-fraud-2025'}`,
  }));

  return (
    <>
      <Helmet>
        <title>
          {isEnglish
            ? "📖 Health & Finance Column | RxV Dream Creation Studio"
            : "📖 健康與理財專欄｜RxV 夢想創作工作室"}
        </title>
        <meta
          name="description"
          content={
            isEnglish
              ? "Integrates healthy living and financial knowledge, exploring mind-body balance, retirement planning, and investment mindset. Help you find stability in a fast-paced life."
              : "整合健康生活與理財知識，探討身心平衡、退休規劃與投資心態。幫助您在快節奏生活中找到安定力量。"
          }
        />
        <meta
          name="keywords"
          content={
            isEnglish
              ? "health finance, retirement planning, investment mindset, wealth management, mental health, RxV"
              : "健康理財, 退休規劃, 投資心態, 財富管理, 心靈健康, RxV"
          }
        />
        <meta
          property="og:title"
          content={isEnglish ? "Health & Finance Column" : "健康與理財專欄"}
        />
        <meta
          property="og:description"
          content={
            isEnglish
              ? "Enhance quality of life from both spiritual and financial perspectives, mastering the balance between finance and health."
              : "從心靈與財務兩面提升生活品質，掌握理財與健康平衡之道。"
          }
        />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://rxv-dreamstudio.vercel.app/finance" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": isEnglish ? "Health & Finance Column" : "健康與理財專欄",
            "url": "https://rxv-dreamstudio.vercel.app/finance",
            "description": isEnglish
              ? "Integrates healthy living and retirement financial management topics, helping users build a balanced and happy life."
              : "整合健康生活與退休理財的專題內容，幫助使用者建立平衡的幸福人生。",
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
          {isEnglish ? "📖 Health & Finance Column" : "📖 健康與理財專欄"}
        </h1>
        <p className="text-gray-600 mb-6">
          {isEnglish
            ? "Includes articles on healthy living and retirement financial management, helping you achieve balance between physical and mental health and financial stability. Includes dietary advice, retirement planning, investment mindset, and mental health topics."
            : "收錄健康生活與退休理財文章，幫助你在身心健康與財務穩定間取得平衡。包含飲食建議、退休規劃、投資心態與心理健康專題。"}
        </p>

        {/* 文章列表 */}
        <section className="grid md:grid-cols-2 gap-6">
          {financeArticles.map((article) => (
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

        <OfficialSourceNote />
      </div>
    </>
  );
}


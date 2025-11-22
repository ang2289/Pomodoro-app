import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SEO from "../../components/SEO";
import useFinanceArticles from "../../hooks/useFinanceArticles";

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
      <SEO
        title="Health & Financial Tips 2025 — Retirement, Tax, Insurance"
        description="Practical guides for personal finance, retirement planning, tax optimization, and health-related advice. Updated weekly."
        keywords="retirement planning, tax strategy, personal finance, health tips, financial planning, investment advice"
        url="https://pomodoro-app-eight-rouge.vercel.app/finance"
      />

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

      </div>
    </>
  );
}


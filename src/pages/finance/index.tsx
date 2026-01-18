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
        <p className="text-gray-600 mb-6">
          {isEnglish ? (
            <>
              If you are facing long-term financial pressure or debt difficulties, you can{" "}
              <Link to="/finance/debt-relief-guide-2026" className="text-blue-600 underline">
                start learning
              </Link>
              {" "}about available institutional assistance and thinking directions from the articles below.
            </>
          ) : (
            <>
              若你正面臨長期經濟壓力或債務困擾，可從下方文章{" "}
              <Link to="/finance/debt-relief-guide-2026" className="text-blue-600 underline">
                開始了解
              </Link>
              {" "}可行的制度性協助與思考方向。
            </>
          )}
        </p>
        <p className="text-gray-600 mb-6">
          {isEnglish ? (
            <>
              Not sure where to start?{" "}
              <Link to="/finance/guide-2026" className="text-blue-600 underline">
                View the column guide first
              </Link>.
            </>
          ) : (
            <>
              不知道從哪開始？{" "}
              <Link to="/finance/guide-2026" className="text-blue-600 underline">
                先看專欄導覽
              </Link>。
            </>
          )}
        </p>

        {/* 文章列表 */}
        <section className="grid md:grid-cols-2 gap-6">
          <article className="p-5 rounded-xl border bg-white shadow-sm">
            <h2 className="text-xl font-bold mb-2">
              {isEnglish
                ? "🧠 What Assistance Can I Apply For When Financial Pressure Becomes Unbearable?"
                : "🧠 經濟壓力撐不住時，可以申請哪些協助？"}
            </h2>
            <p className="text-gray-600 mb-3 text-sm">
              {isEnglish
                ? "When debt pressure affects life and health, this guide organizes common institutional assistance directions to help understand the basic differences between debt rehabilitation, liquidation, and debt relief."
                : "當債務壓力影響生活與健康時，整理常見制度性協助方向，協助理解更生、清算與消債的基本差異。"}
            </p>
            <p className="text-gray-500 text-xs mb-3">2026-01-15</p>
            <Link 
              to="/finance/debt-relief-guide-2026" 
              className="inline-block bg-blue-500 !text-white font-bold px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors duration-200"
              style={{ color: '#ffffff', fontWeight: '700' }}
            >
              {isEnglish ? "Read More →" : "閱讀詳情 →"}
            </Link>
          </article>

          <article className="p-5 rounded-xl border bg-white shadow-sm">
            <h2 className="text-xl font-bold mb-2">
              {isEnglish
                ? "🧭 Do I Need to Consider Debt Rehabilitation / Debt Relief?"
                : "🧭 我是否需要考慮更生／消債？"}
            </h2>
            <p className="text-gray-600 mb-3 text-sm">
              {isEnglish
                ? "Through a self-assessment checklist, help determine whether it is necessary to further understand debt rehabilitation or debt relief systems."
                : "透過自我檢視清單，協助判斷是否有必要進一步了解更生或消債制度。"}
            </p>
            <p className="text-gray-500 text-xs mb-3">2026-01-15</p>
            <Link 
              to="/finance/debt-self-assessment-2026" 
              className="inline-block bg-blue-500 !text-white font-bold px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors duration-200"
              style={{ color: '#ffffff', fontWeight: '700' }}
            >
              {isEnglish ? "Read More →" : "閱讀詳情 →"}
            </Link>
          </article>

          <article className="p-5 rounded-xl border bg-white shadow-sm">
            <h2 className="text-xl font-bold mb-2">
              {isEnglish
                ? "📘 What's the Difference Between Debt Rehabilitation, Liquidation, and Debt Relief?"
                : "📘 更生、清算、消債差在哪？"}
            </h2>
            <p className="text-gray-600 mb-3 text-sm">
              {isEnglish
                ? "Organizes the basic differences and common misconceptions between debt rehabilitation, liquidation, and debt relief to help understand system concepts."
                : "整理更生、清算與消債的基本差異與常見誤解，協助理解制度概念。"}
            </p>
            <p className="text-gray-500 text-xs mb-3">2026-01-15</p>
            <Link 
              to="/finance/debt-systems-comparison-2026" 
              className="inline-block bg-blue-500 !text-white font-bold px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors duration-200"
              style={{ color: '#ffffff', fontWeight: '700' }}
            >
              {isEnglish ? "Read More →" : "閱讀詳情 →"}
            </Link>
          </article>

          <article className="p-5 rounded-xl border bg-white shadow-sm">
            <h2 className="text-xl font-bold mb-2">
              {isEnglish
                ? "🌱 How to Restore Rhythm After Debt Difficulties?"
                : "🌱 走過債務低潮後，如何恢復節奏？"}
            </h2>
            <p className="text-gray-600 mb-3 text-sm">
              {isEnglish
                ? "Organizes common directions and reminders for gradually restoring life and financial rhythm after experiencing economic difficulties."
                : "整理走過經濟低潮後，逐步恢復生活與理財節奏的常見方向與提醒。"}
            </p>
            <p className="text-gray-500 text-xs mb-3">2026-01-15</p>
            <Link 
              to="/finance/debt-recovery-guide-2026" 
              className="inline-block bg-blue-500 !text-white font-bold px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors duration-200"
              style={{ color: '#ffffff', fontWeight: '700' }}
            >
              {isEnglish ? "Read More →" : "閱讀詳情 →"}
            </Link>
          </article>

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


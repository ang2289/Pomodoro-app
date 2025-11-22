import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SEO from "../../components/SEO";

export default function HealthPage() {
  const { t, i18n } = useTranslation();
  const isEnglish = !i18n.language.startsWith("zh");

  const healthArticles = [
    {
      title: isEnglish
        ? "😴 Power of Sleep｜One More Hour for Health & Wealth"
        : "😴 睡眠力回春｜每天多睡一小時，健康財富都變好",
      date: "2025-11-04",
      desc: isEnglish
        ? "Sleeping an extra hour daily allows physical and mental recovery, boosts immunity, and improves decision-making and quality of life."
        : "每天多睡一小時，讓身心修復、提升免疫力，改善決策力與生活品質。",
      link: "/health/sleep-balance-2025",
    },
    {
      title: isEnglish
        ? "🍎 Mindful Eating｜Build Mental Wellness from Every Meal"
        : "🍎 飲食覺察｜從三餐開始打造心理健康",
      date: "2025-11-04",
      desc: isEnglish
        ? "Starting from dietary habits, rebuild psychological balance and energy, making physical and mental states more stable."
        : "從飲食習慣出發，重建心理平衡與能量，讓身心狀態更穩定。",
      link: "/health/diet-mind-2025",
    },
  ];

  return (
    <>
      <SEO
        title="Health & Financial Tips 2025 — Retirement, Tax, Insurance"
        description="Practical guides for personal finance, retirement planning, tax optimization, and health-related advice. Updated weekly."
        keywords="retirement planning, tax strategy, personal finance, health tips, financial planning, investment advice"
        url="https://pomodoro-app-eight-rouge.vercel.app/health"
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
          {isEnglish ? "💚 Health Living Column" : "💚 健康生活專欄"}
        </h1>
        <p className="text-gray-600 mb-6">
          {isEnglish
            ? "Includes articles on sleep, diet, and mental health, helping you establish healthy habits in a fast-paced life. From sleep quality, mindful eating to psychological balance, comprehensively improve quality of life."
            : "收錄睡眠、飲食與心理健康文章，幫助你在快節奏生活中建立健康習慣。從睡眠品質、飲食覺察到心理平衡，全面提升生活品質。"}
        </p>

        {/* 文章列表 */}
        <section className="grid md:grid-cols-2 gap-6">
          {healthArticles.map((article) => (
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


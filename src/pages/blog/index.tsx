import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SEO from '../../components/SEO'

interface Article {
  path: string
  title: string
  titleEn?: string
  description: string
  descriptionEn?: string
  category: string
  categoryEn?: string
  date: string
  image: string
}

export default function BlogPage() {
  const { i18n } = useTranslation()
  const [currentLang, setCurrentLang] = useState<'zh-TW' | 'en'>(i18n.language as 'zh-TW' | 'en')

  const changeLanguage = (lang: 'zh-TW' | 'en') => {
    i18n.changeLanguage(lang)
    setCurrentLang(lang)
  }

  // 整合所有文章（最新 → 最舊）
  const allArticles: Article[] = [
    // 專注力文章
    {
      path: '/blog/pomodoro-focus',
      title: '如何用番茄鐘提升專注與靜心力',
      titleEn: 'How to Use the Pomodoro Method to Enhance Focus and Mindfulness',
      description: '學習如何運用番茄鐘專注法來提升工作效能，並培養內心的平靜與覺察力。',
      descriptionEn: 'Learn how to use the Pomodoro technique to improve work efficiency and cultivate inner peace and awareness.',
      category: '專注力',
      categoryEn: 'Focus',
      date: '2025-01-15',
      image: '🕒',
    },
    {
      path: '/blog/chant-focus',
      title: '唸經與專注力訓練｜讓心更靜、念更定',
      titleEn: 'Chanting and Focus Training – A Practice to Calm the Mind and Strengthen Concentration',
      description: '將專注力訓練法與唸經修行結合，幫助你在誦經時維持內心穩定。',
      descriptionEn: 'Combine focus training with chanting practice to help maintain inner stability during recitation.',
      category: '專注力',
      categoryEn: 'Focus',
      date: '2025-01-14',
      image: '🪷',
    },
    {
      path: '/blog/morning-meditation',
      title: '清晨靜坐法｜如何開啟充滿能量的一天',
      titleEn: 'Morning Meditation: The Art of Starting a Mindful and Energized Day',
      description: '學習如何在早晨醒來後運用 10-15 分鐘靜坐，讓身心重啟並充滿能量。',
      descriptionEn: 'Learn how to use 10-15 minutes of meditation after waking up to restart your body and mind with energy.',
      category: '專注力',
      categoryEn: 'Focus',
      date: '2025-01-13',
      image: '🌞',
    },
    {
      path: '/blog/focus-reset',
      title: '專注力重啟術｜5 分鐘讓大腦回到最佳狀態',
      titleEn: 'Focus Reset Technique: Recharge Your Brain in 5 Minutes',
      description: '學會五分鐘專注力重啟術，結合番茄鐘節奏，讓大腦重新充電、找回效率與平靜。',
      descriptionEn: 'Learn a 5-minute focus reset technique that combines with Pomodoro rhythm to recharge your brain and restore efficiency and calm.',
      category: '專注力',
      categoryEn: 'Focus',
      date: '2025-01-12',
      image: '🔥',
    },
    // 健康文章
    {
      path: '/health/sleep-balance-2025',
      title: '睡眠力回春｜每天多睡一小時，健康財富都變好',
      titleEn: 'Sleep Power Rejuvenation: One Extra Hour Daily Improves Health and Wealth',
      description: '每天多睡一小時，讓身心修復、提升免疫力，同時改善決策力與生活品質。',
      descriptionEn: 'One extra hour of sleep daily helps body and mind recover, boosts immunity, and improves decision-making and quality of life.',
      category: '健康',
      categoryEn: 'Health',
      date: '2025-01-11',
      image: '😴',
    },
    {
      path: '/health/diet-mind-2025',
      title: '飲食覺察｜從三餐開始打造心理健康',
      titleEn: 'Dietary Awareness: Building Mental Health Through Three Meals',
      description: '從飲食習慣出發，重建心理平衡與能量。地中海飲食有助穩定情緒、減少焦慮。',
      descriptionEn: 'Start from dietary habits to rebuild psychological balance and energy. Mediterranean diet helps stabilize emotions and reduce anxiety.',
      category: '健康',
      categoryEn: 'Health',
      date: '2025-01-10',
      image: '🍎',
    },
    // 理財文章
    {
      path: '/finance/health-balance-2025',
      title: '身心平衡理財術｜讓健康與財務穩定同行',
      titleEn: 'Mind-Body Balance Financial Strategy: Health and Financial Stability Together',
      description: '健康與理財並非衝突，而是相互支撐的關係。從飲食、運動到預算規劃，打造穩定的人生結構。',
      descriptionEn: 'Health and finance are not conflicting but mutually supportive. From diet and exercise to budget planning, build a stable life structure.',
      category: '理財',
      categoryEn: 'Finance',
      date: '2025-01-09',
      image: '💖',
    },
    {
      path: '/finance/retire-plan-2025',
      title: '退休健康金三角｜醫療、儲蓄與生活品質兼顧',
      titleEn: 'Retirement Health Triangle: Medical, Savings and Quality of Life',
      description: '從醫療保險到生活品質，建立退休後的健康金三角，讓身心與財務皆能長期穩定。',
      descriptionEn: 'From health insurance to quality of life, build a retirement health triangle for long-term stability of body, mind and finances.',
      category: '理財',
      categoryEn: 'Finance',
      date: '2025-01-08',
      image: '🧘‍♀️',
    },
    {
      path: '/finance/anti-fraud-2025',
      title: '反詐騙指南｜保護你的財務安全',
      titleEn: 'Anti-Fraud Guide: Protect Your Financial Security',
      description: '認識常見詐騙手法，學習如何保護個人財務安全，避免成為詐騙受害者。',
      descriptionEn: 'Learn about common fraud tactics and how to protect your personal financial security to avoid becoming a fraud victim.',
      category: '理財',
      categoryEn: 'Finance',
      date: '2025-01-07',
      image: '🛡️',
    },
  ]

  // 依日期排序（最新 → 最舊）
  const sortedArticles = [...allArticles].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const content = {
    'zh-TW': {
      title: '文章專區（Blog）',
      subtitle: '每週更新 AI 工具、健康、補助與生活文章。提升 SEO，自然流量成長。',
      readMore: '閱讀更多',
      category: '分類',
      date: '日期',
      backToHome: '返回首頁',
    },
    en: {
      title: 'Blog Articles',
      subtitle: 'Weekly updates on AI tools, health, subsidies and lifestyle articles. Boost SEO and grow organic traffic.',
      readMore: 'Read More',
      category: 'Category',
      date: 'Date',
      backToHome: 'Back to Home',
    },
  }

  const currentContent = content[currentLang]

  return (
    <>
      <SEO
        title={`${currentContent.title} — Weekly Articles on AI Tools, Health & Finance`}
        description={currentContent.subtitle}
        keywords="blog, articles, AI tools, health, finance, lifestyle, SEO"
        url="https://pomodoro-app-eight-rouge.vercel.app/blog"
      />

      <main className="mx-auto max-w-4xl px-4 py-8 pb-24">
        {/* 語系切換按鈕 */}
        <div className="flex justify-end mb-6 gap-2">
          <button
            onClick={() => changeLanguage('zh-TW')}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              currentLang === 'zh-TW'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            繁體中文
          </button>
          <button
            onClick={() => changeLanguage('en')}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              currentLang === 'en'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            English
          </button>
        </div>

        {/* 標題 */}
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-4">
          {currentContent.title}
        </h1>
        <p className="text-center text-gray-600 mb-8">
          {currentContent.subtitle}
        </p>

        {/* 文章列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedArticles.map((article) => (
            <Link
              key={article.path}
              to={article.path}
              className="group bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="text-4xl mb-4 text-center">{article.image}</div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-semibold">
                  {currentLang === 'zh-TW' ? article.category : (article.categoryEn || article.category)}
                </span>
                <span className="text-xs text-gray-500">
                  {article.date}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">
                {currentLang === 'zh-TW' ? article.title : (article.titleEn || article.title)}
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm mb-4">
                {currentLang === 'zh-TW' ? article.description : (article.descriptionEn || article.description)}
              </p>
              <div className="text-blue-600 font-semibold text-sm text-center group-hover:text-blue-700 transition-colors">
                {currentContent.readMore} →
              </div>
            </Link>
          ))}
        </div>

        {/* 🛍 文章首頁中的「好物推薦專區」 */}
        <section className="mt-12 border-t pt-10">
          <h2 className="text-2xl font-bold mb-4">🛒 好物推薦專區</h2>
          <p className="text-gray-600 mb-6">每篇都有導購影片＋懶人介紹文＋Shopee 分潤連結</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link 
              to="/goods/airfryer-keshaui" 
              className="block border rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              <img 
                src="/assets/airfryer-keshaui-cover.png" 
                alt="氣炸鍋封面" 
                className="w-full rounded mb-2 object-cover"
              />
              <h3 className="font-semibold text-lg">科帥氣炸鍋推薦</h3>
              <p className="text-sm text-gray-500">附影片｜限時送清潔泡泡＋12 件烘焙組</p>
            </Link>
          </div>

          <div className="mt-4 text-right">
            <Link to="/goods" className="text-blue-600 hover:underline">
              👉 看更多好物推薦文章
            </Link>
          </div>
        </section>

        {/* 返回首頁 */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {currentContent.backToHome}
          </Link>
        </div>
      </main>
    </>
  )
}





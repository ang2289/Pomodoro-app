import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import SEO from "../components/SEO";
import { RelatedTools } from "@/components/seo/RelatedTools";
import { RelatedGuides } from "@/components/seo/RelatedGuides";
import { getRelatedGuideItems, getRelatedToolsItems } from "@/data/internalLinks";

export default function PolicyExplainedPage() {
  const { t } = useTranslation();
  // 獲取今天的日期（格式：YYYY-MM-DD）
  const today = new Date().toISOString().split('T')[0];

  const articles = [
    { path: "/blog/income-tax-exemption-explained", titleKey: "policy_article_income_tax_exemption_title", descriptionKey: "policy_article_income_tax_exemption_desc", date: today, image: "💰" },
    { path: "/blog/subsidy-visibility-explained", titleKey: "policy_article_subsidy_visibility_title", descriptionKey: "policy_article_subsidy_visibility_desc", date: today, image: "💰" },
    { path: "/blog/overtime-pay-explained", titleKey: "policy_article_overtime_pay_title", descriptionKey: "policy_article_overtime_pay_desc", date: today, image: "⏰" },
    { path: "/blog/dependent-deduction-explained", titleKey: "policy_article_dependent_deduction_title", descriptionKey: "policy_article_dependent_deduction_desc", date: today, image: "👨‍👩‍👧" },
    { path: "/blog/policy-design-reality-explained", titleKey: "policy_article_policy_design_reality_title", descriptionKey: "policy_article_policy_design_reality_desc", date: today, image: "🤔" },
    { path: "/blog/nhi-premium-explained", titleKey: "policy_article_nhi_premium_title", descriptionKey: "policy_article_nhi_premium_desc", date: today, image: "🏥" },
    { path: "/blog/unemployment-benefit-explained", titleKey: "policy_article_unemployment_benefit_title", descriptionKey: "policy_article_unemployment_benefit_desc", date: today, image: "💼" },
    { path: "/blog/labor-pension-new-system-explained", titleKey: "policy_article_labor_pension_new_system_title", descriptionKey: "policy_article_labor_pension_new_system_desc", date: today, image: "💰" },
    { path: "/blog/household-registration-explained", titleKey: "policy_article_household_registration_title", descriptionKey: "policy_article_household_registration_desc", date: today, image: "📋" },
    { path: "/blog/government-announcement-impact-explained", titleKey: "policy_article_government_announcement_impact_title", descriptionKey: "policy_article_government_announcement_impact_desc", date: today, image: "📢" },
    { path: "/blog/labor-insurance-pension-explained", titleKey: "policy_article_labor_insurance_pension_title", descriptionKey: "policy_article_labor_insurance_pension_desc", date: today, image: "💼" },
    { path: "/blog/long-term-care-subsidy-explained", titleKey: "policy_article_long_term_care_subsidy_title", descriptionKey: "policy_article_long_term_care_subsidy_desc", date: today, image: "👵" },
    { path: "/blog/college-entrance-exam-explained", titleKey: "policy_article_college_entrance_exam_title", descriptionKey: "policy_article_college_entrance_exam_desc", date: today, image: "📚" },
    { path: "/blog/hsr-booking-system-explained", titleKey: "policy_article_hsr_booking_system_title", descriptionKey: "policy_article_hsr_booking_system_desc", date: today, image: "🚄" },
    { path: "/blog/minimum-wage-impact-explained", titleKey: "policy_article_minimum_wage_impact_title", descriptionKey: "policy_article_minimum_wage_impact_desc", date: today, image: "💰" },
    { path: "/blog/income-tax-brackets-explained", titleKey: "policy_article_income_tax_brackets_title", descriptionKey: "policy_article_income_tax_brackets_desc", date: today, image: "💰" },
    { path: "/blog/minimum-wage-explained", titleKey: "policy_article_minimum_wage_title", descriptionKey: "policy_article_minimum_wage_desc", date: today, image: "💼" },
    { path: "/blog/labor-insurance-explained", titleKey: "policy_article_labor_insurance_title", descriptionKey: "policy_article_labor_insurance_desc", date: today, image: "🛡️" },
    { path: "/blog/cheng-li-chun-policy-role-explained", titleKey: "policy_article_cheng_li_chun_policy_role_title", descriptionKey: "policy_article_cheng_li_chun_policy_role_desc", date: today, image: "👤" },
    { path: "/blog/taiwan-us-tariff-explained", titleKey: "policy_article_taiwan_us_tariff_title", descriptionKey: "policy_article_taiwan_us_tariff_desc", date: "2026-01-20", image: "🇺🇸" },
    { path: "/blog/tariff-adjustment-impact", titleKey: "policy_article_tariff_adjustment_impact_title", descriptionKey: "policy_article_tariff_adjustment_impact_desc", date: "2026-01-19", image: "💼" },
    { path: "/blog/232-clause-explained", titleKey: "policy_article_232_clause_title", descriptionKey: "policy_article_232_clause_desc", date: "2026-01-18", image: "📜" },
    { path: "/blog/subsidy-eligibility-explained", titleKey: "policy_article_subsidy_eligibility_title", descriptionKey: "policy_article_subsidy_eligibility_desc", date: "2026-01-17", image: "💰" },
    { path: "/blog/house-tax-explained", titleKey: "policy_article_house_tax_title", descriptionKey: "policy_article_house_tax_desc", date: "2026-01-16", image: "🏠" },
    { path: "/blog/car-import-tariff-explained", titleKey: "policy_article_car_import_tariff_title", descriptionKey: "policy_article_car_import_tariff_desc", date: "2026-01-15", image: "🚗" },
  ];

  return (
    <>
      <SEO
        title={t('policy_seo_title')}
        description={t('policy_seo_description')}
        keywords={t('policy_seo_keywords')}
        url="https://pomodoro-app-eight-rouge.vercel.app/policy-explained"
      />

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-6">
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            {t('policy_back_home')}
          </Link>
        </div>

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            📋 {t('policy_page_title')}
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            {t('policy_subtitle')}
          </p>
          
          {/* 頁面頂部說明區塊 */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-8">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {t('policy_intro')}
            </p>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.path}
              to={article.path}
              className="group bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="text-4xl mb-4 text-center">{article.image}</div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-semibold">
                  {t('policy_tag')}
                </span>
                <span className="text-xs text-gray-500">{article.date}</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">
                {t(article.titleKey)}
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm mb-4">
                {t(article.descriptionKey)}
              </p>
              <div className="text-blue-600 font-semibold text-sm text-center group-hover:text-blue-700 transition-colors">
                {t('policy_read_more')}
              </div>
            </Link>
          ))}
        </div>

        {articles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">{t('policy_no_articles')}</p>
          </div>
        )}

        {/* FAQ 區塊 */}
        <section className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('policy_faq_title')}
          </h2>
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {t('policy_faq_q1')}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {t('policy_faq_a1')}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {t('policy_faq_q2')}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {t('policy_faq_a2')}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {t('policy_faq_q3')}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {t('policy_faq_a3')}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {t('policy_faq_q4')}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {t('policy_faq_a4')}
              </p>
            </div>
          </div>
        </section>

        <RelatedTools items={getRelatedToolsItems('policy-explain')} title="相關工具" />
        <RelatedGuides items={getRelatedGuideItems('policy-explain')} />
      </div>

      {/* FAQPage JSON-LD 結構化資料 */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              { "@type": "Question", "name": t('policy_faq_q1'), "acceptedAnswer": { "@type": "Answer", "text": t('policy_faq_a1') } },
              { "@type": "Question", "name": t('policy_faq_q2'), "acceptedAnswer": { "@type": "Answer", "text": t('policy_faq_a2') } },
              { "@type": "Question", "name": t('policy_faq_q3'), "acceptedAnswer": { "@type": "Answer", "text": t('policy_faq_a3') } },
              { "@type": "Question", "name": t('policy_faq_q4'), "acceptedAnswer": { "@type": "Answer", "text": t('policy_faq_a4') } }
            ]
          })}
        </script>
      </Helmet>
    </>
  );
}

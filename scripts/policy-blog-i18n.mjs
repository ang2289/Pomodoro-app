/**
 * One-time script: add i18n to policy blog article pages.
 * Run from repo root: node scripts/policy-blog-i18n.mjs
 */
import fs from 'fs';
import path from 'path';

const BLOG_DIR = path.join(process.cwd(), 'src', 'pages', 'blog');

const KEY_MAP = {
  'overtime-pay-explained': ['policy_article_overtime_pay_title', 'policy_article_overtime_pay_desc'],
  'dependent-deduction-explained': ['policy_article_dependent_deduction_title', 'policy_article_dependent_deduction_desc'],
  'policy-design-reality-explained': ['policy_article_policy_design_reality_title', 'policy_article_policy_design_reality_desc'],
  'nhi-premium-explained': ['policy_article_nhi_premium_title', 'policy_article_nhi_premium_desc'],
  'unemployment-benefit-explained': ['policy_article_unemployment_benefit_title', 'policy_article_unemployment_benefit_desc'],
  'labor-pension-new-system-explained': ['policy_article_labor_pension_new_system_title', 'policy_article_labor_pension_new_system_desc'],
  'household-registration-explained': ['policy_article_household_registration_title', 'policy_article_household_registration_desc'],
  'government-announcement-impact-explained': ['policy_article_government_announcement_impact_title', 'policy_article_government_announcement_impact_desc'],
  'labor-insurance-pension-explained': ['policy_article_labor_insurance_pension_title', 'policy_article_labor_insurance_pension_desc'],
  'long-term-care-subsidy-explained': ['policy_article_long_term_care_subsidy_title', 'policy_article_long_term_care_subsidy_desc'],
  'college-entrance-exam-explained': ['policy_article_college_entrance_exam_title', 'policy_article_college_entrance_exam_desc'],
  'hsr-booking-system-explained': ['policy_article_hsr_booking_system_title', 'policy_article_hsr_booking_system_desc'],
  'minimum-wage-impact-explained': ['policy_article_minimum_wage_impact_title', 'policy_article_minimum_wage_impact_desc'],
  'income-tax-brackets-explained': ['policy_article_income_tax_brackets_title', 'policy_article_income_tax_brackets_desc'],
  'minimum-wage-explained': ['policy_article_minimum_wage_title', 'policy_article_minimum_wage_desc'],
  'labor-insurance-explained': ['policy_article_labor_insurance_title', 'policy_article_labor_insurance_desc'],
  'cheng-li-chun-policy-role-explained': ['policy_article_cheng_li_chun_policy_role_title', 'policy_article_cheng_li_chun_policy_role_desc'],
  'taiwan-us-tariff-explained': ['policy_article_taiwan_us_tariff_title', 'policy_article_taiwan_us_tariff_desc'],
  'tariff-adjustment-impact': ['policy_article_tariff_adjustment_impact_title', 'policy_article_tariff_adjustment_impact_desc'],
  '232-clause-explained': ['policy_article_232_clause_title', 'policy_article_232_clause_desc'],
  'subsidy-eligibility-explained': ['policy_article_subsidy_eligibility_title', 'policy_article_subsidy_eligibility_desc'],
  'house-tax-explained': ['policy_article_house_tax_title', 'policy_article_house_tax_desc'],
  'car-import-tariff-explained': ['policy_article_car_import_tariff_title', 'policy_article_car_import_tariff_desc'],
};

const SKIP = new Set(['income-tax-exemption-explained', 'subsidy-visibility-explained']);

const CTA_TITLE_VARIANTS = [
  '看不懂勞動政策公告或新聞？',
  '看不懂政策公告或新聞？',
  '看不懂補助公告或新聞？',
  '看不懂戶籍或補助公告？',
  '看不懂升學制度公告或新聞？',
  '看不懂稅務公告或政策說明？',
  '看不懂政府公告或新聞？',
  '看不懂房屋稅或政策公告？',
  '看不懂勞工政策公告或新聞？',
  '看不懂勞保或社會保險公告？',
  '看不懂長照或補助公告？',
  '看不懂交通或制度公告？',
  '看不懂退休金或勞動政策公告？',
  '看不懂健保或保險公告？',
  '看不懂勞保或退休金公告？',
];

function transformFile(filename) {
  const base = filename.replace(/\.tsx$/, '');
  if (SKIP.has(base)) return;
  const keys = KEY_MAP[base];
  if (!keys) return;
  const [titleKey, descKey] = keys;
  const filePath = path.join(BLOG_DIR, filename);
  let content = fs.readFileSync(filePath, 'utf8');

  if (content.includes('useTranslation')) return;

  content = content.replace(
    /import SEO from "\.\.\/\.\.\/components\/SEO";/,
    'import { useTranslation } from "react-i18next";\nimport SEO from "../../components/SEO";'
  );

  content = content.replace(
    /(export default function \w+Page\(\) \{\s*)\n(\s*\/\/ 獲取今天的日期)/,
    `$1\n  const TITLE_KEY = "${titleKey}";\n  const DESC_KEY = "${descKey}";\n  const { t } = useTranslation();\n$2`
  );

  content = content.replace(
    /<SEO\s+title="[^"]*"\s+description="[^"]*"/,
    `<SEO\n        title={t(TITLE_KEY)}\n        description={t(DESC_KEY)}`
  );

  content = content.replace(
    /← 返回政策白話解釋/g,
    "{t('policy_back_to_list')}"
  );

  content = content.replace(
    /<span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">\s*政策白話解釋\s*<\/span>/,
    '<span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">{t(\'policy_tag\')}</span>'
  );

  const h1Re = /<h1 className="text-3xl font-bold text-gray-900 mb-4">\s*\n\s*([^\n]+)\n\s*<\/h1>/;
  const h1M = content.match(h1Re);
  if (h1M) {
    const inner = h1M[1].trim();
    const emojiPart = /^[\u{1F300}-\u{1F9FF}\u2600-\u26FF\u2700-\u27BF\s👨‍👩‍👧]+/u.exec(inner);
    const prefix = emojiPart ? emojiPart[0].trim() + ' ' : '';
    content = content.replace(
      h1Re,
      `<h1 className="text-3xl font-bold text-gray-900 mb-4">\n              ${prefix}{t(TITLE_KEY)}\n            </h1>`
    );
  }

  content = content.replace(/相關政策白話解釋文章/g, "{t('policy_related_articles')}");
  content = content.replace(/如果你正在了解政策或制度，以下文章也可能與你有關。/g, "{t('policy_related_intro')}");

  CTA_TITLE_VARIANTS.forEach(v => {
    content = content.replace(v, "{t('policy_cta_title')}");
  });
  content = content.replace(
    /把公告或新聞貼上來，幫你整理成「跟你有沒有關係」的重點/g,
    "{t('policy_cta_desc')}"
  );
  content = content.replace(/貼上文章，幫我整理/g, "{t('policy_cta_btn')}");

  content = content.replace(
    /(\s+)延伸閱讀(\s*<\/h3>)/,
    "$1{t('policy_extended_reading')}$2"
  );

  content = content.replace(/← 返回政策白話解釋列表/g, "{t('policy_back_to_list_bottom')}");

  content = content.replace(/"headline":\s*"[^"]*"/, '"headline": t(TITLE_KEY)');
  content = content.replace(/"description":\s*"[^"]*"/, '"description": t(DESC_KEY)');
  content = content.replace(/"name":\s*"AI 工具與生活服務中心"/g, '"name": t(\'policy_seo_site_name\')');

  fs.writeFileSync(filePath, content);
  console.log('Updated', filename);
}

const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.tsx') && (f.includes('-explained') || f === 'tariff-adjustment-impact.tsx'));
files.forEach(transformFile);

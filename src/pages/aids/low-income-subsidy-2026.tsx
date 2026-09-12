import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import ShareButtons from '@/components/ShareButtons';

export default function LowIncomeSubsidy2026() {
  const { t, i18n } = useTranslation();
  const isEnglish = !i18n.language.startsWith("zh");

  return (
    <>
      <Helmet>
        <title>
          {isEnglish
            ? "💰 2025–2026 Low-Income / Middle-Low-Income Household Subsidy Guide | Eligibility, Subsidy Items Explained | RxV"
            : "💰 2025–2026 低收入戶／中低收入戶補助懶人包｜資格、補助項目一次整理｜RxV"}
        </title>
      </Helmet>
      <main className="max-w-4xl mx-auto px-4 py-10 leading-relaxed text-lg">
        <section>
          <h1 className="text-3xl font-extrabold mb-4">
            {isEnglish
              ? "💰 2025–2026 Low-Income / Middle-Low-Income Household Subsidy Guide | Eligibility, Subsidy Items Explained"
              : "💰 2025–2026 低收入戶／中低收入戶補助懶人包｜資格、補助項目一次整理"}
          </h1>
          <p className="text-gray-600 mb-3">
            {isEnglish ? "Published: January 2026" : "發布日期：2026 年 1 月"}
          </p>

          <p className="text-gray-700 mb-6">
            {isEnglish ? (
              <>
                The government provides subsidies and assistance measures for low-income and middle-low-income households facing economic difficulties. Subsidy content includes living assistance, medical subsidies, education subsidies, and other social assistance programs. Actual eligibility and subsidy items are subject to review based on household size, income, and property status.
              </>
            ) : (
              <>
                政府針對經濟條件較為弱勢的家庭，提供低收入戶及中低收入戶相關補助與協助措施。補助內容涵蓋生活扶助、醫療補助、教育補助及其他社會救助項目，實際資格與補助項目，需依家庭人口、收入與財產狀況進行審核。
              </>
            )}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-3">
            {isEnglish ? "Applicants and Basic Requirements" : "申請對象與基本條件"}
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              {isEnglish
                ? "Legally registered and actually residing in Taiwan."
                : "依法設籍並實際居住於國內。"}
            </li>
            <li>
              {isEnglish
                ? "Household total income, movable and immovable property meet government-announced standards."
                : "家庭總收入、動產及不動產符合政府公告標準。"}
            </li>
            <li>
              {isEnglish
                ? "Household members must be legally declared and subject to local government review."
                : "家庭成員需依法申報，並接受地方政府審核。"}
            </li>
            <li>
              {isEnglish
                ? "No concealment or false reporting."
                : "未有隱匿或不實申報情形。"}
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-3">
            {isEnglish ? "Difference Between Low-Income and Middle-Low-Income Households" : "低收入戶與中低收入戶差異說明"}
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              {isEnglish
                ? "Low-Income Household: Household income and property conditions below the minimum living expense standard."
                : "低收入戶：家庭收入與財產條件低於最低生活費標準。"}
            </li>
            <li>
              {isEnglish
                ? "Middle-Low-Income Household: Income slightly higher than low-income households, but still below a certain percentage threshold."
                : "中低收入戶：收入略高於低收入戶，但仍低於一定比例門檻。"}
            </li>
            <li>
              {isEnglish
                ? "Actual qualification standards vary slightly by county/city announcements."
                : "實際認定標準依各縣市公告略有不同。"}
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-3">
            {isEnglish ? "Common Subsidy Items Available for Application" : "常見可申請補助項目"}
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              {isEnglish
                ? "Living Assistance Allowance."
                : "生活扶助費。"}
            </li>
            <li>
              {isEnglish
                ? "Medical Expense Subsidies."
                : "醫療費用補助。"}
            </li>
            <li>
              {isEnglish
                ? "Education and Schooling-Related Subsidies."
                : "教育與就學相關補助。"}
            </li>
            <li>
              {isEnglish
                ? "Rent or Housing-Related Subsidies."
                : "房租或居住相關補助。"}
            </li>
            <li>
              {isEnglish
                ? "Other Social Assistance Measures (subject to local government announcements)."
                : "其他社會救助措施（依地方政府公告）。"}
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-3">
            {isEnglish ? "🔗 Official Application and Inquiry Portal" : "🔗 官方申請與查詢入口"}
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              {isEnglish
                ? "Ministry of Health and Welfare (Social Assistance Policy Portal):"
                : "衛生福利部（社會救助政策總入口）："}
              <a
                href="https://www.mohw.gov.tw"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline ml-1"
              >
                www.mohw.gov.tw
              </a>
            </li>
            <li>
              {isEnglish
                ? "Social and Family Affairs Administration (Agency Responsible for Low-Income / Middle-Low-Income Household Affairs):"
                : "社會及家庭署（低收／中低收入戶業務主管機關）："}
              <a
                href="https://www.sfaa.gov.tw"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline ml-1"
              >
                www.sfaa.gov.tw
              </a>
            </li>
            <li>
              {isEnglish
                ? "County/City Government Social Affairs Bureaus:"
                : "各縣市政府社會局／社會處："}
              {isEnglish
                ? "Subject to announcements by the local government where household registration is located."
                : "依戶籍所在地政府公告為準。"}
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-3">
            {isEnglish ? "Application Methods and Process Example" : "申請方式與流程範例"}
          </h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              {isEnglish
                ? "Contact the township/city/district office or social affairs bureau where household registration is located."
                : "向戶籍所在地之鄉鎮市區公所或社會局洽詢。"}
            </li>
            <li>
              {isEnglish
                ? "Submit information on household members, income, and property."
                : "提交家庭成員、收入與財產相關資料。"}
            </li>
            <li>
              {isEnglish
                ? "Local government conducts home visits and eligibility review."
                : "由地方政府進行訪視與資格審核。"}
            </li>
            <li>
              {isEnglish
                ? "After approval, subsidies are provided according to approved items."
                : "通過認定後，依核定項目發給補助。"}
            </li>
          </ol>

          <h2 className="text-2xl font-bold mt-8 mb-3">
            {isEnglish ? "Common Notes" : "常見注意事項"}
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              {isEnglish
                ? "Qualification status requires periodic review."
                : "認定資格需定期複查。"}
            </li>
            <li>
              {isEnglish
                ? "Changes in household members or income must be reported proactively."
                : "家庭成員變動或收入改變需主動通報。"}
            </li>
            <li>
              {isEnglish
                ? "False reporting may affect eligibility and require repayment of subsidies."
                : "不實申報可能影響資格並須返還補助。"}
            </li>
          </ul>

          <div className="mt-10 p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-900">
            ⚠️{" "}
            {isEnglish
              ? "This article is for reference only. Actual subsidy eligibility, amounts, and application procedures are subject to the latest announcements from the Ministry of Health and Welfare and local governments."
              : "本文僅提供資訊整理與參考，實際補助資格、金額與申請流程，請以衛生福利部及各地方政府最新公告為準。"}
          </div>
        </section>

        <ShareButtons title={isEnglish ? "2025–2026 Low-Income / Middle-Low-Income Household Subsidy Guide | Eligibility, Subsidy Items Explained" : "2025–2026 低收入戶／中低收入戶補助懶人包｜資格、補助項目一次整理"} />

        <div className="text-center mt-8">
          <Link
            to="/aids"
            className="bg-blue-600 hover:bg-blue-700 !text-white font-semibold py-2 px-6 rounded-full inline-block transition"
          >
            {isEnglish ? "← Back to Subsidy Package" : "← 回到補助懶人包"}
          </Link>
        </div>
      </main>
    </>
  );
}

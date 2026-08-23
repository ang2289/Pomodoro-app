import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import ShareButtons from '@/components/ShareButtons';

export default function ChildcareSubsidy2026() {
  const { t, i18n } = useTranslation();
  const isEnglish = !i18n.language.startsWith("zh");

  return (
    <>
      <Helmet>
        <title>
          {isEnglish
            ? "👶 2025–2026 Childcare / Daycare Subsidy Guide | Application Eligibility, Subsidy Amount Explained | RxV"
            : "👶 2025–2026 育兒／托育補助懶人包｜申請資格、補助金額一次看懂｜RxV"}
        </title>
      </Helmet>
      <main className="max-w-4xl mx-auto px-4 py-10 leading-relaxed text-lg">
        <section>
          <h1 className="text-3xl font-extrabold mb-4">
            {isEnglish
              ? "👶 2025–2026 Childcare / Daycare Subsidy Guide | Application Eligibility, Subsidy Amount Explained"
              : "👶 2025–2026 育兒／托育補助懶人包｜申請資格、補助金額一次看懂"}
          </h1>
          <p className="text-gray-600 mb-3">
            {isEnglish ? "Published: January 2026" : "發布日期：2026 年 1 月"}
          </p>

          <p className="text-gray-700 mb-6">
            {isEnglish ? (
              <>
                To reduce the burden of childcare and caregiving on families, the government provides various childcare allowances and daycare subsidies for children of different ages and daycare arrangements. Subsidy amounts and eligibility conditions vary depending on the child's age, type of daycare, and family circumstances.
              </>
            ) : (
              <>
                政府為減輕家庭育兒與照顧負擔，針對不同年齡層幼兒與托育方式，提供多項育兒津貼與托育補助。補助金額與資格條件，會依幼兒年齡、托育形式及家庭狀況而有所不同。
              </>
            )}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-3">
            {isEnglish ? "Applicants and Basic Requirements" : "申請對象與基本條件"}
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              {isEnglish
                ? "Households with children aged 0–6 years."
                : "家中有 0～6 歲幼兒。"}
            </li>
            <li>
              {isEnglish
                ? "Child must have Republic of China nationality or meet residency requirements."
                : "幼兒具中華民國國籍或符合居留規定。"}
            </li>
            <li>
              {isEnglish
                ? "Parents or guardians must be legally registered."
                : "父母或監護人依法設籍。"}
            </li>
            <li>
              {isEnglish
                ? "Must not be receiving other subsidies of the same nature."
                : "未重複請領性質相同之補助。"}
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-3">
            {isEnglish ? "Common Types of Childcare / Daycare Subsidies" : "常見育兒／托育補助類型"}
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              {isEnglish
                ? "Childcare Allowance (for parents caring for children at home)."
                : "育兒津貼（自行照顧幼兒）。"}
            </li>
            <li>
              {isEnglish
                ? "Public Daycare Subsidy (public daycare centers, public kindergartens)."
                : "公共托育補助（公托、公幼）。"}
            </li>
            <li>
              {isEnglish
                ? "Quasi-Public Daycare Subsidy (private daycare centers, babysitters)."
                : "準公共化托育補助（私立托嬰中心、保母）。"}
            </li>
            <li>
              {isEnglish
                ? "Local Government Additional Subsidies (varies by county/city)."
                : "地方政府加碼補助（依縣市不同）。"}
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-3">
            {isEnglish ? "Subsidy Amount Explanation (Subject to Official Announcements)" : "補助金額說明（依實際公告為準）"}
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              {isEnglish
                ? "Childcare Allowance: Fixed monthly subsidy amount."
                : "育兒津貼：每月定額補助。"}
            </li>
            <li>
              {isEnglish
                ? "Public / Quasi-Public Daycare: Different subsidy amounts based on daycare arrangement."
                : "公托／準公共托育：依托育方式補助不同金額。"}
            </li>
            <li>
              {isEnglish
                ? "Some counties and cities provide additional subsidies."
                : "部分縣市提供額外加碼。"}
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-3">
            {isEnglish ? "🔗 Official Application and Inquiry Portal" : "🔗 官方申請與查詢入口"}
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              {isEnglish
                ? "Ministry of Health and Welfare (Childcare and Daycare Policy Portal):"
                : "衛生福利部（育兒與托育政策總入口）："}
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
                ? "Social and Family Affairs Administration (Agency Responsible for Childcare Allowance and Daycare Subsidies):"
                : "社會及家庭署（育兒津貼、托育補助主責機關）："}
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
                ? "County/City Government Social Affairs Bureaus (Local Additional Subsidies and Variations):"
                : "各縣市政府社會局／社會處（地方加碼與差異）："}
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
                ? "Confirm child's age and daycare arrangement."
                : "確認幼兒年齡與托育方式。"}
            </li>
            <li>
              {isEnglish
                ? "Prepare household registration and related supporting documents."
                : "備妥戶籍與相關證明文件。"}
            </li>
            <li>
              {isEnglish
                ? "Apply through government-designated platform or local government."
                : "透過政府指定平台或地方政府申請。"}
            </li>
            <li>
              {isEnglish
                ? "Wait for eligibility review."
                : "等待資格審核。"}
            </li>
            <li>
              {isEnglish
                ? "After approval, subsidies will be disbursed regularly."
                : "通過後定期撥付補助款。"}
            </li>
          </ol>

          <h2 className="text-2xl font-bold mt-8 mb-3">
            {isEnglish ? "Common Notes" : "常見注意事項"}
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              {isEnglish
                ? "Subsidy amounts and conditions may be adjusted annually."
                : "補助金額與條件可能依年度調整。"}
            </li>
            <li>
              {isEnglish
                ? "Different subsidies cannot be received simultaneously."
                : "不同補助不可重複請領。"}
            </li>
            <li>
              {isEnglish
                ? "Errors in information provided may affect disbursement timing."
                : "資料填寫錯誤可能影響撥款時程。"}
            </li>
          </ul>

          <div className="mt-10 p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-900">
            ⚠️{" "}
            {isEnglish
              ? "This article is for reference only. Actual subsidy eligibility, amounts, and application procedures are subject to the latest announcements from the Ministry of Health and Welfare and local governments."
              : "本文僅提供資訊整理與參考，實際補助資格、金額與申請流程，請以衛生福利部及各地方政府最新公告為準。"}
          </div>
        </section>

        <ShareButtons title={isEnglish ? "2025–2026 Childcare / Daycare Subsidy Guide | Application Eligibility, Subsidy Amount Explained" : "2025–2026 育兒／托育補助懶人包｜申請資格、補助金額一次看懂"} />

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

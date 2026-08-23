import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import ShareButtons from '@/components/ShareButtons';

export default function LTCMedicalSubsidy2026() {
  const { t, i18n } = useTranslation();
  const isEnglish = !i18n.language.startsWith("zh");

  return (
    <>
      <Helmet>
        <title>
          {isEnglish
            ? "🧓 2025–2026 Long-Term Care / Medical Subsidy Guide | Application Eligibility, Subsidy Items Explained | RxV"
            : "🧓 2025–2026 長照／醫療補助懶人包｜申請資格、補助項目一次整理｜RxV"}
        </title>
      </Helmet>
      <main className="max-w-4xl mx-auto px-4 py-10 leading-relaxed text-lg">
        <section>
          <h1 className="text-3xl font-extrabold mb-4">
            {isEnglish
              ? "🧓 2025–2026 Long-Term Care / Medical Subsidy Guide | Application Eligibility, Subsidy Items Explained"
              : "🧓 2025–2026 長照／醫療補助懶人包｜申請資格、補助項目一次整理"}
          </h1>
          <p className="text-gray-600 mb-3">
            {isEnglish ? "Published: January 2026" : "發布日期：2026 年 1 月"}
          </p>

          <p className="text-gray-700 mb-6">
            {isEnglish ? (
              <>
                The government provides long-term care and related medical subsidies to assist elderly individuals, persons with disabilities, and families with long-term care needs. Subsidy content includes home care, day care, assistive device subsidies, medical fee reductions, and other items. Actual types of subsidies available for application require assessment based on individual physical condition and family circumstances.
              </>
            ) : (
              <>
                政府為協助高齡者、失能者及有長期照護需求之家庭，提供長期照顧與相關醫療補助措施。補助內容涵蓋居家照顧、日間照顧、輔具補助、醫療費用減免等項目，實際可申請之補助類型，需依個人身體狀況與家庭情形進行評估。
              </>
            )}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-3">
            {isEnglish ? "Applicants and Basic Requirements" : "申請對象與基本條件"}
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              {isEnglish
                ? "Elderly aged 65 and above, or indigenous people aged 55 and above."
                : "65 歲以上長者，或 55 歲以上原住民。"}
            </li>
            <li>
              {isEnglish
                ? "Persons with diseases, disabilities, or physical/mental disabilities who have been assessed as having long-term care needs."
                : "因疾病、失能或身心障礙，經評估有長期照顧需求者。"}
            </li>
            <li>
              {isEnglish
                ? "Must have Republic of China nationality or meet relevant residency requirements."
                : "具中華民國國籍或符合相關居留規定。"}
            </li>
            <li>
              {isEnglish
                ? "Actual eligibility requires professional assessment and determination."
                : "實際資格須經專業評估認定。"}
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-3">
            {isEnglish ? "Common Long-Term Care and Medical Subsidy Items" : "常見長照與醫療補助項目"}
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              {isEnglish
                ? "Long-Term Care 2.0 Services (home care services, day care centers, respite services)."
                : "長照 2.0 服務（居家服務、日照中心、喘息服務）。"}
            </li>
            <li>
              {isEnglish
                ? "Assistive Device and Home Accessibility Improvement Subsidies."
                : "輔具與居家無障礙改善補助。"}
            </li>
            <li>
              {isEnglish
                ? "Transportation Service Subsidies."
                : "交通接送服務補助。"}
            </li>
            <li>
              {isEnglish
                ? "Medical Fee Reductions or Subsidies."
                : "醫療費用減免或補助。"}
            </li>
            <li>
              {isEnglish
                ? "Local Government Additional Care Subsidies (varies by county/city)."
                : "地方政府加碼照護補助（依縣市不同）。"}
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-3">
            {isEnglish ? "Subsidy Amount and Service Method Explanation" : "補助金額與服務方式說明"}
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              {isEnglish
                ? "Long-term care services are provided on a 'quota system' basis, determined according to disability level."
                : "長照服務以「額度制」提供，依失能等級核定。"}
            </li>
            <li>
              {isEnglish
                ? "Assistive device and home improvement subsidies have maximum limits determined by item."
                : "輔具及居家改善補助依項目核定上限。"}
            </li>
            <li>
              {isEnglish
                ? "Some medical subsidies use partial cost-sharing reduction methods."
                : "部分醫療補助採部分負擔減免方式。"}
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-3">
            {isEnglish ? "🔗 Official Application and Inquiry Portal" : "🔗 官方申請與查詢入口"}
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              {isEnglish
                ? "Ministry of Health and Welfare (Long-Term Care and Medical Policy Portal):"
                : "衛生福利部（長期照顧與醫療政策總入口）："}
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
                ? "Long-Term Care Zone (1966 Long-Term Care Service Hotline):"
                : "長照專區（1966 長照服務專線）："}
              <a
                href="https://1966.gov.tw"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline ml-1"
              >
                1966.gov.tw
              </a>
            </li>
            <li>
              {isEnglish
                ? "Social and Family Affairs Administration (Related Subsidies and Resource Integration):"
                : "社會及家庭署（相關補助與資源整合）："}
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
                ? "County/City Government Social Affairs Bureaus / Health Bureaus:"
                : "各縣市政府社會局／衛生局："}
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
                ? "Call the 1966 Long-Term Care Service Hotline or apply through local government."
                : "撥打 1966 長照服務專線或向地方政府申請。"}
            </li>
            <li>
              {isEnglish
                ? "Arrange for professional personnel to conduct needs assessment."
                : "安排專業人員進行需求評估。"}
            </li>
            <li>
              {isEnglish
                ? "Service items and quotas are determined based on assessment results."
                : "依評估結果核定服務項目與額度。"}
            </li>
            <li>
              {isEnglish
                ? "Use services or apply for subsidies according to approved content."
                : "依核定內容使用服務或申請補助。"}
            </li>
          </ol>

          <h2 className="text-2xl font-bold mt-8 mb-3">
            {isEnglish ? "Common Notes" : "常見注意事項"}
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              {isEnglish
                ? "Long-term care services require periodic re-assessment."
                : "長照服務需定期重新評估。"}
            </li>
            <li>
              {isEnglish
                ? "Service items and quotas may be adjusted based on physical condition."
                : "服務項目與額度可能依身體狀況調整。"}
            </li>
            <li>
              {isEnglish
                ? "Subsidies of the same nature cannot be received simultaneously."
                : "補助不得重複請領相同性質項目。"}
            </li>
          </ul>

          <div className="mt-10 p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-900">
            ⚠️{" "}
            {isEnglish
              ? "This article is for reference only. Actual subsidy eligibility, service content, and application procedures are subject to the latest announcements from the Ministry of Health and Welfare and local governments."
              : "本文僅提供資訊整理與參考，實際補助資格、服務內容與申請流程，請以衛生福利部及各地方政府最新公告為準。"}
          </div>
        </section>

        <ShareButtons title={isEnglish ? "2025–2026 Long-Term Care / Medical Subsidy Guide | Application Eligibility, Subsidy Items Explained" : "2025–2026 長照／醫療補助懶人包｜申請資格、補助項目一次整理"} />

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

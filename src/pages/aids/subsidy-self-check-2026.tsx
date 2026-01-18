import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import ShareButtons from '@/components/ShareButtons';

export default function SubsidySelfCheck2026() {
  const { t, i18n } = useTranslation();
  const isEnglish = !i18n.language.startsWith("zh");

  return (
    <>
      <Helmet>
        <title>
          {isEnglish
            ? "🧭 Which Subsidies Am I Eligible For? Quick Self-Check Guide | RxV"
            : "🧭 我適合申請哪些補助？快速自我檢查指南｜RxV"}
        </title>
      </Helmet>
      <main className="max-w-4xl mx-auto px-4 py-10 leading-relaxed text-lg">
        <section>
          <h1 className="text-3xl font-extrabold mb-4">
            {isEnglish
              ? "🧭 Which Subsidies Am I Eligible For? Quick Self-Check Guide"
              : "🧭 我適合申請哪些補助？快速自我檢查指南"}
          </h1>
          <p className="text-gray-600 mb-3">
            {isEnglish ? "Published: January 2026" : "發布日期：2026 年 1 月"}
          </p>

          <p className="text-gray-700 mb-6">
            {isEnglish ? (
              <>
                If you are unsure which government subsidies you can apply for, you can check the following questions one by one to help quickly determine possible subsidy directions that may apply to you.
              </>
            ) : (
              <>
                若不確定自己可申請哪些政府補助，可依下列問題逐項檢查，協助快速判斷可能符合的補助方向。
              </>
            )}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-3">
            {isEnglish ? "Quick Self-Check List" : "快速自我檢查清單"}
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              {isEnglish
                ? "Do you have rental housing needs? (May be eligible for housing subsidies)."
                : "是否有租屋需求？（可能適用居住補助）。"}
            </li>
            <li>
              {isEnglish
                ? "Are you currently job searching or transitioning careers? (May be eligible for employment subsidies)."
                : "是否正在求職或轉職？（可能適用就業補助）。"}
            </li>
            <li>
              {isEnglish
                ? "Do you have children aged 0–6 years? (May be eligible for childcare subsidies)."
                : "是否有 0–6 歲幼兒？（可能適用育兒補助）。"}
            </li>
            <li>
              {isEnglish
                ? "Do you meet low-income or middle-low-income household conditions?"
                : "是否符合低收入或中低收入條件？"}
            </li>
            <li>
              {isEnglish
                ? "Do you have long-term care or medical needs?"
                : "是否有長期照顧或醫療需求？"}
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-3">
            {isEnglish ? "Usage Recommendations" : "使用建議"}
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              {isEnglish
                ? "Those who meet multiple conditions are advised to check the details of each subsidy separately."
                : "符合多項條件者，建議分別查詢各補助細節。"}
            </li>
            <li>
              {isEnglish
                ? "Some subsidies may have concurrent receipt restrictions."
                : "部分補助可能有併領限制。"}
            </li>
            <li>
              {isEnglish
                ? "It is recommended to proactively confirm with the responsible agency."
                : "建議主動向主管機關確認。"}
            </li>
          </ul>

          <div className="mt-10 p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-900">
            ⚠️{" "}
            {isEnglish
              ? "This article provides general self-check directions only. Actual eligibility is subject to each subsidy's announcements."
              : "本文僅提供一般性自我檢查方向，實際資格請以各補助公告為準。"}
          </div>
        </section>

        <ShareButtons title={isEnglish ? "Which Subsidies Am I Eligible For? Quick Self-Check Guide" : "我適合申請哪些補助？快速自我檢查指南"} />

        <div className="text-center mt-8">
          <Link
            to="/aids"
            className="bg-blue-600 hover:bg-blue-700 !text-white font-semibold py-2 px-6 rounded-full inline-block"
          >
            {isEnglish ? "← Back to Subsidy Package" : "← 回到補助懶人包"}
          </Link>
        </div>
      </main>
    </>
  );
}

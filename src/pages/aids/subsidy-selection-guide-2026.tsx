import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import ShareButtons from '@/components/ShareButtons';

export default function SubsidySelectionGuide2026() {
  const { t, i18n } = useTranslation();
  const isEnglish = !i18n.language.startsWith("zh");

  return (
    <>
      <Helmet>
        <title>
          {isEnglish
            ? "🤖 How to Choose Government Subsidies? Subsidy Eligibility Criteria Explained | RxV"
            : "🤖 政府補助怎麼選？補助條件判斷說明｜RxV"}
        </title>
      </Helmet>
      <main className="max-w-4xl mx-auto px-4 py-10 leading-relaxed text-lg">
        <section>
          <h1 className="text-3xl font-extrabold mb-4">
            {isEnglish
              ? "🤖 How to Choose Government Subsidies? Subsidy Eligibility Criteria Explained"
              : "🤖 政府補助怎麼選？補助條件判斷說明"}
          </h1>
          <p className="text-gray-600 mb-3">
            {isEnglish ? "Published: January 2026" : "發布日期：2026 年 1 月"}
          </p>

          <p className="text-gray-700 mb-6">
            {isEnglish ? (
              <>
                Whether government subsidies meet eligibility is usually determined based on the following criteria. Understanding these criteria can help you quickly determine which subsidy types you can apply for in the future.
              </>
            ) : (
              <>
                政府補助是否符合資格，通常依以下條件進行判斷。理解這些條件，有助於未來快速判斷可申請的補助類型。
              </>
            )}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-3">
            {isEnglish ? "Common Subsidy Eligibility Criteria" : "常見補助判斷條件"}
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              {isEnglish
                ? "Age."
                : "年齡。"}
            </li>
            <li>
              {isEnglish
                ? "Employment status."
                : "就業狀態。"}
            </li>
            <li>
              {isEnglish
                ? "Household member circumstances."
                : "家庭成員狀況。"}
            </li>
            <li>
              {isEnglish
                ? "Income and property conditions."
                : "收入與財產條件。"}
            </li>
            <li>
              {isEnglish
                ? "Whether already receiving other subsidies."
                : "是否已有其他補助。"}
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-3">
            {isEnglish ? "Additional Notes" : "說明補充"}
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              {isEnglish
                ? "Different subsidy criteria may affect each other."
                : "不同補助條件可能互相影響。"}
            </li>
            <li>
              {isEnglish
                ? "Some subsidies require on-site or document review."
                : "部分補助需進行實地或文件審核。"}
            </li>
            <li>
              {isEnglish
                ? "Criteria and regulations may be adjusted annually."
                : "條件與規定可能依年度調整。"}
            </li>
          </ul>

          <div className="mt-10 p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-900">
            ⚠️{" "}
            {isEnglish
              ? "This article provides explanations of subsidy eligibility principles only. Actual application results are subject to review by the responsible agency."
              : "本文僅提供補助判斷原則說明，實際申請結果以主管機關審核為準。"}
          </div>
        </section>

        <ShareButtons title={isEnglish ? "How to Choose Government Subsidies? Subsidy Eligibility Criteria Explained" : "政府補助怎麼選？補助條件判斷說明"} />

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

import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import ShareButtons from '@/components/ShareButtons';

export default function DebtRecoveryGuide2026() {
  const { i18n } = useTranslation();
  const isEnglish = !i18n.language.startsWith("zh");

  return (
    <>
      <Helmet>
        <title>
          {isEnglish
            ? "🌱 How to Gradually Restore Life and Financial Rhythm After Debt Difficulties | RxV"
            : "🌱 走過債務低潮後，如何慢慢恢復生活與理財節奏｜RxV"}
        </title>
      </Helmet>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <article className="bg-white p-6 rounded-2xl border shadow-sm text-lg">
          <h1 className="text-2xl md:text-3xl font-bold mb-3">
            {isEnglish
              ? "🌱 How to Gradually Restore Life and Financial Rhythm After Debt Difficulties"
              : "🌱 走過債務低潮後，如何慢慢恢復生活與理財節奏"}
          </h1>
          <p className="text-gray-500 mb-6">
            {isEnglish ? "Published: " : "發布日期："}2026-01-15
          </p>

          <p className="leading-8 mb-6">
            {isEnglish ? (
              <>
                After experiencing long-term financial pressure, even as problems are gradually being addressed, life rhythm and psychological state often still need time to slowly adjust. The following content only organizes common directions for life and financial reorganization, and does not mean that everyone needs to take the same approach.
              </>
            ) : (
              <>
                在經歷長期經濟壓力後，即使問題逐步被處理，生活節奏與心理狀態，往往仍需要一段時間慢慢調整。以下內容僅整理常見的生活與理財重整方向，不代表每個人都需採取相同做法。
              </>
            )}
          </p>

          <h2 className="text-xl font-bold mt-8 mb-3">
            {isEnglish ? "First Focus on Life Stability" : "先照顧生活穩定度"}
          </h2>
          <ul className="list-disc pl-6 space-y-2 leading-8">
            <li>
              {isEnglish
                ? "Establish basic daily routine and fixed life rhythm."
                : "建立基本作息與固定生活節奏。"}
            </li>
            <li>
              {isEnglish
                ? "Ensure basic housing and living needs."
                : "確保基本居住與生活需求。"}
            </li>
            <li>
              {isEnglish
                ? "Reduce unnecessary comparisons and self-blame."
                : "減少不必要的比較與自責。"}
            </li>
          </ul>

          <h2 className="text-xl font-bold mt-8 mb-3">
            {isEnglish ? "Reorganize Financial Structure" : "重新整理財務結構"}
          </h2>
          <ul className="list-disc pl-6 space-y-2 leading-8">
            <li>
              {isEnglish
                ? "Record actual income and expense situations."
                : "記錄實際收支狀況。"}
            </li>
            <li>
              {isEnglish
                ? "Distinguish between necessary expenses and adjustable items."
                : "區分必要支出與可調整項目。"}
            </li>
            <li>
              {isEnglish
                ? "Do not rush to restore past consumption standards."
                : "不急於恢復過去的消費標準。"}
            </li>
          </ul>
          <p className="leading-8 mt-4 text-gray-700">
            {isEnglish ? (
              <>
                If you are still in the process of understanding available institutional assistance, you can refer to{" "}
                <Link to="/finance/debt-relief-guide-2026" className="text-blue-600 underline">
                  What Assistance Can I Apply For When Financial Pressure Becomes Unbearable? Debt Rehabilitation and Debt Relief Explained
                </Link>
                {" "}for background information.
              </>
            ) : (
              <>
                若仍在了解可行制度性協助的過程中，可參考{" "}
                <Link to="/finance/debt-relief-guide-2026" className="text-blue-600 underline">
                  〈經濟壓力撐不住時，可以申請哪些協助？更生／消債一次整理〉
                </Link>
                {" "}了解背景資訊。
              </>
            )}
          </p>

          <h2 className="text-xl font-bold mt-8 mb-3">
            {isEnglish ? "Psychological and Emotional Recovery is Equally Important" : "心理與情緒的恢復同樣重要"}
          </h2>
          <ul className="list-disc pl-6 space-y-2 leading-8">
            <li>
              {isEnglish
                ? "Accept that recovery takes time."
                : "接受恢復需要時間。"}
            </li>
            <li>
              {isEnglish
                ? "Avoid viewing past circumstances as personal failure."
                : "避免將過去狀況視為個人失敗。"}
            </li>
            <li>
              {isEnglish
                ? "If emotions are affected long-term, consider seeking psychological or social support."
                : "若情緒長期受影響，可考慮尋求心理或社會支持。"}
            </li>
          </ul>

          <h2 className="text-xl font-bold mt-8 mb-3">
            {isEnglish ? "Establish Long-term Rather Than Rapid Financial Rhythm" : "建立長期而非快速的理財節奏"}
          </h2>
          <ul className="list-disc pl-6 space-y-2 leading-8">
            <li>
              {isEnglish
                ? "Prioritize stability over short-term improvement."
                : "以穩定為優先，而非短期改善。"}
            </li>
            <li>
              {isEnglish
                ? "View \"not getting worse\" as a form of progress."
                : "將「不再惡化」視為一種進步。"}
            </li>
            <li>
              {isEnglish
                ? "Gradually establish sustainable life and financial patterns."
                : "逐步建立可持續的生活與財務模式。"}
            </li>
          </ul>
          <p className="leading-8 mt-4 text-gray-700">
            {isEnglish ? (
              <>
                If you need to reassess your current situation, you can use the{" "}
                <Link to="/finance/debt-self-assessment-2026" className="text-blue-600 underline">
                  Self-Assessment Checklist: Do I Need to Consider Debt Rehabilitation / Debt Relief?
                </Link>
                {" "}for reflection.
              </>
            ) : (
              <>
                若需要重新評估目前狀況，可運用{" "}
                <Link to="/finance/debt-self-assessment-2026" className="text-blue-600 underline">
                  〈我是不是已經需要考慮更生／消債？自我檢視清單〉
                </Link>
                {" "}進行思考。
              </>
            )}
          </p>

          <div className="mt-10 p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-900">
            ⚠️{" "}
            {isEnglish
              ? "This article only provides organization of life and financial adjustment directions. It does not constitute legal, investment, or financial advice. Actual circumstances should be carefully assessed according to individual situations."
              : "本文僅提供生活與理財調整方向的整理，不構成法律、投資或財務建議，實際狀況請依個人情形審慎評估。"}
          </div>

          <ShareButtons title={isEnglish
            ? "How to Gradually Restore Life and Financial Rhythm After Debt Difficulties"
            : "走過債務低潮後，如何慢慢恢復生活與理財節奏"} />

          <div className="mt-10">
            <Link
              to="/finance"
              className="inline-block bg-blue-600 !text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              style={{ color: '#ffffff' }}
            >
              {isEnglish ? "← Back to Health & Finance Column" : "← 回到健康與理財專欄"}
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}

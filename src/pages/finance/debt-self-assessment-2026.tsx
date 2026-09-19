import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import ShareButtons from '@/components/ShareButtons';

export default function DebtSelfAssessment2026() {
  const { i18n } = useTranslation();
  const isEnglish = !i18n.language.startsWith("zh");

  return (
    <>
      <Helmet>
        <title>
          {isEnglish
            ? "🧭 Do I Need to Consider Debt Rehabilitation / Debt Relief? Self-Assessment Checklist | RxV"
            : "🧭 我是不是已經需要考慮更生／消債？自我檢視清單｜RxV"}
        </title>
      </Helmet>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <article className="bg-white p-6 rounded-2xl border shadow-sm text-lg">
          <h1 className="text-2xl md:text-3xl font-bold mb-3">
            {isEnglish
              ? "🧭 Do I Need to Consider Debt Rehabilitation / Debt Relief? Self-Assessment Checklist"
              : "🧭 我是不是已經需要考慮更生／消債？自我檢視清單"}
          </h1>
          <p className="text-gray-500 mb-6">
            {isEnglish ? "Published: " : "發布日期："}2026-01-15
          </p>

          <p className="leading-8 mb-6">
            {isEnglish ? (
              <>
                When economic pressure persists over the long term, it is often not easy to immediately determine whether one needs to further understand institutional assistance. The following content is only for self-assessment and reflection reference, and does not represent any application advice or legal judgment.
              </>
            ) : (
              <>
                當經濟壓力長期存在時，往往不容易立即判斷自己是否需要進一步了解制度性協助。以下內容僅作為自我檢視與思考參考，並不代表任何申請建議或法律判斷。
              </>
            )}
          </p>

          <h2 className="text-xl font-bold mt-8 mb-3">
            {isEnglish ? "Self-Assessment Checklist (Consider Each Item)" : "自我檢視清單（可逐項思考）"}
          </h2>
          <ul className="list-disc pl-6 space-y-2 leading-8">
            <li>
              {isEnglish
                ? "Have you been unable to make minimum monthly payments for several consecutive months?"
                : "是否已連續數月無法正常繳納最低還款金額？"}
            </li>
            <li>
              {isEnglish
                ? "Do you frequently use new loans to pay off old debts to maintain daily expenses?"
                : "是否經常以借新還舊方式維持日常開銷？"}
            </li>
            <li>
              {isEnglish
                ? "Have you experienced long-term insomnia, anxiety, or physical and mental discomfort due to bills or debt problems?"
                : "是否因帳單、債務問題出現長期失眠、焦慮或身心不適？"}
            </li>
            <li>
              {isEnglish
                ? "Have you attempted to negotiate with creditors but still cannot afford payments?"
                : "是否已嘗試與債權人協商，但仍無法負擔？"}
            </li>
            <li>
              {isEnglish
                ? "Is your income consistently insufficient to cover basic living expenses and debts?"
                : "是否收入長期不足以支應基本生活與債務？"}
            </li>
          </ul>

          <h2 className="text-xl font-bold mt-8 mb-3">
            {isEnglish ? "If Multiple Situations Apply, Possible Next Steps to Consider" : "若符合多項情況，可考慮的下一步"}
          </h2>
          <ul className="list-disc pl-6 space-y-2 leading-8">
            <li>
              {isEnglish
                ? "First, fully organize personal income, expenses, and debt situation."
                : "先完整整理個人收支與債務狀況。"}
            </li>
            <li>
              {isEnglish
                ? "Understand the basic content of current systems such as debt rehabilitation and liquidation."
                : "了解現行更生、清算等制度的基本內容。"}
            </li>
            <li>
              {isEnglish
                ? "Consult with public welfare or official units to confirm applicability."
                : "向公益或官方單位諮詢，確認適用性。"}
            </li>
            <li>
              {isEnglish
                ? "After fully understanding the impacts, decide whether to take further action."
                : "在充分理解影響後，再決定是否進一步行動。"}
            </li>
          </ul>
          <p className="leading-8 mt-4 text-gray-700">
            {isEnglish ? (
              <>
                If you need to first understand the institutional background and available assistance directions, you can refer to{" "}
                <Link to="/finance/debt-relief-guide-2026" className="text-blue-600 underline">
                  What Assistance Can I Apply For When Financial Pressure Becomes Unbearable? Debt Rehabilitation and Debt Relief Explained
                </Link>.
              </>
            ) : (
              <>
                如需先了解制度背景與可行的協助方向，可參考{" "}
                <Link to="/finance/debt-relief-guide-2026" className="text-blue-600 underline">
                  〈經濟壓力撐不住時，可以申請哪些協助？更生／消債一次整理〉
                </Link>。
              </>
            )}
          </p>

          <h2 className="text-xl font-bold mt-8 mb-3">
            {isEnglish ? "🔗 Official and Public Welfare Resources Available for Inquiry" : "🔗 可查詢的官方與公益資源"}
          </h2>
          <ul className="list-disc pl-6 space-y-2 leading-8">
            <li>
              {isEnglish
                ? "Judicial Yuan (Consumer Debt Clearance Act and System Explanations):"
                : "司法院（消費者債務清理條例與制度說明）："}
              <a
                href="https://www.judicial.gov.tw"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline ml-1"
              >
                www.judicial.gov.tw
              </a>
            </li>
            <li>
              {isEnglish
                ? "Legal Aid Foundation (Free Legal Consultation):"
                : "法律扶助基金會（免費法律諮詢）："}
              <a
                href="https://www.laf.org.tw"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline ml-1"
              >
                www.laf.org.tw
              </a>
            </li>
            <li>
              {isEnglish
                ? "Local District Courts:"
                : "各地方法院："}
              {isEnglish
                ? "Subject to announcements from the district court where household registration or residence is located."
                : "依戶籍或居住地所屬法院公告為準。"}
            </li>
          </ul>

          <h2 className="text-xl font-bold mt-8 mb-3">
            {isEnglish ? "Important Reminders" : "重要提醒"}
          </h2>
          <ul className="list-disc pl-6 space-y-2 leading-8">
            <li>
              {isEnglish
                ? "Whether debt rehabilitation or liquidation applies depends on individual circumstances."
                : "是否適用更生或清算，需依個人狀況判斷。"}
            </li>
            <li>
              {isEnglish
                ? "Each system has different impacts on credit, life, and future financial planning."
                : "各制度對信用、生活與未來財務規劃影響不同。"}
            </li>
            <li>
              {isEnglish
                ? "It is recommended to consult with professional or official units after fully understanding the systems."
                : "建議在充分理解後，再與專業或官方單位諮詢。"}
            </li>
          </ul>
          <p className="leading-8 mt-6 text-gray-700">
            {isEnglish ? (
              <>
                If you still have questions about the actual differences between debt rehabilitation, liquidation, and debt relief, you can further read{" "}
                <Link to="/finance/debt-systems-comparison-2026" className="text-blue-600 underline">
                  What's the Difference Between Debt Rehabilitation, Liquidation, and Debt Relief? Common Misconceptions Explained
                </Link>.
              </>
            ) : (
              <>
                若對更生、清算與消債的實際差異仍有疑問，可進一步閱讀{" "}
                <Link to="/finance/debt-systems-comparison-2026" className="text-blue-600 underline">
                  〈更生、清算、消債差在哪？常見誤解一次整理〉
                </Link>。
              </>
            )}
          </p>

          <div className="mt-10 p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-900">
            ⚠️{" "}
            {isEnglish
              ? "This article provides self-assessment and general information compilation only. It does not constitute legal or financial advice. Actual applicability is subject to explanations from courts or legal aid units."
              : "本文僅提供自我檢視與一般性資訊整理，不構成法律或財務建議，實際適用情形請以法院或法律扶助單位說明為準。"}
          </div>

          <ShareButtons title={isEnglish
            ? "Do I Need to Consider Debt Rehabilitation / Debt Relief? Self-Assessment Checklist"
            : "我是不是已經需要考慮更生／消債？自我檢視清單"} />

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

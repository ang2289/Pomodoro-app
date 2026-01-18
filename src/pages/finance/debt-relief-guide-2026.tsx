import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import ShareButtons from '@/components/ShareButtons';

export default function DebtReliefGuide2026() {
  const { i18n } = useTranslation();
  const isEnglish = !i18n.language.startsWith("zh");

  return (
    <>
      <Helmet>
        <title>
          {isEnglish
            ? "🧠 What Assistance Can I Apply For When Financial Pressure Becomes Unbearable? Debt Rehabilitation and Debt Relief Explained | RxV"
            : "🧠 經濟壓力撐不住時，可以申請哪些協助？更生／消債一次整理｜RxV"}
        </title>
      </Helmet>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <article className="bg-white p-6 rounded-2xl border shadow-sm text-lg">
          <h1 className="text-2xl md:text-3xl font-bold mb-3">
            {isEnglish
              ? "🧠 What Assistance Can I Apply For When Financial Pressure Becomes Unbearable? Debt Rehabilitation and Debt Relief Explained"
              : "🧠 經濟壓力撐不住時，可以申請哪些協助？更生／消債一次整理"}
          </h1>
          <p className="text-gray-500 mb-6">
            {isEnglish ? "Published: " : "發布日期："}2026-01-15
          </p>

          <p className="leading-8 mb-6">
            {isEnglish ? (
              <>
                When long-term financial pressure affects quality of life, sleep, or physical and mental well-being, some people begin to consider whether there are other institutional assistance options available. The following content only organizes common systems and directions to help understand available options, and does not mean that everyone is suitable for or needs to take the same approach.
              </>
            ) : (
              <>
                當長期經濟壓力影響到生活品質、睡眠或身心狀態時，有些人會開始思考是否還有其他制度性的協助方式。以下內容僅整理常見制度與方向，協助理解可行選項，並不代表每個人都適合或需要採取相同作法。
              </>
            )}
          </p>

          <h2 className="text-xl font-bold mt-8 mb-3">
            {isEnglish ? "Common Institutional Assistance Directions During Financial Difficulties" : "常見經濟困難時的制度性協助方向"}
          </h2>
          <ul className="list-disc pl-6 space-y-2 leading-8">
            <li>
              {isEnglish
                ? "Negotiate or adjust repayment terms with creditors."
                : "與債權人進行協商或還款調整。"}
            </li>
            <li>
              {isEnglish
                ? "Apply for court debt rehabilitation procedures."
                : "申請法院債務更生程序。"}
            </li>
            <li>
              {isEnglish
                ? "Apply for liquidation or debt relief related systems."
                : "申請清算或消債相關制度。"}
            </li>
            <li>
              {isEnglish
                ? "Seek legal aid or social resource consultation."
                : "尋求法律扶助或社會資源諮詢。"}
            </li>
          </ul>

          <h2 className="text-xl font-bold mt-8 mb-3">
            {isEnglish ? "What is 'Debt Rehabilitation'?" : "什麼是「更生」？"}
          </h2>
          <p className="leading-8 mb-4">
            {isEnglish ? (
              <>
                The debt rehabilitation system is for those who have certain repayment ability but cannot repay debts according to original terms. Through court-approved repayment plans, debts are repaid in installments over a certain period, and remaining debts are legally discharged upon completion.
              </>
            ) : (
              <>
                更生制度是針對具有一定還款能力，但無法依原條件清償債務者，透過法院核定還款計畫，在一定期間內分期償還，完成後其餘債務依法免除。
              </>
            )}
          </p>

          <h2 className="text-xl font-bold mt-8 mb-3">
            {isEnglish ? "What is 'Liquidation / Debt Relief'?" : "什麼是「清算／消債」？"}
          </h2>
          <p className="leading-8 mb-4">
            {isEnglish ? (
              <>
                The liquidation system usually applies to those who no longer have actual repayment ability. After the court inventories and processes assets, those who meet legal conditions may have remaining debts legally discharged upon completion of the procedure.
              </>
            ) : (
              <>
                清算制度通常適用於已無實際還款能力者，由法院清點財產後進行處理，符合法定條件者，可於程序完成後依法免除剩餘債務。
              </>
            )}
          </p>

          <h2 className="text-xl font-bold mt-8 mb-3">
            {isEnglish ? "Under What Circumstances Might One Need to Further Understand These Systems?" : "什麼情況下，可能需要進一步了解這些制度？"}
          </h2>
          <ul className="list-disc pl-6 space-y-2 leading-8">
            <li>
              {isEnglish
                ? "Long-term inability to make minimum monthly payments."
                : "長期無法正常繳納最低還款金額。"}
            </li>
            <li>
              {isEnglish
                ? "Using new loans to pay off old debts to maintain daily life."
                : "以借新還舊方式維持生活。"}
            </li>
            <li>
              {isEnglish
                ? "Financial pressure has clearly affected physical and mental health."
                : "經濟壓力已明顯影響身心健康。"}
            </li>
            <li>
              {isEnglish
                ? "Have attempted negotiation but still cannot afford payments."
                : "已嘗試協商但仍無法負擔。"}
            </li>
          </ul>
          <p className="leading-8 mt-4 text-gray-700">
            {isEnglish ? (
              <>
                If you are unsure whether you already need to further understand these systems, you can first use the{" "}
                <Link to="/finance/debt-self-assessment-2026" className="text-blue-600 underline">
                  Self-Assessment Checklist: Do I Need to Consider Debt Rehabilitation / Debt Relief?
                </Link>
                {" "}for preliminary reflection and organization.
              </>
            ) : (
              <>
                若不確定自己是否已經需要進一步了解這類制度，可先透過{" "}
                <Link to="/finance/debt-self-assessment-2026" className="text-blue-600 underline">
                  〈我是不是已經需要考慮更生／消債？自我檢視清單〉
                </Link>
                {" "}進行初步思考與整理。
              </>
            )}
          </p>

          <h2 className="text-xl font-bold mt-8 mb-3">
            {isEnglish ? "Other Channels to Consider Before Application" : "申請前可先考慮的其他管道"}
          </h2>
          <ul className="list-disc pl-6 space-y-2 leading-8">
            <li>
              {isEnglish
                ? "Inquire with creditors about adjusting repayment terms."
                : "向債權人詢問調整還款條件。"}
            </li>
            <li>
              {isEnglish
                ? "Apply for consultation with the Legal Aid Foundation."
                : "申請法律扶助基金會諮詢。"}
            </li>
            <li>
              {isEnglish
                ? "Contact local government social affairs bureaus or social welfare resources."
                : "洽詢地方政府社會局或社福資源。"}
            </li>
            <li>
              {isEnglish
                ? "Conduct a complete inventory of income, expenses, and debts."
                : "進行完整收支與債務盤點。"}
            </li>
          </ul>

          <h2 className="text-xl font-bold mt-8 mb-3">
            {isEnglish ? "🔗 Related Official Information and Assistance Resources" : "🔗 相關官方資訊與協助資源"}
          </h2>
          <ul className="list-disc pl-6 space-y-2 leading-8">
            <li>
              {isEnglish
                ? "Judicial Yuan | Consumer Debt Clearance Act (Legal Source and Explanation for Debt Rehabilitation / Liquidation):"
                : "司法院｜消費者債務清理條例（更生／清算法源與說明）："}
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
                ? "Legal Aid Foundation (Free Legal Consultation and Assistance):"
                : "法律扶助基金會（免費法律諮詢與協助）："}
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
                ? "Local District Courts (Actual Units Handling Debt Rehabilitation and Liquidation Cases):"
                : "各地方法院（更生與清算案件實際受理單位）："}
              {isEnglish
                ? "Actual applications should be made according to announcements from the district court where household registration or residence is located."
                : "實際申請請依戶籍或居住地所屬地方法院公告為準。"}
            </li>
          </ul>

          <h2 className="text-xl font-bold mt-8 mb-3">
            {isEnglish ? "Important Reminders (Not Legal Advice)" : "重要提醒（非法律建議）"}
          </h2>
          <ul className="list-disc pl-6 space-y-2 leading-8">
            <li>
              {isEnglish
                ? "Whether debt rehabilitation or liquidation applies depends on individual circumstances."
                : "是否適用更生或清算，需依個人狀況判斷。"}
            </li>
            <li>
              {isEnglish
                ? "Each system has different impacts on life, credit, and future financial planning."
                : "各制度對生活、信用及未來財務規劃影響不同。"}
            </li>
            <li>
              {isEnglish
                ? "It is recommended to consult with professional units after fully understanding the systems."
                : "建議在充分了解後，再與專業單位諮詢。"}
            </li>
          </ul>
          <p className="leading-8 mt-6 text-gray-700">
            {isEnglish ? (
              <>
                If you want to further understand the differences between debt rehabilitation, liquidation, and debt relief systems, you can refer to{" "}
                <Link to="/finance/debt-systems-comparison-2026" className="text-blue-600 underline">
                  What's the Difference Between Debt Rehabilitation, Liquidation, and Debt Relief? Common Misconceptions Explained
                </Link>.
              </>
            ) : (
              <>
                若想進一步理解更生、清算與消債之間的制度差異，可參考{" "}
                <Link to="/finance/debt-systems-comparison-2026" className="text-blue-600 underline">
                  〈更生、清算、消債差在哪？常見誤解一次整理〉
                </Link>。
              </>
            )}
          </p>

          <div className="mt-10 p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-900">
            ⚠️{" "}
            {isEnglish
              ? "This article provides general information compilation and life-level explanations only. It does not constitute legal or financial advice. Actual applicability is subject to explanations from courts, legal aid units, or responsible agencies."
              : "本文僅提供一般性資訊整理與生活層面說明，不構成法律或財務建議，實際適用情形請以法院、法律扶助單位或主管機關說明為準。"}
          </div>

          <ShareButtons title={isEnglish
            ? "What Assistance Can I Apply For When Financial Pressure Becomes Unbearable? Debt Rehabilitation and Debt Relief Explained"
            : "經濟壓力撐不住時，可以申請哪些協助？更生／消債一次整理"} />

          <div className="mt-10">
            <Link
              to="/finance"
              className="inline-block bg-blue-600 !text-white font-bold px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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

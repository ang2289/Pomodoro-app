import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import ShareButtons from '@/components/ShareButtons';

export default function DebtSystemsComparison2026() {
  const { i18n } = useTranslation();
  const isEnglish = !i18n.language.startsWith("zh");

  return (
    <>
      <Helmet>
        <title>
          {isEnglish
            ? "📘 What's the Difference Between Debt Rehabilitation, Liquidation, and Debt Relief? Common Misconceptions Explained | RxV"
            : "📘 更生、清算、消債差在哪？常見誤解一次整理｜RxV"}
        </title>
      </Helmet>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <article className="bg-white p-6 rounded-2xl border shadow-sm text-lg">
          <h1 className="text-2xl md:text-3xl font-bold mb-3">
            {isEnglish
              ? "📘 What's the Difference Between Debt Rehabilitation, Liquidation, and Debt Relief? Common Misconceptions Explained"
              : "📘 更生、清算、消債差在哪？常見誤解一次整理"}
          </h1>
          <p className="text-gray-500 mb-6">
            {isEnglish ? "Published: " : "發布日期："}2026-01-15
          </p>

          <p className="leading-8 mb-6">
            {isEnglish ? (
              <>
                When facing debt problems, one often hears terms such as "debt rehabilitation," "liquidation," or "debt relief," but in reality, the applicable circumstances and impacts of these systems are not the same. The following content only organizes system concepts and common misconceptions to help understand the differences, and does not represent any application advice.
              </>
            ) : (
              <>
                在面對債務問題時，常會聽到「更生」、「清算」或「消債」等名詞，但實際上，這些制度的適用情形與影響並不相同。以下內容僅整理制度概念與常見誤解，協助理解差異，並非任何申請建議。
              </>
            )}
          </p>
          <p className="leading-8 mb-6 text-gray-700">
            {isEnglish ? (
              <>
                If you want to first understand what institutional assistance directions are available under financial pressure, you can first read{" "}
                <Link to="/finance/debt-relief-guide-2026" className="text-blue-600 underline">
                  What Assistance Can I Apply For When Financial Pressure Becomes Unbearable? Debt Rehabilitation and Debt Relief Explained
                </Link>.
              </>
            ) : (
              <>
                若想先了解在經濟壓力下可有哪些制度性協助方向，可先閱讀{" "}
                <Link to="/finance/debt-relief-guide-2026" className="text-blue-600 underline">
                  〈經濟壓力撐不住時，可以申請哪些協助？更生／消債一次整理〉
                </Link>。
              </>
            )}
          </p>

          <h2 className="text-xl font-bold mt-8 mb-3">
            {isEnglish ? "What is 'Debt Rehabilitation'?" : "什麼是「更生」？"}
          </h2>
          <p className="leading-8 mb-4">
            {isEnglish ? (
              <>
                The debt rehabilitation system usually applies to those who still have partial repayment ability. The court reviews and approves a installment repayment plan, and after fulfilling the plan within a certain period, remaining debts are legally discharged.
              </>
            ) : (
              <>
                更生制度通常適用於仍具部分還款能力者，由法院審查並核定一份分期還款計畫，在一定期間內依計畫履行後，其餘債務依法免除。
              </>
            )}
          </p>

          <h2 className="text-xl font-bold mt-8 mb-3">
            {isEnglish ? "What is 'Liquidation'?" : "什麼是「清算」？"}
          </h2>
          <p className="leading-8 mb-4">
            {isEnglish ? (
              <>
                The liquidation system mostly applies to those who no longer have actual repayment ability. After the court inventories and processes assets, those who meet conditions may have remaining debts legally discharged.
              </>
            ) : (
              <>
                清算制度多適用於已無實際還款能力者，由法院清點與處理財產後，符合條件者可依法免除剩餘債務。
              </>
            )}
          </p>

          <h2 className="text-xl font-bold mt-8 mb-3">
            {isEnglish ? "What is 'Debt Relief'?" : "什麼是「消債」？"}
          </h2>
          <p className="leading-8 mb-4">
            {isEnglish ? (
              <>
                "Debt relief" is not a single legal procedure, but rather a general term for the final result of legally discharging debts through debt rehabilitation or liquidation systems.
              </>
            ) : (
              <>
                「消債」並非單一法律程序，而是一般對於透過更生或清算制度，最終依法免除債務結果的通稱。
              </>
            )}
          </p>

          <h2 className="text-xl font-bold mt-8 mb-3">
            {isEnglish ? "Basic Differences Between Debt Rehabilitation and Liquidation (Conceptual Summary)" : "更生與清算的基本差異（概念整理）"}
          </h2>
          <ul className="list-disc pl-6 space-y-2 leading-8">
            <li>
              {isEnglish
                ? "Whether a repayment plan needs to be proposed."
                : "是否需要提出還款計畫。"}
            </li>
            <li>
              {isEnglish
                ? "Whether one still has stable repayment ability."
                : "是否仍具穩定還款能力。"}
            </li>
            <li>
              {isEnglish
                ? "Different approaches to property handling."
                : "對財產處理方式的不同。"}
            </li>
            <li>
              {isEnglish
                ? "Differences in procedure duration and life impacts."
                : "程序期間與生活影響差異。"}
            </li>
          </ul>

          <h2 className="text-xl font-bold mt-8 mb-3">
            {isEnglish ? "Common Misconceptions Summary" : "常見誤解整理"}
          </h2>
          <ul className="list-disc pl-6 space-y-2 leading-8">
            <li>
              <strong>{isEnglish ? "Misconception 1: " : "誤解一："}</strong>
              {isEnglish
                ? "After application, one cannot work or open accounts for life."
                : "申請後一輩子不能工作或開戶。"}
              <br />
              <span className="text-gray-600">
                {isEnglish
                  ? "→ Actual impacts depend on individual circumstances and system content."
                  : "→ 實際影響需視個人情況與制度內容而定。"}
              </span>
            </li>
            <li>
              <strong>{isEnglish ? "Misconception 2: " : "誤解二："}</strong>
              {isEnglish
                ? "One will definitely be publicly announced or known to others."
                : "一定會被公告或讓周遭知道。"}
              <br />
              <span className="text-gray-600">
                {isEnglish
                  ? "→ Procedures and degree of publicity are handled according to regulations, and not all situations are the same."
                  : "→ 程序與公開程度依規定辦理，非所有情況相同。"}
              </span>
            </li>
            <li>
              <strong>{isEnglish ? "Misconception 3: " : "誤解三："}</strong>
              {isEnglish
                ? "As long as one applies, all debts will definitely be discharged."
                : "只要申請就一定能免除所有債務。"}
              <br />
              <span className="text-gray-600">
                {isEnglish
                  ? "→ Whether debts are discharged and the scope depend on court review results."
                  : "→ 是否免除及範圍，需依法院審核結果而定。"}
              </span>
            </li>
          </ul>

          <h2 className="text-xl font-bold mt-8 mb-3">
            {isEnglish ? "🔗 Official and Public Welfare Reference Resources" : "🔗 官方與公益參考資源"}
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
                ? "Legal Aid Foundation (Free Consultation and Assistance):"
                : "法律扶助基金會（免費諮詢與協助）："}
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
                ? "Applicability of each system varies from person to person."
                : "各制度適用性因人而異。"}
            </li>
            <li>
              {isEnglish
                ? "Different choices have different impacts on life and future planning."
                : "不同選擇對生活與未來規劃影響不同。"}
            </li>
            <li>
              {isEnglish
                ? "It is recommended to consult with official or public welfare units after fully understanding the systems."
                : "建議在充分理解制度後，再與官方或公益單位諮詢。"}
            </li>
          </ul>
          <p className="leading-8 mt-6 text-gray-700">
            {isEnglish ? (
              <>
                If you are currently still assessing your own situation, you can refer to the{" "}
                <Link to="/finance/debt-self-assessment-2026" className="text-blue-600 underline">
                  Self-Assessment Checklist: Do I Need to Consider Debt Rehabilitation / Debt Relief?
                </Link>
                {" "}for preliminary organization and reflection.
              </>
            ) : (
              <>
                若目前仍在評估自身狀況，可參考{" "}
                <Link to="/finance/debt-self-assessment-2026" className="text-blue-600 underline">
                  〈我是不是已經需要考慮更生／消債？自我檢視清單〉
                </Link>
                {" "}進行初步整理與思考。
              </>
            )}
          </p>

          <div className="mt-10 p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-900">
            ⚠️{" "}
            {isEnglish
              ? "This article only provides system concept and common misconception summaries. It does not constitute legal or financial advice. Actual applicability is subject to explanations from courts and relevant responsible agencies."
              : "本文僅為制度觀念與常見誤解整理，不構成法律或財務建議，實際適用情形請以法院及相關主管機關說明為準。"}
          </div>

          <ShareButtons title={isEnglish
            ? "What's the Difference Between Debt Rehabilitation, Liquidation, and Debt Relief? Common Misconceptions Explained"
            : "更生、清算、消債差在哪？常見誤解一次整理"} />

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

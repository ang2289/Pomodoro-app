import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

export default function FinanceGuide2026() {
  const { i18n } = useTranslation();
  const isEnglish = !i18n.language.startsWith("zh");

  return (
    <>
      <Helmet>
        <title>
          {isEnglish
            ? "🧭 Health & Finance Column Guide | Reading Order Suggestions When Facing Economic Pressure | RxV"
            : "🧭 健康理財專欄導覽｜面對經濟壓力時的閱讀順序建議｜RxV"}
        </title>
      </Helmet>
      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-right mb-4">
          <Link
            to="/"
            className="bg-blue-500 !text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600"
          >
            {i18n.language.startsWith("zh") ? "回首頁" : "Homepage"}
          </Link>
        </div>
        <h1 className="text-2xl font-bold mb-4">
          {isEnglish
            ? "🧭 Health & Finance Column Guide | Reading Order Suggestions When Facing Economic Pressure"
            : "🧭 健康理財專欄導覽｜面對經濟壓力時的閱讀順序建議"}
        </h1>
        <p className="text-gray-600 mb-6 leading-7">
          {isEnglish ? (
            <>
              When economic or debt pressure affects life and physical and mental well-being, it is often not easy to determine where to start understanding. This column organizes a set of reading paths to help gradually understand available institutional information and life adjustment directions at different stages. The following content is only for information organization and reading suggestions.
            </>
          ) : (
            <>
              當經濟或債務壓力影響生活與身心狀態時，往往不容易判斷應該從哪裡開始了解。本專欄整理一組閱讀路徑，協助在不同階段下，逐步理解可行的制度資訊與生活調整方向。以下內容僅為資訊整理與閱讀建議。
            </>
          )}
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">
          {isEnglish ? "🔎 What I'm Most Concerned About..." : "🔎 我現在最困擾的是…"}
        </h2>
        <p className="text-gray-600 mb-6 leading-7">
          {isEnglish
            ? "Different situations at different stages may require different content. You can choose the corresponding reading direction based on the situation closest to you right now."
            : "不同階段的狀況，適合閱讀的內容可能不同。可依目前最接近的情境，選擇對應的閱讀方向。"}
        </p>

        <div className="space-y-5 mb-8">
          <div className="border-l-4 border-gray-300 pl-4 py-3">
            <p className="text-gray-600 mb-2 text-sm font-medium">
              {isEnglish ? "Situation 1｜I've been under a lot of financial pressure recently, and I'm not sure if there are other assistance options available" : "情境一｜我最近經濟壓力很大，不知道還有沒有其他協助方式"}
            </p>
            <p className="text-gray-600 text-sm leading-6 mb-2">
              {isEnglish
                ? "You can start by understanding the organization of institutional assistance content."
                : "可先從制度性協助的整理內容開始了解。"}
            </p>
            <p className="text-sm">
              <Link
                to="/finance/debt-relief-guide-2026"
                className="text-blue-600 hover:underline"
              >
                {isEnglish
                  ? "What Assistance Can I Apply For When Financial Pressure Becomes Unbearable? Debt Rehabilitation and Debt Relief Explained"
                  : "〈經濟壓力撐不住時，可以申請哪些協助？更生／消債一次整理〉"}
              </Link>
            </p>
          </div>

          <div className="border-l-4 border-gray-300 pl-4 py-3">
            <p className="text-gray-600 mb-2 text-sm font-medium">
              {isEnglish ? "Situation 2｜I'm not sure if I already need to consider debt rehabilitation or debt relief" : "情境二｜我不確定自己是不是已經需要考慮更生或消債"}
            </p>
            <p className="text-gray-600 text-sm leading-6 mb-2">
              {isEnglish
                ? "You can first use self-assessment methods to help clarify your current situation."
                : "可先透過自我檢視方式，協助釐清目前狀況。"}
            </p>
            <p className="text-sm">
              <Link
                to="/finance/debt-self-assessment-2026"
                className="text-blue-600 hover:underline"
              >
                {isEnglish
                  ? "Do I Need to Consider Debt Rehabilitation / Debt Relief? Self-Assessment Checklist"
                  : "〈我是不是已經需要考慮更生／消債？自我檢視清單〉"}
              </Link>
            </p>
          </div>

          <div className="border-l-4 border-gray-300 pl-4 py-3">
            <p className="text-gray-600 mb-2 text-sm font-medium">
              {isEnglish ? "Situation 3｜I'm confused or anxious about the differences between debt rehabilitation, liquidation, and debt relief" : "情境三｜我對更生、清算、消債的差異感到混亂或不安"}
            </p>
            <p className="text-gray-600 text-sm leading-6 mb-2">
              {isEnglish
                ? "You can first understand the differences in terms and systems to reduce anxiety caused by information asymmetry."
                : "可先了解名詞與制度差異，降低資訊不對稱帶來的焦慮。"}
            </p>
            <p className="text-sm">
              <Link
                to="/finance/debt-systems-comparison-2026"
                className="text-blue-600 hover:underline"
              >
                {isEnglish
                  ? "What's the Difference Between Debt Rehabilitation, Liquidation, and Debt Relief? Common Misconceptions Explained"
                  : "〈更生、清算、消債差在哪？常見誤解一次整理〉"}
              </Link>
            </p>
          </div>

          <div className="border-l-4 border-gray-300 pl-4 py-3">
            <p className="text-gray-600 mb-2 text-sm font-medium">
              {isEnglish ? "Situation 4｜I'm worried that subsidies or systems might conflict with each other" : "情境四｜我擔心補助或制度之間會不會互相衝突"}
            </p>
            <p className="text-gray-600 text-sm leading-6 mb-2">
              {isEnglish
                ? "You can first understand the basic principles of concurrent use of subsidies and systems."
                : "可先了解補助與制度併用的基本原則。"}
            </p>
            <p className="text-sm">
              <Link
                to="/aids/subsidy-concurrent-qa-2026"
                className="text-blue-600 hover:underline"
              >
                {isEnglish
                  ? "Can Subsidies Be Received Simultaneously? Common Government Subsidy Concurrent Receipt Rules Q&A"
                  : "〈補助可以同時領嗎？常見補助併領規則 Q&A〉"}
              </Link>
            </p>
          </div>

          <div className="border-l-4 border-gray-300 pl-4 py-3">
            <p className="text-gray-600 mb-2 text-sm font-medium">
              {isEnglish ? "Situation 5｜After understanding the systems, I'm more concerned about directions for life and long-term recovery" : "情境五｜制度了解後，我更關心生活與長期恢復的方向"}
            </p>
            <p className="text-gray-600 text-sm leading-6 mb-2">
              {isEnglish
                ? "You can refer to content organizing life and financial rhythm adjustments."
                : "可參考生活與理財節奏調整的整理內容。"}
            </p>
            <p className="text-sm">
              <Link
                to="/finance/debt-recovery-guide-2026"
                className="text-blue-600 hover:underline"
              >
                {isEnglish
                  ? "How to Gradually Restore Life and Financial Rhythm After Debt Difficulties"
                  : "〈走過債務低潮後，如何慢慢恢復生活與理財節奏〉"}
              </Link>
            </p>
          </div>
        </div>

        <div className="border-l-4 border-gray-300 pl-4 py-3 mt-6 mb-8">
          <p className="text-gray-600 mb-2 text-sm font-medium">
            {isEnglish ? "🛟 If None of the Above Situations Match Your Current Situation" : "🛟 如果以上情境都不符合你目前的狀況"}
          </p>
          <p className="text-gray-600 text-sm leading-6 mb-3">
            {isEnglish
              ? "Everyone's circumstances and sources of pressure are different. If the above situations cannot fully correspond to your situation right now, it may mean your state is still changing or needs more time to organize."
              : "每個人的處境與壓力來源都不同，若以上情境暫時無法完全對應你的狀況，代表你的狀態可能仍在變動，或需要更多時間整理。"}
          </p>
          <p className="text-gray-600 text-sm leading-6 mb-3">
            {isEnglish
              ? "You can pause reading and return to life itself, or you can choose to start with other articles in the column and gradually understand content that is closer to you."
              : "你可以先暫停閱讀，回到生活本身，也可以選擇從專欄中的其他文章開始，慢慢了解與你較接近的內容。"}
          </p>
          <p className="text-gray-600 text-sm leading-6">
            {isEnglish
              ? "This column only provides information organization and reading guidance. It does not require any decisions or immediate action."
              : "本專欄僅提供資訊整理與閱讀引導，不要求任何決定，也不需要立即行動。"}
          </p>
        </div>

        <h2 className="text-xl font-bold mt-8 mb-4">
          {isEnglish ? "Suggested Reading Order (Please Choose Based on Your Situation)" : "建議閱讀順序（請依自身狀況選擇）"}
        </h2>

        <div className="space-y-6 mb-8">
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <p className="text-gray-600 mb-2 text-sm">
              {isEnglish ? "【Step 1｜Understand Available Assistance】" : "【第一步｜先了解有哪些協助】"}
            </p>
            <h3 className="text-lg font-bold mb-2">
              <Link
                to="/finance/debt-relief-guide-2026"
                className="text-blue-600 hover:underline"
              >
                {isEnglish
                  ? "What Assistance Can I Apply For When Financial Pressure Becomes Unbearable? Debt Rehabilitation and Debt Relief Explained"
                  : "經濟壓力撐不住時，可以申請哪些協助？更生／消債一次整理"}
              </Link>
            </h3>
            <p className="text-gray-600 text-sm leading-6">
              {isEnglish
                ? "If you currently feel that long-term financial pressure is affecting your life, you can first understand what institutional assistance options are available as a preliminary introduction and organization direction."
                : "若目前感到長期經濟壓力影響生活，可先了解制度性協助有哪些選項，作為初步認識與整理方向。"}
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <p className="text-gray-600 mb-2 text-sm">
              {isEnglish ? "【Step 2｜Self-Assessment】" : "【第二步｜進行自我檢視】"}
            </p>
            <h3 className="text-lg font-bold mb-2">
              <Link
                to="/finance/debt-self-assessment-2026"
                className="text-blue-600 hover:underline"
              >
                {isEnglish
                  ? "Do I Need to Consider Debt Rehabilitation / Debt Relief? Self-Assessment Checklist"
                  : "我是不是已經需要考慮更生／消債？自我檢視清單"}
              </Link>
            </h3>
            <p className="text-gray-600 text-sm leading-6">
              {isEnglish
                ? "Through simple self-assessment questions, help reflect on whether it is necessary to further understand related systems."
                : "透過簡單的自我檢視問題，協助思考是否有必要進一步了解相關制度。"}
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <p className="text-gray-600 mb-2 text-sm">
              {isEnglish ? "【Step 3｜Clarify System Differences and Common Misconceptions】" : "【第三步｜釐清制度差異與常見誤解】"}
            </p>
            <h3 className="text-lg font-bold mb-2">
              <Link
                to="/finance/debt-systems-comparison-2026"
                className="text-blue-600 hover:underline"
              >
                {isEnglish
                  ? "What's the Difference Between Debt Rehabilitation, Liquidation, and Debt Relief? Common Misconceptions Explained"
                  : "更生、清算、消債差在哪？常見誤解一次整理"}
              </Link>
            </h3>
            <p className="text-gray-600 text-sm leading-6">
              {isEnglish
                ? "Organizes common terms and system differences to reduce anxiety or misunderstandings arising from unclear information."
                : "整理常見名詞與制度差異，降低因資訊不清而產生的焦慮或誤解。"}
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <p className="text-gray-600 mb-2 text-sm">
              {isEnglish ? "【Step 4｜Supplement Understanding of Concurrent Receipt and System Relationships】" : "【第四步｜補充理解併領與制度關係】"}
            </p>
            <h3 className="text-lg font-bold mb-2">
              <Link
                to="/aids/subsidy-concurrent-qa-2026"
                className="text-blue-600 hover:underline"
              >
                {isEnglish
                  ? "Can Subsidies Be Received Simultaneously? Common Government Subsidy Concurrent Receipt Rules Q&A"
                  : "補助可以同時領嗎？常見補助併領規則 Q&A"}
              </Link>
            </h3>
            <p className="text-gray-600 text-sm leading-6">
              {isEnglish
                ? "Understand the basic principles of concurrent use between different systems and subsidies to avoid misunderstandings or unnecessary worries."
                : "了解不同制度與補助之間的基本併用原則，避免誤解或不必要的擔心。"}
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <p className="text-gray-600 mb-2 text-sm">
              {isEnglish ? "【Step 5｜Return to Life and Long-term Rhythm】" : "【第五步｜回到生活與長期節奏】"}
            </p>
            <h3 className="text-lg font-bold mb-2">
              <Link
                to="/finance/debt-recovery-guide-2026"
                className="text-blue-600 hover:underline"
              >
                {isEnglish
                  ? "How to Gradually Restore Life and Financial Rhythm After Debt Difficulties"
                  : "走過債務低潮後，如何慢慢恢復生活與理財節奏"}
              </Link>
            </h3>
            <p className="text-gray-600 text-sm leading-6">
              {isEnglish
                ? "Beyond understanding systems, also focus on adjustment directions for life, psychology, and long-term financial rhythm."
                : "在制度理解之外，也關注生活、心理與長期理財節奏的調整方向。"}
            </p>
          </div>
        </div>

        <h2 className="text-xl font-bold mt-8 mb-3">
          {isEnglish ? "Usage Reminders" : "使用提醒"}
        </h2>
        <ul className="list-disc pl-6 space-y-2 leading-7 text-gray-600 mb-6">
          <li>
            {isEnglish
              ? "This column content is only for information organization and reading guidance."
              : "本專欄內容僅為資訊整理與閱讀引導。"}
          </li>
          <li>
            {isEnglish
              ? "Different situations may require different reading orders."
              : "不同狀況適合的閱讀順序可能不同。"}
          </li>
          <li>
            {isEnglish
              ? "If you need further assistance, it is recommended to consult with official or public welfare units."
              : "若需進一步協助，建議洽詢官方或公益單位。"}
          </li>
        </ul>

        <div className="mt-10 p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-900">
          ⚠️{" "}
          {isEnglish
            ? "This column content does not constitute legal, financial, or investment advice. Actual circumstances should be assessed according to individual situations and explanations from responsible agencies."
            : "本專欄內容不構成法律、財務或投資建議，實際情形請依個人狀況與主管機關說明為準。"}
        </div>

        <div className="mt-8">
          <Link
            to="/finance"
            className="text-blue-600 hover:underline"
          >
            {isEnglish ? "← Back to Health & Finance Column" : "← 回到健康與理財專欄"}
          </Link>
        </div>
      </main>
    </>
  );
}

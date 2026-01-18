import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import ShareButtons from '@/components/ShareButtons';

export default function YouthEmployment2026() {
  const { t, i18n } = useTranslation();
  const isEnglish = !i18n.language.startsWith("zh");

  return (
    <>
      <Helmet>
        <title>
          {isEnglish
            ? "🧑‍💼 2025–2026 Youth Employment / Career Transition Subsidy Guide | Application Eligibility, Subsidy Amount, Process Explained | RxV"
            : "🧑‍💼 2025–2026 青年就業／轉職補助懶人包｜申請資格、補助金額、流程一次看懂｜RxV"}
        </title>
      </Helmet>
      <main className="max-w-4xl mx-auto px-4 py-10 leading-relaxed text-lg">
        <section>
          <h1 className="text-3xl font-extrabold mb-4">
            {isEnglish
              ? "🧑‍💼 2025–2026 Youth Employment / Career Transition Subsidy Guide | Application Eligibility, Subsidy Amount, Process Explained"
              : "🧑‍💼 2025–2026 青年就業／轉職補助懶人包｜申請資格、補助金額、流程一次看懂"}
          </h1>
          <p className="text-gray-600 mb-3">
            {isEnglish ? "Published: January 2026" : "發布日期：2026 年 1 月"}
          </p>

          <p className="text-gray-700 mb-6">
            {isEnglish ? (
              <>
                The government provides various employment promotion and career transition subsidy measures to assist young people in achieving stable employment and smooth career transitions. Subsidies are available for specific age groups and employment statuses. The content of subsidies varies depending on individual status, employment situation, and participation in different programs. Eligible applicants include unemployed youth, career transitioners, and some non-standard workers.
              </>
            ) : (
              <>
                政府為協助青年穩定就業、順利轉職，針對特定年齡區間與就業狀態，提供多項就業促進與轉職補助措施。補助內容依個人身分、就業狀況及參與方案而有所不同，適用對象包含待業青年、轉職者及部分非典型就業者。
              </>
            )}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-3">
            {isEnglish ? "Applicants and Basic Requirements" : "申請對象與基本條件"}
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              {isEnglish
                ? "Age approximately 18–45 years old (actual age range subject to each program's announcement)."
                : "年齡約 18～45 歲（實際依各方案公告為準）。"}
            </li>
            <li>
              {isEnglish
                ? "Currently unemployed, or in career transition, or re-entering the workforce."
                : "目前待業中，或屬於轉職、重新投入就業者。"}
            </li>
            <li>
              {isEnglish
                ? "Must have Republic of China nationality and be legally registered or residing in Taiwan."
                : "具中華民國國籍，並依法設籍或居留。"}
            </li>
            <li>
              {isEnglish
                ? "Must not be simultaneously receiving other government subsidies of the same nature."
                : "未同時重複請領性質相同之政府補助。"}
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-3">
            {isEnglish ? "Common Types of Youth Employment / Career Transition Subsidies" : "常見青年就業／轉職補助類型"}
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              {isEnglish
                ? "Youth Employment Promotion Subsidy (Stable Employment Reward)."
                : "青年就業促進補助（穩定就業獎勵）。"}
            </li>
            <li>
              {isEnglish
                ? "Career Transition Employment Reward."
                : "轉職就業獎勵金。"}
            </li>
            <li>
              {isEnglish
                ? "Pre-employment or On-the-job Vocational Training Subsidy."
                : "職前或在職職業訓練補助。"}
            </li>
            <li>
              {isEnglish
                ? "Cross-industry Career Transition Training Subsidy."
                : "跨產業轉職培訓補助。"}
            </li>
            <li>
              {isEnglish
                ? "Local Government Youth Employment Project Subsidies (varies by county/city)."
                : "地方政府青年就業專案補助（依縣市不同）。"}
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-3">
            {isEnglish ? "Subsidy Amount Explanation (Varies by Program)" : "補助金額說明（依方案不同）"}
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              {isEnglish
                ? "Employment reward: Approximately several thousand to tens of thousands of NTD."
                : "就業獎勵金：約數千元至數萬元不等。"}
            </li>
            <li>
              {isEnglish
                ? "Career transition or training subsidy: Based on training hours or approved plan."
                : "轉職或培訓補助：依訓練時數或計畫核定。"}
            </li>
            <li>
              {isEnglish
                ? "Some programs use phased or installment payments."
                : "部分方案採分階段或分次撥付。"}
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-3">
            {isEnglish ? "🔗 Official Application and Inquiry Portal" : "🔗 官方申請與查詢入口"}
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              {isEnglish
                ? "Ministry of Labor Workforce Development Agency (Youth Employment and Training Policy Portal):"
                : "勞動部勞動力發展署（青年就業與訓練政策總入口）："}
              <a
                href="https://www.wda.gov.tw"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline ml-1"
              >
                www.wda.gov.tw
              </a>
            </li>
            <li>
              {isEnglish
                ? "TaiwanJobs (Main Platform for Youth Employment and Career Transition Subsidy Inquiries and Applications):"
                : "台灣就業通（青年就業、轉職補助主要查詢與申請平台）："}
              <a
                href="https://www.taiwanjobs.gov.tw"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline ml-1"
              >
                www.taiwanjobs.gov.tw
              </a>
            </li>
            <li>
              {isEnglish
                ? "Youth Employment Zone (Compilation of Youth Employment Promotion and Career Transition Programs):"
                : "青年就業專區（青年就業促進與轉職方案彙整）："}
              <a
                href="https://youthjob.taiwanjobs.gov.tw"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline ml-1"
              >
                youthjob.taiwanjobs.gov.tw
              </a>
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-3">
            {isEnglish ? "Application Methods and Process Example" : "申請方式與流程範例"}
          </h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              {isEnglish
                ? "Confirm eligibility for the subsidy program."
                : "確認自身符合補助方案資格。"}
            </li>
            <li>
              {isEnglish
                ? "Apply online through the Ministry of Labor or local government designated platform."
                : "於勞動部或地方政府指定平台線上申請。"}
            </li>
            <li>
              {isEnglish
                ? "Submit required supporting documents as specified."
                : "依規定檢附相關證明文件。"}
            </li>
            <li>
              {isEnglish
                ? "Wait for review result notification."
                : "等待審核結果通知。"}
            </li>
            <li>
              {isEnglish
                ? "After approval, subsidy will be disbursed according to the specified period."
                : "通過後依規定期間撥付補助款。"}
            </li>
          </ol>

          <h2 className="text-2xl font-bold mt-8 mb-3">
            {isEnglish ? "Common Notes" : "常見注意事項"}
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              {isEnglish
                ? "Subsidy content and amounts are subject to the current year's announcements."
                : "各方案補助內容與金額以當年度公告為準。"}
            </li>
            <li>
              {isEnglish
                ? "It may not be possible to receive subsidies of the same nature simultaneously during the same period."
                : "同一期間可能無法同時請領性質相同補助。"}
            </li>
            <li>
              {isEnglish
                ? "Providing false information will result in disqualification and may require repayment of subsidies."
                : "提供不實資料者，將取消資格並可能需返還補助。"}
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-3">
            {isEnglish ? "Process Flow (Text Description)" : "流程示意（文字描述即可）"}
          </h2>
          <p className="text-gray-700 mb-6">
            {isEnglish
              ? "Prepare Documents → Online Application → Eligibility Review → Approval → Subsidy Disbursement"
              : "準備資料 → 線上申請 → 資格審核 → 通過核定 → 補助撥付"}
          </p>

          <svg viewBox="0 0 600 140" className="mx-auto my-8 w-full max-w-2xl">
            <rect x="10" y="20" width="90" height="40" rx="10" fill="#FEE2E2" />
            <text x="20" y="45" fontSize="12">
              {isEnglish ? "Prepare Documents" : "準備資料"}
            </text>
            <rect x="120" y="20" width="90" height="40" rx="10" fill="#BFDBFE" />
            <text x="135" y="45" fontSize="12">
              {isEnglish ? "Online Application" : "線上申請"}
            </text>
            <rect x="230" y="20" width="90" height="40" rx="10" fill="#FDE68A" />
            <text x="245" y="45" fontSize="12">
              {isEnglish ? "Eligibility Review" : "資格審核"}
            </text>
            <rect x="340" y="20" width="90" height="40" rx="10" fill="#D8B4FE" />
            <text x="355" y="45" fontSize="12">
              {isEnglish ? "Approval" : "通過核定"}
            </text>
            <rect x="450" y="20" width="90" height="40" rx="10" fill="#BBF7D0" />
            <text x="465" y="45" fontSize="12">
              {isEnglish ? "Subsidy Disbursement" : "補助撥付"}
            </text>
            <line
              x1="100"
              y1="40"
              x2="120"
              y2="40"
              stroke="#3B82F6"
              strokeWidth="3"
              markerEnd="url(#arrow)"
            />
            <line
              x1="210"
              y1="40"
              x2="230"
              y2="40"
              stroke="#3B82F6"
              strokeWidth="3"
              markerEnd="url(#arrow)"
            />
            <line
              x1="320"
              y1="40"
              x2="340"
              y2="40"
              stroke="#3B82F6"
              strokeWidth="3"
              markerEnd="url(#arrow)"
            />
            <line
              x1="430"
              y1="40"
              x2="450"
              y2="40"
              stroke="#3B82F6"
              strokeWidth="3"
              markerEnd="url(#arrow)"
            />
            <defs>
              <marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="3" orient="auto">
                <path d="M0,0 L0,6 L9,3 z" fill="#3B82F6" />
              </marker>
            </defs>
          </svg>

          <div className="mt-10 p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-900">
            ⚠️{" "}
            {isEnglish
              ? "This article is for reference only. Actual subsidy eligibility, amounts, and application procedures are subject to the latest announcements from the Ministry of Labor and local governments."
              : "本文僅提供資訊整理與參考，實際補助資格、金額與申請流程，請以勞動部及各地方政府最新公告為準。"}
          </div>
        </section>

        <ShareButtons title={isEnglish ? "2025–2026 Youth Employment / Career Transition Subsidy Guide | Application Eligibility, Subsidy Amount, Process Explained" : "2025–2026 青年就業／轉職補助懶人包｜申請資格、補助金額、流程一次看懂"} />

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

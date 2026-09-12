import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

export default function LTC2025Update() {
  const { i18n } = useTranslation();
  const isEnglish = !i18n.language.startsWith("zh");

  return (
    <>
      <Helmet>
        <title>
          {isEnglish
            ? "👵 Long-term Care 2.0 Update | 2025 Amendment and Benefit Expansion | RxV"
            : "👵 長照 2.0 更新｜114 年修法與給付擴充（2025）｜RxV"}
        </title>
      </Helmet>
      <main className="max-w-4xl mx-auto px-4 py-10 leading-relaxed text-lg">
        <section>
          <h1 className="text-3xl font-extrabold mb-4">
            {isEnglish
              ? "👵 Long-term Care 2.0 Update | 2025 Amendment and Benefit Expansion"
              : "👵 長照 2.0 更新｜114 年修法與給付擴充（2025）"}
          </h1>
          <p className="text-gray-600 mb-3">
            {isEnglish ? "Announcement Date: June 19, 2025" : "公告日期：2025 年 6 月 19 日"}
          </p>

          <p className="text-gray-700 mb-6">
            {isEnglish ? (
              <>
                The Ministry of Health and Welfare announced amendments to the "Long-term Care
                Service Application and Payment Regulations" in 2025, effective from September 1.
                This is the largest adjustment since Long-term Care 2.0 was launched in 2017,
                relaxing service eligibility, expanding care coverage, and adding smart assistive
                device and respite care subsidies to help disabled elderly, dementia patients, and
                caregivers receive more support.
              </>
            ) : (
              <>
                衛生福利部於 114 年公告修正「長期照顧服務申請及給付辦法」，自 9 月 1 日起實施。
                此次修法為長照 2.0 自 2017 年上路以來最大幅度調整，放寬服務對象、擴充照顧範圍，
                並新增智慧輔具與喘息照護補助，協助失能長者、失智者與照顧者獲得更多支持。
              </>
            )}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-3">
            {isEnglish ? "📋 Latest Amendment Summary" : "📋 最新修法摘要"}
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              {isEnglish
                ? "Opening up 'foreign caregiver families' to apply for community care services simultaneously."
                : "開放「外籍看護家庭」可同時申請社區照顧服務。"}
            </li>
            <li>
              {isEnglish
                ? "Adding 'young-onset dementia' and 'post-acute care' as service targets."
                : "新增「年輕型失智症」與「急性後期照護」服務對象。"}
            </li>
            <li>
              {isEnglish
                ? "Increasing smart assistive device subsidies, with rental up to 60,000 NTD/3 years."
                : "智慧輔具補助金額提高，租賃最高 6 萬元／3 年。"}
            </li>
            <li>
              {isEnglish
                ? "Strengthening home rehabilitation services and professional home consultation."
                : "強化居家復能服務與專業到宅諮詢。"}
            </li>
          </ul>

        <h2 className="text-2xl font-bold mt-8 mb-3">
          {isEnglish ? "💰 Benefit Items and Subsidy Amounts" : "💰 給付項目與補助額度"}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 text-left mb-6">
            <thead className="bg-pink-50">
              <tr>
                <th className="border px-3 py-2">
                  {isEnglish ? "Service Item" : "服務項目"}
                </th>
                <th className="border px-3 py-2">
                  {isEnglish ? "Subsidy Content" : "補助內容"}
                </th>
                <th className="border px-3 py-2">
                  {isEnglish ? "Maximum Subsidy" : "最高補助額"}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-3 py-2">
                  {isEnglish ? "Home Care Services" : "居家服務"}
                </td>
                <td className="border px-3 py-2">
                  {isEnglish
                    ? "Caregivers visit homes to assist with bathing, meal preparation, and companionship."
                    : "照顧服務員到宅協助沐浴、備餐、陪伴。"}
                </td>
                <td className="border px-3 py-2">
                  {isEnglish ? "Up to 36,000 NTD/month" : "每月最高 36,000 元"}
                </td>
              </tr>
              <tr>
                <td className="border px-3 py-2">
                  {isEnglish ? "Respite Services" : "喘息服務"}
                </td>
                <td className="border px-3 py-2">
                  {isEnglish
                    ? "Provides short-term substitute care for family members to reduce caregiving stress."
                    : "提供家屬短期替代照顧，減輕照顧壓力。"}
                </td>
                <td className="border px-3 py-2">
                  {isEnglish ? "Up to 21,000 NTD/year" : "每年最高 21,000 元"}
                </td>
              </tr>
              <tr>
                <td className="border px-3 py-2">
                  {isEnglish ? "Day Care Centers" : "日間照顧中心"}
                </td>
                <td className="border px-3 py-2">
                  {isEnglish
                    ? "Provides social activities, nutritious meals, and rehabilitation courses."
                    : "提供社交活動、營養餐食及復能課程。"}
                </td>
                <td className="border px-3 py-2">
                  {isEnglish ? "Up to 800 NTD/day" : "每日最高補助 800 元"}
                </td>
              </tr>
              <tr>
                <td className="border px-3 py-2">
                  {isEnglish ? "Smart Assistive Device Rental" : "智慧輔具租賃"}
                </td>
                <td className="border px-3 py-2">
                  {isEnglish
                    ? "Rental of electric beds, walkers, and other smart equipment."
                    : "租賃電動床、助行器等智慧設備。"}
                </td>
                <td className="border px-3 py-2">
                  {isEnglish ? "Up to 60,000 NTD/3 years" : "每 3 年最高 60,000 元"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-2xl font-bold mt-8 mb-3">
          {isEnglish ? "🌐 Online Application and Inquiry Channels" : "🌐 線上申請與洽詢管道"}
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            {isEnglish ? "Long-term Care Hotline: Call " : "長照專線：撥打 "}
            <strong className="text-pink-600 ml-1">1966</strong>
            {isEnglish ? " (24/7)." : "（全年無休）。"}
          </li>
          <li>
            {isEnglish ? "Official announcement page: " : "官方公告頁面： "}
            <a
              href="https://www.mohw.gov.tw/cp-18-82814-1.html"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline ml-1"
            >
              {isEnglish
                ? "Ministry of Health and Welfare Long-term Care Policy Announcement Page"
                : "衛福部長照政策公告頁"}
            </a>
          </li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-3">
          {isEnglish ? "📊 Long-term Care Service Flow Chart" : "📊 長照服務流程圖"}
        </h2>
        <svg viewBox="0 0 500 160" className="mx-auto my-8 w-full max-w-lg">
          <rect x="10" y="30" width="100" height="40" rx="10" fill="#FDE68A" />
          <text x="25" y="55" fontSize="14">
            {isEnglish ? "Call 1966" : "撥打 1966"}
          </text>
          <rect x="140" y="30" width="120" height="40" rx="10" fill="#BFDBFE" />
          <text x="150" y="55" fontSize="14">
            {isEnglish ? "Needs Assessment" : "需求評估"}
          </text>
          <rect x="290" y="30" width="120" height="40" rx="10" fill="#BBF7D0" />
          <text x="300" y="55" fontSize="14">
            {isEnglish ? "Service Matching" : "服務媒合"}
          </text>
          <rect x="430" y="30" width="60" height="40" rx="10" fill="#FBCFE8" />
          <text x="440" y="55" fontSize="14">
            {isEnglish ? "Start Service" : "開始服務"}
          </text>
          <line
            x1="110"
            y1="50"
            x2="140"
            y2="50"
            stroke="#3B82F6"
            strokeWidth="3"
            markerEnd="url(#arrow)"
          />
          <line
            x1="260"
            y1="50"
            x2="290"
            y2="50"
            stroke="#3B82F6"
            strokeWidth="3"
            markerEnd="url(#arrow)"
          />
          <line
            x1="410"
            y1="50"
            x2="430"
            y2="50"
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

        <h2 className="text-2xl font-bold mt-8 mb-3">
          {isEnglish
            ? "📎 Download Official Application Guide (PDF)"
            : "📎 下載官方申請指南（PDF）"}
        </h2>
        <p className="text-gray-700 mb-6">
          {isEnglish ? (
            <>
              The official long-term care benefit and application method guide (PDF) is currently
              maintained by the Ministry of Health and Welfare. File links are temporarily under
              adjustment. Please visit the{" "}
              <a
                href="https://www.mohw.gov.tw/cp-18-82814-1.html"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline mx-1"
              >
                Ministry of Health and Welfare Long-term Care Policy Announcement Page
              </a>
              to view the latest version.
              <br />
              <span className="text-gray-500 text-sm">
                (If downloads are restored in the future, this site will update with the direct PDF
                link)
              </span>
            </>
          ) : (
            <>
              官方長照給付與申請辦法指南（PDF）目前由衛生福利部公告維護中，
              檔案鏈結暫時調整中，請至
              <a
                href="https://www.mohw.gov.tw/cp-18-82814-1.html"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline mx-1"
              >
                衛福部長照政策公告頁
              </a>
              查閱最新版本。<br />
              <span className="text-gray-500 text-sm">
                （若日後恢復下載，本站將同步更新 PDF 直接鏈結）
              </span>
            </>
          )}
        </p>

        <div className="mt-10 p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-900">
          ⚠️{" "}
          {isEnglish
            ? "This article is for reference only. Actual subsidy amounts and regulations are subject to the latest announcements from the Ministry of Health and Welfare and local governments."
            : "本文僅供摘要參考，實際補助金額與規範以衛福部及地方政府公告為準。"}
        </div>
      </section>

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


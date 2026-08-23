import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import ShareButtons from '@/components/ShareButtons';

export default function RentalSubsidy2025() {
  const { t, i18n } = useTranslation();
  const isEnglish = !i18n.language.startsWith("zh");

  return (
    <>
      <Helmet>
        <title>
          {isEnglish
            ? "🏠 2025 Rental Subsidy New System | 30 Billion Central Government Expanded Rental Subsidy | RxV"
            : "🏠 2025 租屋補助新制｜300 億中央擴大租金補貼專案｜RxV"}
        </title>
      </Helmet>
      <main className="max-w-4xl mx-auto px-4 py-10 leading-relaxed text-lg">
        <section>
          <h1 className="text-3xl font-extrabold mb-4">
            {isEnglish
              ? "🏠 2025 Rental Subsidy New System | 30 Billion Central Government Expanded Rental Subsidy Project"
              : "🏠 2025 租屋補助新制｜300 億中央擴大租金補貼專案"}
          </h1>
          <p className="text-gray-600 mb-3">
            {isEnglish ? "Published: January 2025" : "發布日期：2025 年 1 月"}
          </p>

          <p className="text-gray-700 mb-6">
            {isEnglish ? (
              <>
                The government has launched the{" "}
                <strong>"30 Billion Central Government Expanded Rental Subsidy Project"</strong>,
                accepting applications from 2025. The subsidy coverage has been expanded and
                eligibility relaxed to help more renters reduce their burden. Eligible applicants
                can apply online through the Ministry of the Interior or National Land Management
                Agency website. The overall process has been simplified, and subsidies will be
                deposited directly into accounts.
              </>
            ) : (
              <>
                政府推出「<strong>300 億元中央擴大租金補貼專案</strong>」，自 114 年起受理申請，補貼戶數擴大、資格放寬，
                協助更多租屋族減輕負擔。符合資格者可於內政部或國土管理署官網線上申請，整體作業流程簡化，補貼將直接入帳。
              </>
            )}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-3">
            {isEnglish ? "Eligibility and Requirements" : "申請對象與條件"}
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              {isEnglish
                ? "Households with two or more members, or low-income/middle-low-income households are prioritized."
                : "家庭成員兩人以上、或低收入／中低收入戶優先。"}
            </li>
            <li>
              {isEnglish
                ? "Actual subsidy amount is calculated based on 'actual rent paid', with upper limits set by each county/city."
                : "實際補貼金額依「實付租金」計算，各縣市設有上限。"}
            </li>
            <li>
              {isEnglish
                ? "'Public welfare landlords' can enjoy tax exemption on rental income, and property tax and land value tax are calculated at the same rate as owner-occupied housing."
                : "「公益出租人」房東可享租金所得免稅、房屋稅與地價稅比照自用住宅稅率。"}
            </li>
          </ul>

        <h2 className="text-2xl font-bold mt-8 mb-3">
          {isEnglish
            ? "💰 Subsidy Amount Table (Northern Taiwan / Central-Southern / Offshore Islands)"
            : "💰 補貼金額表（北北桃／中南部／離島）"}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 text-left mb-6">
            <thead className="bg-blue-50">
              <tr>
                <th className="border px-3 py-2">
                  {isEnglish ? "Region" : "地區"}
                </th>
                <th className="border px-3 py-2">
                  {isEnglish
                    ? "Monthly Subsidy Limit per Household (NTD)"
                    : "補貼每戶每月上限（新臺幣）"}
                </th>
                <th className="border px-3 py-2">
                  {isEnglish ? "Notes" : "備註"}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-3 py-2">
                  {isEnglish
                    ? "Northern Taiwan (Taipei, New Taipei, Taoyuan)"
                    : "北北桃（台北市、新北市、桃園市）"}
                </td>
                <td className="border px-3 py-2">
                  {isEnglish ? "Up to 8,000 NTD" : "最高 8,000 元"}
                </td>
                <td className="border px-3 py-2">
                  {isEnglish ? "First-tier eligibility" : "第一級條件者"}
                </td>
              </tr>
              <tr>
                <td className="border px-3 py-2">
                  {isEnglish
                    ? "Central-Southern (Taichung, Tainan, Kaohsiung, etc.)"
                    : "中南部（台中、台南、高雄等）"}
                </td>
                <td className="border px-3 py-2">
                  {isEnglish ? "5,000～3,000 NTD" : "5,000～3,000 元"}
                </td>
                <td className="border px-3 py-2">
                  {isEnglish
                    ? "Based on county/city tier system"
                    : "依縣市分級制度"}
                </td>
              </tr>
              <tr>
                <td className="border px-3 py-2">
                  {isEnglish ? "Offshore Islands" : "離島地區"}
                </td>
                <td className="border px-3 py-2">
                  {isEnglish
                    ? "Same as main island or additional subsidy"
                    : "比照本島或加碼補助"}
                </td>
                <td className="border px-3 py-2">
                  {isEnglish
                    ? "Subject to local government announcements"
                    : "依地方政府公告為準"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-2xl font-bold mt-8 mb-3">
          {isEnglish
            ? "📎 Download Official Application Guide (PDF)"
            : "📎 下載官方申請指南（PDF）"}
        </h2>
        <p className="text-gray-700 mb-6">
          {isEnglish ? (
            <>
              The government has launched the "30 Billion Central Government Expanded Rental
              Subsidy Project". The official PDF application guide is currently being updated.
              <br />
              File links are temporarily under adjustment. Please visit the{" "}
              <a
                href="https://www.cpami.gov.tw/chinese/index.php?option=com_content&view=article&id=22184"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline mx-1"
              >
                Ministry of the Interior Construction and Planning Agency official announcement page
              </a>
              to view the latest application instructions and download documents.
              <br />
              <span className="text-gray-500 text-sm">
                (If PDF file downloads are restored in the future, this site will update with the
                latest available version)
              </span>
            </>
          ) : (
            <>
              政府推出「300 億元中央擴大租金補貼專案」，目前官方 PDF 申請指南正在更新中。<br />
              檔案鏈結暫時調整中，請至
              <a
                href="https://www.cpami.gov.tw/chinese/index.php?option=com_content&view=article&id=22184"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline mx-1"
              >
                內政部營建署官方公告頁
              </a>
              查閱最新申請說明與文件下載。<br />
              <span className="text-gray-500 text-sm">
                （若日後恢復 PDF 檔案下載，本站將同步更新最新可用版本）
              </span>
            </>
          )}
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-3">
          {isEnglish ? "🌐 Online Application Portal Links" : "🌐 線上申請入口連結"}
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            {isEnglish
              ? "Ministry of the Interior Construction and Planning Agency '30 Billion Central Government Expanded Rental Subsidy Project' official website:"
              : "內政部營建署「300 億元中央擴大租金補貼專案」官方網站："}
            <a
              href="https://has.nlma.gov.tw/house300e/front/applyAInfo"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline ml-1"
            >
              has.nlma.gov.tw
            </a>
          </li>
          <li>
            {isEnglish ? "Inquiry and application form download:" : "查詢與申請表下載："}
            <a
              href="https://pip.moi.gov.tw/V3/B/SCRB0102.aspx"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline ml-1"
            >
              pip.moi.gov.tw
            </a>
          </li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-3">
          {isEnglish
            ? "📊 Application and Payment Timeline Example"
            : "📊 申請與撥款時程範例"}
        </h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>
            {isEnglish
              ? "Application period: From 9:00 AM on January 1, 2025 to 5:00 PM on December 31, 2025."
              : "申請開放時間：114 年 1 月 1 日上午 9 點起至 12 月 31 日下午 5 點止。"}
          </li>
          <li>
            {isEnglish
              ? "Existing households (previously approved) will be automatically imported by the system, no need to reapply."
              : "舊戶（前年度核定戶）系統自動帶入，無須重新申請。"}
          </li>
          <li>
            {isEnglish
              ? "New application review takes approximately 2-4 months. After approval, subsidies will be deposited directly into accounts."
              : "新戶申請審查約需 2～4 個月，核准後補助將直接入帳。"}
          </li>
          <li>
            {isEnglish
              ? "Supplement requests will be sent via SMS or email. Please ensure your personal information is correct."
              : "補件通知將透過簡訊或電子郵件寄送，請留意個人資料正確。"}
          </li>
        </ol>

        <svg viewBox="0 0 500 140" className="mx-auto my-8 w-full max-w-lg">
          <rect x="10" y="20" width="100" height="40" rx="10" fill="#FEE2E2" />
          <text x="25" y="45" fontSize="14">
            {isEnglish ? "Prepare Documents" : "準備文件"}
          </text>
          <rect x="140" y="20" width="100" height="40" rx="10" fill="#BFDBFE" />
          <text x="155" y="45" fontSize="14">
            {isEnglish ? "Online Application" : "線上申請"}
          </text>
          <rect x="270" y="20" width="100" height="40" rx="10" fill="#FDE68A" />
          <text x="285" y="45" fontSize="14">
            {isEnglish ? "System Review" : "系統審核"}
          </text>
          <rect x="400" y="20" width="80" height="40" rx="10" fill="#BBF7D0" />
          <text x="415" y="45" fontSize="14">
            {isEnglish ? "Subsidy Deposited" : "補助入帳"}
          </text>
          <line
            x1="110"
            y1="40"
            x2="140"
            y2="40"
            stroke="#3B82F6"
            strokeWidth="3"
            markerEnd="url(#arrow)"
          />
          <line
            x1="240"
            y1="40"
            x2="270"
            y2="40"
            stroke="#3B82F6"
            strokeWidth="3"
            markerEnd="url(#arrow)"
          />
          <line
            x1="370"
            y1="40"
            x2="400"
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
            ? "This article is for reference only. Actual subsidy amounts, eligibility, and application procedures are subject to the latest announcements from the Ministry of the Interior and local governments."
            : "本文僅供摘要參考，實際補助金額、資格與申請流程以 內政部 及 地方政府 最新公告為準。"}
        </div>
      </section>

      <ShareButtons title={isEnglish ? "2025 Rental Subsidy New System | 30 Billion Central Government Expanded Rental Subsidy Project" : "2025 租屋補助新制｜300 億中央擴大租金補貼專案"} />

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


import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

export default function SeniorTransportAid2025() {
  const { i18n } = useTranslation();
  const isEnglish = !i18n.language.startsWith("zh");

  return (
    <>
      <Helmet>
        <title>
          {isEnglish
            ? "🧓 2025 Senior Transportation Subsidy & Senior Card Guide | RxV"
            : "🧓 2025 銀髮族交通補助與敬老卡懶人包｜RxV"}
        </title>
      </Helmet>
      <div className="max-w-3xl mx-auto py-10 px-6 bg-gradient-to-b from-blue-50 to-white rounded-2xl shadow-sm text-lg">
        <h1 className="text-2xl font-bold mb-4">
          {isEnglish
            ? "🧓 2025 Senior Transportation Subsidy & Senior Card Guide"
            : "🧓 2025 銀髮族交通補助與敬老卡懶人包"}
        </h1>
        <p className="text-gray-700 mb-6 leading-relaxed">
          {isEnglish
            ? "To help elderly and disabled individuals travel more conveniently, local governments continue to promote 'Senior Cards' and 'Transportation Subsidy' programs. Starting from 2025, many areas have simultaneously adjusted subsidy amounts and coverage areas."
            : "為協助高齡長者與身心障礙者更便利外出，各縣市政府持續推動「敬老卡」與「交通補助」措施，2025 年起多地同步調整補助額度與搭乘範圍。"}
        </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          {isEnglish ? "📍 Eligibility and Requirements" : "📍 補助對象與條件"}
        </h2>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>
            {isEnglish
              ? "Seniors aged 65 and above."
              : "年滿 65 歲以上之長者。"}
          </li>
          <li>
            {isEnglish
              ? "Individuals with disability certificates or proof."
              : "領有身心障礙手冊或證明者。"}
          </li>
          <li>
            {isEnglish
              ? "Must be registered in the local county/city and hold a Senior Card or Love Card."
              : "須設籍於當地縣市並持有敬老卡或愛心卡。"}
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          {isEnglish ? "💰 Subsidy Content and Amounts" : "💰 補助內容與金額"}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse bg-white shadow-sm rounded-lg min-w-[500px]">
            <thead className="bg-blue-100">
              <tr>
                <th className="p-2 border">
                  {isEnglish ? "Region" : "地區"}
                </th>
                <th className="p-2 border">
                  {isEnglish ? "Subsidy Amount" : "補助金額"}
                </th>
                <th className="p-2 border">
                  {isEnglish ? "Coverage" : "使用範圍"}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border">
                  {isEnglish ? "Taipei City" : "台北市"}
                </td>
                <td className="p-2 border">
                  {isEnglish ? "480 NTD/month" : "每月 480 元"}
                </td>
                <td className="p-2 border">
                  {isEnglish
                    ? "Buses, MRT, taxis, shared transportation"
                    : "公車、捷運、計程車、共享交通"}
                </td>
              </tr>
              <tr>
                <td className="p-2 border">
                  {isEnglish ? "New Taipei City" : "新北市"}
                </td>
                <td className="p-2 border">
                  {isEnglish ? "480 NTD/month" : "每月 480 元"}
                </td>
                <td className="p-2 border">
                  {isEnglish
                    ? "Buses, MRT, TRA, partner taxis"
                    : "公車、捷運、台鐵、合作計程車"}
                </td>
              </tr>
              <tr>
                <td className="p-2 border">
                  {isEnglish ? "Taichung City" : "台中市"}
                </td>
                <td className="p-2 border">
                  {isEnglish ? "300 NTD/month" : "每月 300 元"}
                </td>
                <td className="p-2 border">
                  {isEnglish
                    ? "City buses, senior transportation services"
                    : "市區公車、長青接送服務"}
                </td>
              </tr>
              <tr>
                <td className="p-2 border">
                  {isEnglish ? "Kaohsiung City" : "高雄市"}
                </td>
                <td className="p-2 border">
                  {isEnglish ? "400 NTD/month" : "每月 400 元"}
                </td>
                <td className="p-2 border">
                  {isEnglish ? "MRT, buses, taxis" : "捷運、公車、計程車"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10 text-center">
        <h2 className="text-xl font-semibold mb-3">
          {isEnglish ? "🚍 Application and Usage Process" : "🚍 申請與使用流程"}
        </h2>
        <div className="flex justify-center w-full overflow-x-auto">
          <svg
            viewBox="0 0 500 80"
            xmlns="http://www.w3.org/2000/svg"
            className="max-w-full h-auto"
          >
            <rect x="10" y="20" width="100" height="40" rx="8" fill="#F9C74F" />
            <rect x="130" y="20" width="100" height="40" rx="8" fill="#90BE6D" />
            <rect x="250" y="20" width="100" height="40" rx="8" fill="#43AA8B" />
            <rect x="370" y="20" width="100" height="40" rx="8" fill="#577590" />
            <text x="25" y="45" fontSize="13" fill="white">
              {isEnglish ? "Apply for Card" : "申請敬老卡"}
            </text>
            <text x="150" y="45" fontSize="13" fill="white">
              {isEnglish ? "Activate Card" : "領卡啟用"}
            </text>
            <text x="270" y="45" fontSize="13" fill="white">
              {isEnglish ? "Load Subsidy" : "儲值補助"}
            </text>
            <text x="390" y="45" fontSize="13" fill="white">
              {isEnglish ? "Start Using" : "開始使用"}
            </text>
          </svg>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          {isEnglish ? "📎 Official Announcements and Application Guide" : "📎 官方公告與申請指南"}
        </h2>
        <p className="text-gray-700 mb-2">
          {isEnglish
            ? "Official announcement page (PDF file links temporarily under adjustment)"
            : "官方公告頁面（PDF 檔案鏈結暫調整中）"}
        </p>
        <p className="text-gray-600">
          {isEnglish
            ? "Local governments are continuously updating detailed subsidy information and procedures. Please visit the Transportation Bureau or Social Affairs Bureau for the latest announcements."
            : "各地政府陸續更新詳細補助與操作流程，可前往交通局或社會局查詢最新公告。"}
        </p>
      </section>

      <div className="text-center mt-8">
        <Link
          to="/aids"
          className="bg-blue-600 hover:bg-blue-700 !text-white font-semibold py-2 px-6 rounded-full inline-block transition"
        >
          {isEnglish ? "← Back to Subsidy Package" : "← 回到補助懶人包"}
        </Link>
      </div>
    </div>
    </>
  );
}


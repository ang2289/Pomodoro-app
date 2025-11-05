import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import FAQ from '@/components/FAQ';
import ShareButtons from '@/components/ShareButtons';

export default function AntiFraud2025() {
  const { i18n } = useTranslation();
  const isEnglish = !i18n.language.startsWith("zh");

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 leading-8">
      <article className="bg-white p-6 md:p-8 rounded-xl shadow-sm border text-lg">

        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          {isEnglish
            ? "⚠️ NT$10,000 Universal Subsidy Alert | Verify Official Website, Beware of Scams!"
            : "⚠️ 普發一萬元補助提醒｜認明官網、防詐騙！"}
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          {isEnglish ? "Updated: " : "更新："}{new Date().toISOString().slice(0, 10)}
        </p>

        <p>
          {isEnglish
            ? "The government has launched a \"Universal Cash Subsidy\" program. Citizens can apply or receive it through the "
            : "政府推出「全民普發現金補助」措施，民眾可透過 "}
          <strong>
            {isEnglish
              ? "official website and post office channels"
              : "官方網站與郵局管道"}
          </strong>
          {isEnglish
            ? ". However, scam messages, fake websites, and fake customer service have also increased recently. Therefore, it is essential to verify the official website and the correct collection method."
            : " 申請或領取。然而近期詐騙簡訊、假網站、假客服也同步增加，因此務必認明官方網站與正確領取方式。"}
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">
          {isEnglish
            ? "✅ Official Application Portal (Must Verify URL)"
            : "✅ 官方申請入口（務必核對網址）"}
        </h2>

        <ul className="list-disc pl-6 space-y-2">
          <li>
            {isEnglish ? "Application Official Website: " : "申請官網： "}
            <a href="https://10000.gov.tw/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              https://10000.gov.tw/
            </a>
          </li>
          <li>
            {isEnglish ? "Post Office Related Inquiries: " : "郵局相關查詢： "}
            <a href="https://www.post.gov.tw" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              {isEnglish ? "Chunghwa Post Global Information Network" : "中華郵政全球資訊網"}
            </a>
          </li>
          <li>
            {isEnglish ? "Anti-Fraud Verification Section: " : "防詐查證專區："}
            <a href="https://165.npa.gov.tw/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline ml-1">
              {isEnglish
                ? "National Police Agency - 165 Anti-Fraud Section"
                : "內政部警政署 165 反詐騙專區"}
            </a>
            {isEnglish
              ? " (Phone: "
              : " （電話："}
            <strong>{isEnglish ? "165 Anti-Fraud Hotline" : "165 反詐騙專線"}</strong>)
          </li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3">
          {isEnglish ? "🚫 Common Scam Tactics" : "🚫 常見詐騙手法"}
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            {isEnglish
              ? "Fake \"Universal NT$10,000\" messages requesting to click links and fill in information"
              : "假冒「普發一萬」簡訊要求點擊連結填資料"}
          </li>
          <li>
            {isEnglish
              ? "Fake customer service notifications claiming \"data anomalies, need to re-verify account\""
              : "假裝客服通知「資料異常，需重新驗證帳戶」"}
          </li>
          <li>
            {isEnglish
              ? "Inducing people to go to ATM to \"re-operate bank settings\""
              : "誘導民眾前往 ATM「重新操作銀行設定」"}
          </li>
        </ul>

        <div className="mt-4 p-4 border rounded-lg bg-red-50 leading-7">
          <strong className="text-red-600">
            {isEnglish ? "Please Remember: " : "請牢記："}
          </strong>
          <br/>
          <strong>
            {isEnglish ? "The government will NOT ask you to: " : "政府不會要求："}
          </strong>
          <ul className="list-disc pl-6 space-y-1 mt-1">
            <li>{isEnglish ? "Operate ATM" : "操作 ATM"}</li>
            <li>
              {isEnglish
                ? "Provide passbook, debit card, or password"
                : "提供存摺、提款卡或密碼"}
            </li>
            <li>
              {isEnglish
                ? "Download any additional APP"
                : "下載任何額外 APP"}
            </li>
          </ul>
        </div>

        <h2 className="text-xl font-bold mt-8 mb-3">
          {isEnglish
            ? "🔍 How to Distinguish Real from Fake Websites at a Glance"
            : "🔍 一看就能分辨真假網站的方法"}
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            {isEnglish
              ? "URL must end with "
              : "網址必須以 "}
            <strong>.gov.tw</strong>
            {isEnglish ? "" : " 結尾"}
          </li>
          <li>
            {isEnglish
              ? "Avoid clicking from messages or social media → Please manually enter the URL yourself"
              : "避免從簡訊或社群點擊 → 請自行手動輸入網址"}
          </li>
          <li>
            {isEnglish
              ? "If unsure → You can directly call 165 to verify"
              : "若不確定 → 可直接撥打 165 查證"}
          </li>
        </ul>

        <FAQ
          title={isEnglish ? "FAQ Q&A" : "常見問題 Q&A"}
          items={isEnglish
            ? [
                { q: "Do I need to pay fees or deposits first?", a: "No. Any request for \"wire transfer first\" is a scam." },
                { q: "I received a message link asking me to log in?", a: "Don't click. Please manually enter https://10000.gov.tw/ to access." },
                { q: "Will the government call me?", a: "They will not proactively call to request ATM operations, account information, or passwords." },
                { q: "Who can I ask if I'm unsure if it's a scam?", a: "Call the 165 anti-fraud hotline for immediate verification." }
              ]
            : [
                { q: "我需要先繳費或付保證金嗎？", a: "不用。任何要求「先匯款」皆為詐騙。" },
                { q: "我收到簡訊連結要求登入帳號？", a: "不要點。請自行手動輸入 https://10000.gov.tw/ 進入。" },
                { q: "政府會打電話通知我嗎？", a: "不會主動致電要求操作 ATM、提供帳戶或密碼。" },
                { q: "不確定是否為詐騙可以問誰？", a: "撥打 165 反詐騙專線，可立即查證。" }
              ]}
        />

        <ShareButtons title={isEnglish
          ? "⚠️ NT$10,000 Universal Subsidy Alert | Verify Official Website, Beware of Scams!"
          : "⚠️ 普發一萬元補助提醒｜認明官網、防詐騙！"} />

        <section className="mt-10 text-sm text-gray-500">
          <p>{isEnglish ? "Data Sources:" : "資料來源："}</p>
          <ul className="list-disc pl-6 space-y-1 mt-1">
            <li>
              <a className="text-blue-600 underline" href="https://1966.gov.tw" target="_blank" rel="noopener noreferrer">
                {isEnglish
                  ? "Ministry of Health and Welfare - Long-term Care Resource Integration Platform (1966)"
                  : "衛生福利部 長照資源整合平台（1966）"}
              </a>
            </li>
            <li>
              <a className="text-blue-600 underline" href="https://www.nhi.gov.tw/" target="_blank" rel="noopener noreferrer">
                {isEnglish
                  ? "NHIA Official Website"
                  : "健保署官方網站（NHIA）"}
              </a>
            </li>
            <li>
              <a className="text-blue-600 underline" href="https://www.nhi.gov.tw/Content_List.aspx?n=11623" target="_blank" rel="noopener noreferrer">
                {isEnglish
                  ? "NHIA - Public Health Data and Service Portal"
                  : "健保署 民眾健康資料與服務入口"}
              </a>
            </li>
            <li>
              <a className="text-blue-600 underline" href="https://165.npa.gov.tw/" target="_blank" rel="noopener noreferrer">
                {isEnglish
                  ? "National Police Agency - 165 Anti-Fraud Section"
                  : "內政部警政署 165 反詐騙專區"}
              </a>
            </li>
          </ul>
          <p className="italic mt-2">
            {isEnglish
              ? "This site is an information compilation platform, not a government agency. Final content is subject to official announcements."
              : "本站為資訊整理平台，非政府機關。最終內容請以官方公告為準。"}
          </p>
        </section>

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
  );
}

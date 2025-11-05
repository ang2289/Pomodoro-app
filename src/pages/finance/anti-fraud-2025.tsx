import React from "react";
import { Link } from "react-router-dom";
import FAQ from '@/components/FAQ';
import ShareButtons from '@/components/ShareButtons';

export default function AntiFraud2025() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8 leading-8">
      <article className="bg-white p-6 md:p-8 rounded-xl shadow-sm border">

        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          ⚠️ 普發一萬元補助提醒｜認明官網、防詐騙！
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          更新：{new Date().toISOString().slice(0, 10)}
        </p>

        <p>
          政府推出「全民普發現金補助」措施，民眾可透過 <strong>官方網站與郵局管道</strong> 申請或領取。
          然而近期詐騙簡訊、假網站、假客服也同步增加，因此務必認明官方網站與正確領取方式。
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">✅ 官方申請入口（務必核對網址）</h2>

        <ul className="list-disc pl-6 space-y-2">
          <li>
            申請官網：  
            <a href="https://10000.gov.tw/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              https://10000.gov.tw/
            </a>
          </li>
          <li>
            郵局相關查詢：  
            <a href="https://www.post.gov.tw" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              中華郵政全球資訊網
            </a>
          </li>
          <li>
            防詐查證專區：
            <a href="https://165.npa.gov.tw/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline ml-1">
              內政部警政署 165 反詐騙專區
            </a>
            （電話：<strong>165 反詐騙專線</strong>）
          </li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3">🚫 常見詐騙手法</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>假冒「普發一萬」簡訊要求點擊連結填資料</li>
          <li>假裝客服通知「資料異常，需重新驗證帳戶」</li>
          <li>誘導民眾前往 ATM「重新操作銀行設定」</li>
        </ul>

        <div className="mt-4 p-4 border rounded-lg bg-red-50 leading-7">
          <strong className="text-red-600">請牢記：</strong><br/>
          <strong>政府不會要求：</strong>
          <ul className="list-disc pl-6 space-y-1 mt-1">
            <li>操作 ATM</li>
            <li>提供存摺、提款卡或密碼</li>
            <li>下載任何額外 APP</li>
          </ul>
        </div>

        <h2 className="text-xl font-bold mt-8 mb-3">🔍 一看就能分辨真假網站的方法</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>網址必須以 <strong>.gov.tw</strong> 結尾</li>
          <li>避免從簡訊或社群點擊 → 請自行手動輸入網址</li>
          <li>若不確定 → 可直接撥打 165 查證</li>
        </ul>

        <FAQ
          title="常見問題 Q&A"
          items={[
            { q: "我需要先繳費或付保證金嗎？", a: "不用。任何要求「先匯款」皆為詐騙。" },
            { q: "我收到簡訊連結要求登入帳號？", a: "不要點。請自行手動輸入 https://10000.gov.tw/ 進入。" },
            { q: "政府會打電話通知我嗎？", a: "不會主動致電要求操作 ATM、提供帳戶或密碼。" },
            { q: "不確定是否為詐騙可以問誰？", a: "撥打 165 反詐騙專線，可立即查證。" }
          ]}
        />

        <ShareButtons title="⚠️ 普發一萬元補助提醒｜認明官網、防詐騙！" />

        <section className="mt-10 text-sm text-gray-500">
          <p>資料來源：</p>
          <ul className="list-disc pl-6 space-y-1 mt-1">
            <li>
              <a className="text-blue-600 underline" href="https://1966.gov.tw" target="_blank" rel="noopener noreferrer">
                衛生福利部 長照資源整合平台（1966）
              </a>
            </li>
            <li>
              <a className="text-blue-600 underline" href="https://www.nhi.gov.tw/" target="_blank" rel="noopener noreferrer">
                健保署官方網站（NHIA）
              </a>
            </li>
            <li>
              <a className="text-blue-600 underline" href="https://www.nhi.gov.tw/Content_List.aspx?n=11623" target="_blank" rel="noopener noreferrer">
                健保署 民眾健康資料與服務入口
              </a>
            </li>
            <li>
              <a className="text-blue-600 underline" href="https://165.npa.gov.tw/" target="_blank" rel="noopener noreferrer">
                內政部警政署 165 反詐騙專區
              </a>
            </li>
          </ul>
          <p className="italic mt-2">
            本站為資訊整理平台，非政府機關。最終內容請以官方公告為準。
          </p>
        </section>

        <div className="mt-10">
          <Link
            to="/finance"
            className="inline-block bg-blue-600 !text-white font-bold px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            style={{ color: '#ffffff' }}
          >
            ← 回到健康與理財專欄
          </Link>
        </div>

      </article>
    </main>
  );
}


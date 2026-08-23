import React from "react"

export default function PrivacyPolicyPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto text-gray-800 leading-relaxed">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">隱私權政策與 Cookie 政策</h1>
      </div>

      {/* Beta 測試標示 */}
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800 font-semibold mb-2">⚠️ Beta 測試中</p>
        <p className="text-yellow-700 text-sm">
          本服務目前處於 Beta 測試階段，隱私權政策可能會持續更新。如有任何疑問，歡迎透過 Email 聯絡我們。
        </p>
      </div>

      <p className="mb-3">
        本網站由 RxV 夢想創作工作室營運，重視使用者的個人資料與隱私權，並依據相關法律規定保護您的資料。當您使用本網站服務時，即表示您已閱讀、理解並同意以下條款。
      </p>

      <h2 className="text-lg font-semibold mt-4 mb-2">我們如何使用您的資料</h2>
      <p className="mb-3">
        本網站重視您的隱私。當您使用我們的服務時，我們可能會收集如電子郵件、使用紀錄等資訊，以提供更好的體驗。所有資料僅用於網站內部功能用途，不會販售或提供給第三方。您可隨時透過聯絡方式要求刪除個人資料。
      </p>

      <h2 className="text-lg font-semibold mt-4 mb-2">我們可能收集的資料類型</h2>
      <ul className="list-disc ml-6 mb-3 space-y-1">
        <li>聯絡資料（如電子郵件、暱稱）</li>
        <li>使用紀錄（例如使用時間、點擊按鈕次數）</li>
        <li>裝置資訊（如瀏覽器版本、作業系統類型）</li>
        <li>訂閱狀態與付款記錄（不包含完整付款卡號）</li>
      </ul>

      <h2 className="text-lg font-semibold mt-4 mb-2">我們可能使用的第三方服務</h2>
      <ul className="list-disc ml-6 mb-3 space-y-1">
        <li>Google AdMob（顯示廣告）</li>
        <li>PayPal（處理網頁訂閱付款）</li>
        <li>Google Analytics（分析使用情形）</li>
      </ul>
      <p className="mb-3">
        這些服務供應商可能會各自蒐集使用者資料並依其隱私政策處理。
      </p>
      <p className="mb-3">
        <strong>Google Analytics（分析網站流量）</strong>
        <br />
        本網站使用 Google Analytics 以協助分析使用者如何瀏覽與使用網站內容。Google 可能使用 Cookie 及其他技術收集匿名資料（如網頁瀏覽時間、使用裝置與地區等），這些資料僅用於統計分析與網站優化，不包含個人識別資訊。您可參閱{" "}
        <a
          href="https://policies.google.com/privacy?hl=zh-TW"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          Google 隱私權政策
        </a>{" "}
        以了解更多。
      </p>

      <h2 className="text-lg font-semibold mt-4 mb-2">Cookie 與本地儲存</h2>
      <p className="mb-3">
        Google 及其合作夥伴可能會使用 Cookie 來投放廣告，這些 Cookie 用於根據使用者的瀏覽紀錄顯示更相關的廣告。使用者可前往{" "}
        <a
          href="https://adssettings.google.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          Google 廣告設定
        </a>{" "}
        管理或停用個人化廣告。
      </p>
      <p className="mb-3">
        我們可能使用 Cookie 或瀏覽器本地儲存（如 localStorage、Dexie DB）來記錄使用者設定、登入狀態、任務內容等。這些資料僅保存在您裝置中，不會上傳伺服器。
      </p>
      <p className="mb-3">
        <strong>Analytics Cookie 使用聲明：</strong>
        <br />
        我們使用 Google Analytics 之 Cookie 以匿名方式分析網站流量。您可透過{" "}
        <a
          href="https://adssettings.google.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          Google 廣告設定
        </a>{" "}
        關閉個人化廣告或停用分析追蹤。
      </p>

      <h2 className="text-lg font-semibold mt-4 mb-2">使用者權利</h2>
      <ul className="list-disc ml-6 mb-3 space-y-1">
        <li>查閱您的個人資料</li>
        <li>要求下載備份（例如任務資料）</li>
        <li>請求刪除個人資料（例如 email 或訂閱紀錄）</li>
      </ul>

      <h2 className="text-lg font-semibold mt-4 mb-2">政策變更</h2>
      <p className="mb-3">
        我們保留隨時修改本政策之權利。若有重大變更，我們將透過 App 或網站公告。
      </p>

      <h2 className="text-lg font-semibold mt-4 mb-2">聯絡方式</h2>
      <p className="mb-3">
        如對本政策有任何疑問，請透過 Email 聯絡我們：
        <br />
        📧{" "}
        <a href="mailto:rxv0227@gmail.com" className="text-blue-600 underline">
          rxv0227@gmail.com
        </a>
      </p>

      {/* Service Description Link for Payment Gateway Review */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="mb-2 text-sm text-gray-600">
          <a 
            href="/service-description" 
            className="text-blue-600 hover:underline font-medium"
          >
            Service Description (English)
          </a>
        </p>
      </div>

      <p className="text-sm text-gray-500">更新日期：2025/11/04</p>
    </div>
  )
}



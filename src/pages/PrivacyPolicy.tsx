export default function PrivacyPolicy() {
  return (
    <div className="max-w-screen-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">隱私權政策</h1>
      
      <div className="mb-6">
        <p className="mb-4">
          本網站重視您的隱私。當您使用我們的服務時，我們可能會收集如電子郵件、使用紀錄等資訊，以提供更好的體驗。
        </p>
        <p className="mb-4">
          所有資料皆僅用於網站內部功能用途，不會販售或提供給第三方。您可隨時透過聯絡方式要求刪除個人資料。
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">我們可能收集的資料類型：</h2>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>聯絡資料（如電子郵件、暱稱）</li>
          <li>使用紀錄（例如使用時間、點擊按鈕次數）</li>
          <li>裝置資訊（如瀏覽器版本、作業系統類型）</li>
          <li>訂閱狀態與付款記錄（不包含完整付款卡號）</li>
        </ul>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">我們可能使用的第三方服務：</h2>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Google AdMob（顯示廣告）</li>
          <li>PayPal（處理網頁訂閱付款）</li>
          <li>Google Analytics（分析使用情形）</li>
        </ul>
        <p className="mt-2 text-sm text-gray-600">
          這些服務供應商可能會各自蒐集使用者資料並依其隱私政策處理。
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Cookie 與本地儲存：</h2>
        <p className="mb-2">
          我們可能使用 Cookie 或瀏覽器本地儲存（如 localStorage、Dexie DB）來記錄使用者設定、登入狀態、任務內容等。
        </p>
        <p className="text-sm text-gray-600">
          這些資料僅保存在您裝置中，不會上傳伺服器。
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">使用者權利：</h2>
        <p className="mb-3">您有權隨時：</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>查閱您的個人資料</li>
          <li>要求下載備份（例如任務資料）</li>
          <li>請求刪除個人資料（例如 email 或訂閱紀錄）</li>
        </ul>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">政策變更：</h2>
        <p className="mb-2">
          我們保留隨時修改本政策之權利。若有重大變更，我們將透過 App 或網站公告。
        </p>
      </div>
      
      <div className="border-t pt-4">
        <p className="mb-2">
          如對本政策有任何疑問，請透過以下方式聯絡我們：<br />
          📧 <a href="mailto:rxv0227@gmail.com" className="text-blue-600 underline">
            rxv0227@gmail.com
          </a>
        </p>
        
        <p className="text-sm text-gray-500 mt-4">更新日期：2025/10/28</p>
      </div>
    </div>
  );
}

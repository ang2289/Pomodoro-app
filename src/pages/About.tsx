export default function About() {
  return (
    <div className="max-w-screen-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">關於本站</h1>
      
      <div className="mb-6">
        <p className="mb-4">
          本網站為一款結合專注計時、任務管理與集氣祈願的番茄鐘應用，致力於提升使用者的生活品質與專注力。
        </p>
        <p className="mb-4">
          本網站與 App 均由 RxV 夢想創作工作室獨立開發與維運，所有功能不含 AI 模型運算，使用者所有資料皆儲存在本地裝置或經過授權之雲端儲存服務，並尊重使用者的隱私權。
        </p>
      </div>

      <div className="border-t pt-4">
        <p className="mb-4">
          如有合作建議或回饋，歡迎透過 Email 聯繫我們：
        </p>
        <p className="mb-4">
          📧 <a href="mailto:rxv0227@gmail.com" className="text-blue-600 dark:text-blue-400 underline">
            rxv0227@gmail.com
          </a>
        </p>
        
        <p className="text-sm text-gray-500 dark:text-gray-400">更新日期：2025/10/28</p>
      </div>
    </div>
  );
}

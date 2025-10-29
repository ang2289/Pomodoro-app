import React from "react"
import ModuleDropdown from '../components/ModuleDropdown'

export default function FeaturesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 頁面標題與導覽 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📋 網站功能總覽</h1>
        <ModuleDropdown />
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">🍅 番茄鐘專注計時器</h2>
        <ul className="list-disc ml-5 space-y-1 text-gray-700">
          <li>圓形計時器：視覺化倒數工作與休息時間</li>
          <li>自訂時間：可調整工作與休息時長</li>
          <li>分類管理：可自訂番茄鐘分類名稱與顏色</li>
          <li>統計與匯出：可搜尋、匯出完成紀錄（CSV 格式）</li>
          <li>通知與鎖屏保護：支援提醒通知與防止螢幕休眠</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">📿 唸經計數與祈願牆</h2>
        <ul className="list-disc ml-5 space-y-1 text-gray-700">
          <li>支援多種經文與音效（木魚聲、鈴聲）</li>
          <li>唸誦統計與祈願圖片上傳</li>
          <li>可發布願望、留言集氣、點燈支持</li>
          <li>活動牆支援分類搜尋、參與祈願、瀏覽排行</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">✅ 任務待辦清單</h2>
        <ul className="list-disc ml-5 space-y-1 text-gray-700">
          <li>任務新增／分類／狀態切換（未開始／進行中／已完成）</li>
          <li>可自訂分類與顏色、設定提醒與時間</li>
          <li>支援任務完成率統計與資料匯出</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">📊 統計與排行榜</h2>
        <ul className="list-disc ml-5 space-y-1 text-gray-700">
          <li>番茄鐘、唸經、任務的統計圖表</li>
          <li>集氣排行榜／唸經排行榜／支持數排行</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">⚙️ 系統與進階功能</h2>
        <ul className="list-disc ml-5 space-y-1 text-gray-700">
          <li>語音輸入支援（行動裝置）</li>
          <li>去廣告訂閱方案（月費 NT$49／終身方案即將推出）</li>
          <li>廣告控制與 Google AdSense／AdMob 整合</li>
          <li>支援 PWA 安裝、離線使用與資料快取</li>
          <li>跨平台支援：Web、Android（Capacitor）</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">📄 法律與安全合規</h2>
        <ul className="list-disc ml-5 space-y-1 text-gray-700">
          <li>隱私權政策、使用條款、關於我們頁面</li>
          <li>啟用 HTTPS 安全連線與用戶資料加密儲存</li>
        </ul>
      </section>
    </div>
  )
}

import React from 'react'
import { Helmet } from 'react-helmet-async'

export default function PointsPage() {
  return (
    <>
      <Helmet>
        <title>點數使用說明（綠界申請中） - Pomodoro App</title>
        <meta 
          name="description" 
          content="本網站所提供之 AI 輔助功能，採用「點數制」作為使用量顯示與系統資源管理說明機制。點數僅作為使用量顯示與功能規劃用途，非金錢或儲值金額。" 
        />
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* 提示說明區塊 */}
        <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl border border-blue-200">
          <p className="text-sm text-gray-700 leading-relaxed">
            本頁為點數制度與使用方式說明頁，僅供使用者了解服務計費方式。
            實際購買流程將於服務正式開放後提供。
          </p>
        </div>

        <h1 className="text-3xl font-bold mb-8 text-gray-900">
          點數使用說明（綠界申請中）
        </h1>

        {/* 點數制度說明 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">點數制度說明</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-gray-800 leading-relaxed mb-3">
              本網站所提供之 AI 輔助功能，採用「點數制」作為使用量顯示與系統資源管理說明機制。
            </p>
            <p className="text-gray-800 leading-relaxed mb-3">
              使用者於使用各項 AI 功能時，系統將依實際「使用者輸入文字字數」與「AI 回應文字字數」進行點數計算與顯示，僅用於協助使用者了解服務使用狀況。
            </p>
            <p className="text-gray-800 leading-relaxed font-semibold">
              點數不代表任何即時付款、即時交易或自動扣款行為。
            </p>
          </div>
        </section>

        {/* 點數計算方式 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">點數計算方式</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <p className="text-gray-700 leading-relaxed mb-3">
              每 1 個中文字或英文字 = 1 點
            </p>
            <p className="text-gray-700 leading-relaxed mb-3">
              計算範圍：包含使用者輸入內容與 AI 回應內容之總字數
            </p>
            <p className="text-gray-700 leading-relaxed">
              顯示方式：每次服務完成後顯示本次使用點數與累積狀況
            </p>
          </div>
        </section>

        {/* 使用與限制說明 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">使用與限制說明</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>點數資訊僅作為功能使用說明與資源分配展示用途</li>
              <li>不構成即時金流交易、訂閱扣款或自動續費</li>
              <li>可在未登入或未付款狀態下體驗部分功能</li>
              <li>系統會依使用狀況設定體驗上限，以維持服務品質</li>
            </ul>
          </div>
        </section>

        {/* 重要聲明 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">重要聲明（請務必閱讀）</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-5">
            <ul className="list-disc ml-6 space-y-2 text-red-800">
              <li>本服務目前不涉及任何即時付款、訂閱制或自動扣款機制</li>
              <li>點數僅作為使用量顯示與功能規劃用途，非金錢或儲值金額</li>
              <li>本頁為服務功能說明文件，非購買頁面</li>
              <li>付費流程與金流服務將於綠界審核完成後另行公告</li>
            </ul>
          </div>
        </section>

        {/* 聯絡方式 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">聯絡方式</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <p className="text-gray-700">
              Email：
              <a 
                href="mailto:rxv0227@gmail.com" 
                className="text-blue-600 hover:underline ml-2 font-medium"
              >
                rxv0227@gmail.com
              </a>
            </p>
          </div>
        </section>

        {/* 頁尾提醒 */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            本頁內容僅用於說明目前服務狀態與功能使用方式。
          </p>
        </div>
      </div>
    </>
  )
}


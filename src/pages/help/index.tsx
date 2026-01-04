// 一頁式使用說明頁
// 包含登入與試用說明、點數計算方式、匯款與補點流程、常見問題

import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { buildSEO } from '../../lib/seo'
import PrimaryButton from '@/components/ui/PrimaryButton'

const seo = buildSEO({
  title: '使用說明',
  description: '登入與試用說明、點數計算方式、匯款與補點流程、常見問題',
  url: '/help',
})

export default function HelpPage() {
  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* 標題 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              使用說明
            </h1>
            <p className="text-gray-600">
              完整的使用指南與常見問題解答
            </p>
          </div>

          {/* 區塊 1：登入與試用說明 */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">🔐</span>
              登入與試用說明
            </h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">免費試用</h3>
                <ul className="list-disc ml-5 space-y-2">
                  <li>新用戶註冊後即可獲得 <strong>10,000 點</strong>免費試用額度</li>
                  <li>試用期為 <strong>7 天</strong>，試用期內可自由使用</li>
                  <li>試用期過後，點數仍可使用，但無法再補充試用額度</li>
                  <li>試用額度與付費點數共用，使用時會優先扣除試用額度</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">登入方式</h3>
                <ul className="list-disc ml-5 space-y-2">
                  <li>支援 Email 註冊與登入</li>
                  <li>登入後即可開始使用所有功能</li>
                </ul>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <p className="text-sm text-blue-800">
                  <strong>💡 提示：</strong>未登入時無法使用 AI 功能，請先登入以開始試用。
                </p>
              </div>
            </div>
          </div>

          {/* 區塊 2：點數計算方式 */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">📊</span>
              點數計算方式
            </h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">計算原則</h3>
                <ul className="list-disc ml-5 space-y-2">
                  <li>系統會依<strong>實際輸入的文字字數</strong>計算使用額度</li>
                  <li>每次使用 AI 功能時，會即時扣除對應點數</li>
                  <li>點數不足時無法使用功能，需補充點數後才能繼續使用</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">範例說明</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>輸入 2,500 字文章進行摘要 → 扣除 <strong>2,500 點</strong></span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>輸入 300 字題目進行解題 → 扣除 <strong>300 點</strong></span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>輸入 1,000 字內容進行分析 → 扣除 <strong>1,000 點</strong></span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
                <p className="text-sm text-amber-800">
                  <strong>⚠️ 注意：</strong>點數為一次性使用額度，不限使用期限，用完為止。使用後無法退款。
                </p>
              </div>
            </div>
          </div>

          {/* 區塊 3：匯款與補點流程 */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">💳</span>
              匯款與補點流程
            </h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">方案選擇</h3>
                <ul className="list-disc ml-5 space-y-2">
                  <li><strong>NT$99 方案：</strong>100,000 點（約 30～35 次摘要）</li>
                  <li><strong>NT$199 方案：</strong>300,000 點（約 90～100 次摘要）</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">匯款步驟</h3>
                <ol className="list-decimal ml-5 space-y-2">
                  <li>在<Link to="/pricing" className="text-blue-600 hover:underline">方案頁面</Link>選擇方案</li>
                  <li>查看匯款資訊（銀行、帳號、戶名）</li>
                  <li>完成匯款後，點擊「查看點數方案 / 立即補點」按鈕</li>
                  <li>填寫匯款回報表單（Email、匯款金額、帳號後五碼）</li>
                  <li>提交回報後，我們會在 <strong>24 小時內</strong>為您補點</li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">匯款資訊</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <ul className="space-y-2 text-sm">
                    <li><strong>銀行：</strong>玉山銀行</li>
                    <li><strong>銀行代號：</strong>808</li>
                    <li><strong>分行：</strong>基隆分行</li>
                    <li><strong>帳號：</strong>0783979283619</li>
                    <li><strong>戶名：</strong>林雨晴</li>
                  </ul>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  <strong>重要：</strong>請於匯款備註填寫「註冊 Email」，以便我們快速為您補點。
                </p>
              </div>
              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                <p className="text-sm text-green-800">
                  <strong>✅ 補點完成後：</strong>您會收到 Email 通知，點數會自動加入您的帳戶。
                </p>
              </div>
            </div>
          </div>

          {/* 區塊 4：常見問題與注意事項 */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">❓</span>
              常見問題與注意事項
            </h2>
            <div className="space-y-6 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Q: 試用期過後點數會消失嗎？</h3>
                <p className="text-gray-600">
                  A: 不會。試用期過後，剩餘的試用點數仍可使用，但無法再補充試用額度。如需更多點數，請購買付費方案。
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Q: 點數有使用期限嗎？</h3>
                <p className="text-gray-600">
                  A: 沒有。點數為一次性購買，不限使用期限，用完為止。
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Q: 匯款後多久會補點？</h3>
                <p className="text-gray-600">
                  A: 我們會在收到匯款後 <strong>24 小時內</strong>為您補點，通常會更快。補點完成後會發送 Email 通知。
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Q: 可以退款嗎？</h3>
                <p className="text-gray-600">
                  A: 點數一經使用即視為服務完成，恕不退款。未使用的點數可永久保留。
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Q: 點數可以轉讓給其他帳號嗎？</h3>
                <p className="text-gray-600">
                  A: 不可以。點數與帳號綁定，無法轉讓或轉移。
                </p>
              </div>
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                <p className="text-sm text-red-800">
                  <strong>⚠️ 重要注意事項：</strong>
                </p>
                <ul className="list-disc ml-5 mt-2 space-y-1 text-sm text-red-700">
                  <li>點數使用後無法退款</li>
                  <li>請確認匯款資訊正確，避免匯款錯誤</li>
                  <li>匯款時請務必在備註填寫註冊 Email</li>
                  <li>如有問題，請聯繫客服</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 返回按鈕 */}
          <div className="text-center space-x-4">
            <Link to="/pricing">
              <PrimaryButton className="bg-blue-600 hover:bg-blue-700">
                查看方案
              </PrimaryButton>
            </Link>
            <Link to="/summary">
              <PrimaryButton className="bg-gray-200 text-gray-700 hover:bg-gray-300">
                開始使用
              </PrimaryButton>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}


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

      {/* 區塊 3：付款與補點方式（新版） */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">💳</span>
          付款與補點方式
        </h2>
        <div className="space-y-6 text-gray-700">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">點數購買與補充流程</h3>
            <p className="text-gray-600 mb-2">目前支援以下付款方式（透過綠界金流）：</p>
            <ul className="list-disc ml-5 space-y-2">
              <li><strong>信用卡付款</strong>（含 Apple Pay / Google Pay）</li>
              <li><strong>ATM 虛擬帳號轉帳</strong>（付款後自動加點）</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">補點流程說明</h3>
            <ul className="list-disc ml-5 space-y-2">
              <li>選擇你想購買的點數方案</li>
              <li>透過綠界付款（信用卡或 ATM 虛擬帳號）</li>
              <li>付款成功後，系統會自動加點並 Email 通知</li>
              <li>無需填寫表單，最快幾秒內自動完成</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">點數方案參考</h3>
            <ul className="list-disc ml-5 space-y-2">
              <li>NT$99 → 100,000 點（約 30～35 次摘要）</li>
              <li>NT$199 → 300,000 點（約 90～100 次摘要）</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">常見問題 Q&amp;A</h3>
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-gray-900">Q: 付款後多久會補點？</p>
                <p className="text-gray-600">A: 一般會在 5～10 秒內完成補點，並收到 Email 通知。</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Q: 點數有使用期限嗎？</p>
                <p className="text-gray-600">A: 沒有。點數為一次性額度，不限時間，用完為止。</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Q: 可以退款嗎？</p>
                <p className="text-gray-600">A: 點數使用後即視為完成服務，恕不退款。未用完點數可永久保留。</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Q: 點數可以轉讓嗎？</p>
                <p className="text-gray-600">A: 不可。每筆點數與帳號綁定，不可轉讓或轉移。</p>
              </div>
            </div>
          </div>

          <div className="bg-rose-50 border-l-4 border-rose-400 p-4 rounded">
            <p className="text-sm text-rose-800">
              <strong>⚠️ 提醒事項：</strong>
            </p>
            <ul className="list-disc ml-5 mt-2 space-y-1 text-sm text-rose-700">
              <li>使用前請先登入帳號</li>
              <li>點數為一次性使用，不限時間但無法退款</li>
              <li>若需大量點數購買或企業合作，請來信聯絡</li>
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


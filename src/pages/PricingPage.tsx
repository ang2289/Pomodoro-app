import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { buildSEO } from '../lib/seo'
import SectionHeader from '../components/SectionHeader'

const seo = buildSEO({
  title: '方案與價格',
  description: '選擇適合你的方案，依字數額度制計算，不限使用次數、不限單次長度。',
  url: 'https://pomodoro-app-eight-rouge.vercel.app/pricing',
  image: '/seo/pricing.png',
})

// 方案常數定義（點數制，一次購買）
const PLANS = {
  free: {
    name: '免費方案',
    quota: 10000, // 免費體驗額度（字數）
  },
  plan99: {
    name: '點數方案',
    price: 99,
    quota: 100000, // 購買字數（點數）
  },
  plan199: {
    name: '點數方案',
    price: 199,
    quota: 300000, // 購買字數（點數）
  },
};

export default function PricingPage() {
  const [lang, setLang] = useState<'zh-tw' | 'en'>('zh-tw')
  const [showNotAvailableModal, setShowNotAvailableModal] = useState(false)

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
      </Helmet>
      
      {/* 語系選擇 */}
      <div className="flex justify-end mb-4 p-4">
        <div className="flex flex-col items-end">
          <label className="text-sm text-gray-600 mb-1">
            🌐 選擇語言 / Choose Language
          </label>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as any)}
            className="w-[150px] p-2 border rounded-lg bg-white shadow-sm"
          >
            <option value="zh-tw">繁體中文</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      {/* ===== Container ===== */}
      <div className="max-w-4xl mx-auto px-4 py-8 bg-[#EFF5FF] min-h-screen">
        
        {/* 主要標題 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {lang === 'zh-tw' ? '字數點數方案（一次購買，用完為止）' : 'Character Point Plans (One-time Purchase, Use Until Exhausted)'}
          </h1>
        </div>

        {/* 試用階段說明 */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 whitespace-pre-line">
            {lang === 'zh-tw' 
              ? '⚠️ 目前為試用階段\n本服務僅開放免費試用，所有付費方案尚未開放購買與收費。\n顯示價格僅供正式上線前參考。'
              : '⚠️ Currently in Trial Phase\nThis service only offers free trial. All paid plans are not yet available for purchase.\nPrices shown are for reference only before official launch.'}
          </p>
        </div>

        {lang === 'zh-tw' ? (
          <div className="space-y-6">
            {/* 免費方案 */}
            <div className="shadow-md border rounded-2xl p-6 bg-white">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-2">🆓</span>
                <h2 className="text-xl font-bold text-gray-900">免費體驗</h2>
              </div>
              
              <div className="text-gray-700 space-y-3">
                <p className="text-2xl font-bold text-gray-900 mb-3">
                  {PLANS.free.quota.toLocaleString()} 字
                </p>
                <ul className="list-disc ml-5 space-y-2 text-sm">
                  <li>不需信用卡</li>
                  <li>不限使用期限</li>
                  <li>摘要與作業解題共用</li>
                </ul>
              </div>
            </div>

            {/* NT$99 點數方案 */}
            <div className="shadow-md border-2 border-blue-300 rounded-2xl p-6 bg-blue-50">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-2">💎</span>
                <h2 className="text-xl font-bold text-blue-900">NT${PLANS.plan99.price} 方案</h2>
              </div>
              
              <div className="text-blue-800 space-y-3">
                <p className="text-2xl font-bold text-blue-900 mb-3">
                  {PLANS.plan99.quota.toLocaleString()} 字
                </p>
                
                <ul className="list-disc ml-5 space-y-2 text-sm">
                  <li>一次購買</li>
                  <li><strong>不自動續費</strong></li>
                  <li><strong>不限使用期限</strong></li>
                </ul>

                {/* 購買按鈕 */}
                <button
                  onClick={() => setShowNotAvailableModal(true)}
                  className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  購買方案
                </button>
              </div>
            </div>

            {/* NT$199 點數方案 */}
            <div className="shadow-md border-2 border-purple-300 rounded-2xl p-6 bg-purple-50">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-2">💎</span>
                <h2 className="text-xl font-bold text-purple-900">NT${PLANS.plan199.price} 方案</h2>
              </div>
              
              <div className="text-purple-800 space-y-3">
                <p className="text-2xl font-bold text-purple-900 mb-3">
                  {PLANS.plan199.quota.toLocaleString()} 字
                </p>
                
                <ul className="list-disc ml-5 space-y-2 text-sm">
                  <li>一次購買</li>
                  <li><strong>不自動續費</strong></li>
                  <li><strong>不限使用期限</strong></li>
                </ul>

                {/* 購買按鈕 */}
                <button
                  onClick={() => setShowNotAvailableModal(true)}
                  className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  購買方案
                </button>
              </div>
            </div>

            {/* 字數如何計算 */}
            <div className="shadow-md border rounded-2xl p-6 bg-white">
              <SectionHeader title="📊 字數如何計算？" />
              
              <div className="text-gray-700 space-y-2 text-sm">
                <ul className="list-disc ml-5 space-y-2">
                  <li>系統會依照你實際送出與產生的文字數量累計</li>
                  <li>使用中可即時查看「已用字數」與「剩餘字數」</li>
                  <li>點數用完後，服務將暫停，需再次購買點數才能繼續使用</li>
                </ul>
              </div>
            </div>

            {/* 字數計算方式說明 */}
            <div className="shadow-md border rounded-2xl p-6 bg-blue-50">
              <SectionHeader title="📌 字數計算方式說明" />
              
              <div className="text-blue-800 space-y-3 text-sm">
                <p>
                  每次使用時，系統會依「實際輸入的文字字數」扣除點數。
                </p>
                
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <p className="font-medium mb-2 text-blue-900">範例說明：</p>
                  <ul className="list-disc ml-5 space-y-1 text-blue-700">
                    <li>輸入 2,500 字文章摘要 → 扣 2,500 字</li>
                    <li>解題輸入 300 字題目 → 扣 300 字</li>
                  </ul>
                </div>
                
                <p className="font-medium text-blue-900">
                  字數為一次性點數，不限使用期限，用完為止。
                </p>
              </div>
            </div>

            {/* 使用與公平性說明 */}
            <div className="shadow-md border rounded-2xl p-6 bg-gray-50">
              <SectionHeader title="🔒 使用與公平性說明" />
              
              <div className="text-gray-700 space-y-2 text-sm">
                <ul className="list-disc ml-5 space-y-2">
                  <li>為維持服務品質，系統會進行合理的資源控管</li>
                  <li>異常或非一般使用行為，可能會受到限制</li>
                  <li>所有方案之實際使用狀況，以系統顯示為準</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          /* 英文版本（簡化） */
          <div className="space-y-6">
            <div className="shadow-md border rounded-2xl p-6 bg-white">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🆓 Free Trial</h2>
              <ul className="list-disc ml-5 space-y-2 text-sm text-gray-700">
                <li>{PLANS.free.quota.toLocaleString()} characters</li>
                <li>No expiration date</li>
                <li>Shared quota for summary and homework</li>
              </ul>
            </div>

            <div className="shadow-md border rounded-2xl p-6 bg-blue-50">
              <h2 className="text-xl font-bold text-blue-900 mb-4">
                💎 Point Plan - NT${PLANS.plan99.price}
              </h2>
              <ul className="list-disc ml-5 space-y-2 text-sm text-blue-800">
                <li>{PLANS.plan99.quota.toLocaleString()} characters</li>
                <li><strong>No expiration date</strong></li>
                <li><strong>No auto-renewal</strong></li>
                <li>Purchase again when used up</li>
              </ul>
              {/* 購買按鈕 */}
              <button
                onClick={() => setShowNotAvailableModal(true)}
                className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Purchase Plan
              </button>
            </div>

            <div className="shadow-md border rounded-2xl p-6 bg-purple-50">
              <h2 className="text-xl font-bold text-purple-900 mb-4">
                💎 Point Plan - NT${PLANS.plan199.price}
              </h2>
              <ul className="list-disc ml-5 space-y-2 text-sm text-purple-800">
                <li>{PLANS.plan199.quota.toLocaleString()} characters</li>
                <li><strong>No expiration date</strong></li>
                <li><strong>No auto-renewal</strong></li>
                <li>Purchase again when used up</li>
              </ul>
              {/* 購買按鈕 */}
              <button
                onClick={() => setShowNotAvailableModal(true)}
                className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Purchase Plan
              </button>
            </div>
          </div>
        )}

        {/* 字數計算方式說明（頁面底部） */}
        {lang === 'zh-tw' && (
          <div className="mt-8 shadow-md border rounded-2xl p-6 bg-blue-50">
            <h2 className="text-xl font-bold text-blue-900 mb-4">
              📌 字數計算方式說明
            </h2>
            
            <div className="text-blue-800 space-y-3 text-sm">
              <p>
                每次使用時，系統會依「實際輸入的文字字數」扣除點數。
              </p>
              
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <p className="font-medium mb-2 text-blue-900">範例說明：</p>
                <ul className="list-disc ml-5 space-y-1 text-blue-700">
                  <li>輸入 2,500 字文章摘要 → 扣 2,500 字</li>
                  <li>解題輸入 300 字題目 → 扣 300 字</li>
                </ul>
              </div>
              
              <p className="font-medium text-blue-900">
                字數為一次性點數，不限使用期限，用完為止。
              </p>
            </div>
          </div>
        )}

        {/* 返回摘要頁面 */}
        <div className="mt-8 text-center">
          <a
            href="/summary"
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {lang === 'zh-tw' ? '返回摘要工具' : 'Back to Summary Tool'}
          </a>
        </div>
      </div>

      {/* 購買功能尚未開放 Modal */}
      {showNotAvailableModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-gray-900">
              {lang === 'zh-tw' ? '購買功能尚未開放' : 'Purchase Not Available'}
            </h3>
            <p className="text-gray-700 mb-6 whitespace-pre-line">
              {lang === 'zh-tw' 
                ? '目前僅開放免費試用 10,000 字，\n付費方案（NT$99 / NT$199）尚未開放購買。\n顯示價格僅供正式上線前參考。'
                : 'Currently only free trial of 10,000 characters is available.\nPaid plans (NT$99 / NT$199) are not yet available for purchase.\nPrices shown are for reference only before official launch.'}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowNotAvailableModal(false)}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {lang === 'zh-tw' ? '我知道了' : 'Got it'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


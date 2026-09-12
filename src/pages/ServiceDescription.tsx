// 服務說明頁 - 綠界審核用
// 此頁面專為支付閘道審核設計，語氣工具型、冷靜、無商業誘導

import { useState } from 'react'
import { Helmet } from 'react-helmet-async'

export default function ServiceDescription() {
  const [lang, setLang] = useState<'zh-tw' | 'en'>('zh-tw')

  return (
    <>
      <Helmet>
        <title>{lang === 'zh-tw' ? '服務說明' : 'Service Description'}</title>
      </Helmet>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* 語言切換 */}
        <div className="flex justify-end mb-6">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as 'zh-tw' | 'en')}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
          >
            <option value="zh-tw">繁體中文</option>
            <option value="en">English</option>
          </select>
        </div>

        {lang === 'zh-tw' ? (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">
              服務說明
            </h1>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">
                服務說明
              </h2>
              <p className="text-base text-gray-700 leading-relaxed">
                本網站提供「文章摘要工具」，協助使用者快速整理與理解長篇文字內容。
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">
                免費試用階段
              </h2>
              <p className="text-base text-gray-700 leading-relaxed">
                可直接體驗固定字數的摘要功能。
                系統會依實際輸入字數進行使用量計算，並於達到試用上限後停止提供新摘要服務。
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">
                付款與金流狀態
              </h2>
              <p className="text-base text-gray-700 leading-relaxed">
                目前金流（綠界）正在申請與審核中，本站暫不提供任何即時付款、訂閱扣款或自動續費功能。付費方案僅作為功能規劃展示，待審核完成後將另行公告並提供正式購買流程。
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">
                使用方式
              </h2>
              <p className="text-base text-gray-700 leading-relaxed">
                使用者可直接在網頁上輸入文字內容，系統將自動產生摘要結果。
                無需註冊帳號、無需提供付款資訊即可使用。
              </p>
            </section>

          </div>
        ) : (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">
              Service Description
            </h1>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Service Description
              </h2>
              <p className="text-base text-gray-700 leading-relaxed">
                This website provides an AI-powered text summarization tool designed to help users quickly understand long-form content.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Free Trial Phase
              </h2>
              <p className="text-base text-gray-700 leading-relaxed">
                The service is currently in a free trial phase.
                Users can access and use the summarization feature without registration or payment, within a fixed character limit.
                Character usage is calculated based on actual input length.
                Once the free trial limit is reached, the system will stop generating new summaries.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Payment and Transaction Status
              </h2>
              <p className="text-base text-gray-700 leading-relaxed">
                At this stage, no payment, subscription, or transaction is enabled.
                Paid plans are displayed for reference only and are not available for purchase.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Usage
              </h2>
              <p className="text-base text-gray-700 leading-relaxed">
                Users can directly input text content on the website, and the system will automatically generate summary results.
                No account registration or payment information is required to use the service.
              </p>
            </section>
          </div>
        )}

        {/* 分隔線 */}
        <div className="mt-12 pt-8 border-t border-gray-300">
          <p className="text-sm text-gray-500 italic">
            {lang === 'zh-tw' 
              ? '本頁面內容專為支付閘道審核提供，說明當前服務狀態與功能範圍。'
              : 'This page is provided for payment gateway review purposes, describing the current service status and feature scope.'}
          </p>
        </div>
      </div>
    </>
  )
}

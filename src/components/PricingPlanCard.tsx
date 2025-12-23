export default function PricingPlanCard() {
  return (
    <div className="border rounded-lg p-4 bg-white space-y-3">
      <h3 className="font-medium text-gray-800">使用方案說明</h3>

      <ul className="text-sm text-gray-700 space-y-2">
        <li>
          🆓 <strong>免費體驗</strong><br />
          提供固定字數體驗額度，僅限短期試用與功能體驗。
        </li>

        <li>
          💳 <strong>進階方案 NT$99</strong><br />
          適合一般學習與內容整理需求，提供較高使用上限。
        </li>

        <li>
          🚀 <strong>高用量方案 NT$199</strong><br />
          適合大量作業、文章整理與長文摘要使用。
        </li>
      </ul>

      <p className="text-xs text-gray-500">
        所有方案皆為一次性或期間性使用授權，非實體商品。
      </p>
    </div>
  )
}


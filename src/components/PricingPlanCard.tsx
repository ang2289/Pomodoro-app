export default function PricingPlanCard() {
  return (
    <div className="border rounded-lg p-4 bg-white space-y-3">
      <h3 className="font-medium text-gray-800">使用方案說明</h3>

      <ul className="space-y-3 text-sm text-gray-700">
        <li>
          🆓 <strong>免費體驗</strong><br />
          提供固定字數體驗額度（10,000 點），僅限短期試用與功能體驗。
        </li>

        <li>
          💳 <strong>進階方案 NT$99</strong><br />
          提供 <strong>100,000 點</strong>，適合一般文章整理與日常使用。
        </li>

        <li>
          🚀 <strong>高用量方案 NT$199</strong><br />
          提供 <strong>300,000 點</strong>，適合大量產出與長文內容整理。
        </li>
      </ul>

      <p className="text-xs text-gray-400 mt-2">
        點數會依 AI 實際輸入與輸出字數扣除。
      </p>
    </div>
  )
}


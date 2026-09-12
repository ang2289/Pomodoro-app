import React from 'react'

interface HighIntentItem {
  question: string
  answer: string
}

interface HighIntentSectionProps {
  data: HighIntentItem[]
  lang?: 'zh-tw' | 'en'
}

const HighIntentSection: React.FC<HighIntentSectionProps> = ({ data, lang = 'zh-tw' }) => {
  // ⚠️ 確保 UI 區塊一定顯示，即使資料為空陣列也要顯示
  // 不因長度為 0 而整塊隱藏
  // 如果 data 不是陣列，設為空陣列以確保區塊顯示
  const safeData = Array.isArray(data) ? data : []

  const t = {
    'zh-tw': {
      title: '第三組：高意圖問題（諮詢 / 行動建議）',
      subtitle: '適合用於諮詢、下一步行動或專業協助判斷',
      description: '此區塊提供 AI 對摘要內容的進一步理解與行動方向建議',
      emptyMessage: '此內容將在摘要完成後顯示',
      disclaimer: '本內容為 AI 依據輸入內容所產生之延伸建議，僅供參考，不構成法律、醫療或專業意見。如需正式協助，請諮詢專業人士。',
    },
    en: {
      title: 'High-Intent Questions (Consultation / Action Recommendations)',
      subtitle: 'Suitable for consultation, next steps, or professional assistance',
      description: 'This section provides AI\'s deeper understanding and action recommendations based on the summary content',
      emptyMessage: 'This content will be displayed after summary is completed',
      disclaimer: 'This content is AI-generated extension suggestions based on input content, for reference only, and does not constitute legal, medical, or professional advice. For formal assistance, please consult a professional.',
    },
  }[lang]

  return (
    <div className="mt-6 shadow-lg border-2 border-indigo-100 rounded-2xl p-6 bg-gradient-to-br from-indigo-50 to-purple-50 transition">
      <h3 className="text-xl font-bold text-indigo-900 mb-2">
        {t.title}
      </h3>
      <p className="text-xs text-indigo-600 mb-3 font-medium">
        {t.subtitle}
      </p>
      <p className="text-sm text-gray-700 mb-6 leading-relaxed bg-white/60 px-3 py-2 rounded-lg border border-indigo-100">
        {t.description}
      </p>
      
      {/* 顯示邏輯：若 highIntentContent 陣列存在且長度 > 0，使用 map() 逐筆顯示 */}
      {safeData.length > 0 ? (
        <div className="space-y-5">
          {safeData.map((item, index) => (
            <div
              key={index}
              className="border-2 border-indigo-200 rounded-xl overflow-hidden transition-all hover:border-indigo-400 hover:shadow-md bg-white shadow-sm"
            >
              {/* question 作為標題 */}
              <div className="px-5 py-4 bg-gradient-to-r from-indigo-100 to-purple-100 border-b-2 border-indigo-200">
                <div className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold text-lg mt-0.5">Q{index + 1}</span>
                  <p className="font-semibold text-base text-indigo-900 leading-snug flex-1">
                    {item.question}
                  </p>
                </div>
              </div>
              {/* answer 作為內容段落 */}
              <div className="px-5 py-5 bg-white">
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-800 leading-7 text-[15px] whitespace-pre-wrap font-normal">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* 若 highIntentContent 為空，顯示提示文字「此內容將在摘要完成後顯示」 */
        <div className="px-5 py-8 bg-white/80 rounded-xl border-2 border-indigo-200">
          <p className="text-sm text-gray-600 text-center font-medium">
            {t.emptyMessage}
          </p>
        </div>
      )}
      
      {/* CTA 區塊（預留） */}
      {/* TODO: 未來可接律師 / 諮詢 / 行業合作 */}
      {/* 目前僅顯示文字，不導向任何外部連結，不包含銷售或表單 */}
      {/* ⚠️ 第三組目前不需要任何按鈕、不需要連結、不需要跳轉頁面 */}
      {/* 僅為內容展示用途，不影響既有扣點邏輯 */}
      {safeData.length > 0 && (
        <div className="mt-6 pt-5 border-t-2 border-indigo-200">
          <p className="text-sm text-gray-600 text-center font-medium">
            {lang === 'zh-tw' 
              ? '如果你需要進一步的專業協助，可參考相關專區'
              : 'If you need further professional assistance, please refer to the relevant section'}
          </p>
        </div>
      )}
      
      {/* 固定小字提示（免責聲明） */}
      {/* ⚠️ 此提示為靜態文字，不影響任何功能 */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-[10px] text-gray-500 text-center leading-relaxed">
          {t.disclaimer}
        </p>
      </div>
    </div>
  )
}

export default HighIntentSection


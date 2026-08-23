import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPlanLimit, formatPlanLabel, calcRemaining, type PlanId } from '../lib/usagePlans'

interface UsageMeterProps {
  /** 當前輸入的文字長度（即時計算） */
  currentInput: number
  /** 已使用字數（可選，用於舊版相容） */
  usedChars?: number | null
  /** 總額度限制（可選，用於舊版相容） */
  limitChars?: number | null
  /** 剩餘點數（點數制核心） */
  remainingChars?: number | null
  /** 方案 ID（用於顯示方案名稱） */
  planId?: PlanId
  /** 語言設定 */
  lang?: 'zh-tw' | 'en'
  /** 是否顯示字數不足提示視窗 */
  showInsufficientModal?: boolean
  /** 字數不足提示視窗的關閉回調 */
  onCloseModal?: () => void
}

export default function UsageMeter({
  currentInput,
  usedChars,
  limitChars,
  remainingChars: propRemainingChars,
  planId = 'free',
  lang = 'zh-tw',
  showInsufficientModal = false,
  onCloseModal,
}: UsageMeterProps) {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)

  // 計算剩餘字數（優先使用 propRemainingChars，否則從 usedChars/limitChars 計算）
  const remainingChars = propRemainingChars !== undefined && propRemainingChars !== null
    ? propRemainingChars
    : (usedChars !== null && limitChars !== null 
        ? calcRemaining(usedChars, limitChars)
        : null)

  // 同步外部 modal 狀態
  useEffect(() => {
    if (showInsufficientModal && remainingChars !== null && currentInput > remainingChars) {
      setShowModal(true)
    }
  }, [showInsufficientModal, remainingChars, currentInput])

  // 檢查是否需要顯示字數不足警告
  const isInsufficient = remainingChars !== null && currentInput > remainingChars

  const handleCloseModal = () => {
    setShowModal(false)
    onCloseModal?.()
  }

  const handlePurchase = () => {
    setShowModal(false)
    onCloseModal?.()
    navigate('/pricing')
  }

  // 如果沒有剩餘點數資料，不顯示（或顯示載入中）
  if (remainingChars === null) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-center text-sm text-gray-500">
        {lang === 'zh-tw' ? '使用額度讀取中…' : 'Loading usage quota...'}
      </div>
    )
  }

  return (
    <>
      {/* 用量顯示區塊 */}
      <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 space-y-2">
        <div className="text-sm space-y-2">
          {/* 本次輸入字數（即時） */}
          <p className="text-gray-700">
            {lang === 'zh-tw'
              ? `本次輸入字數：${currentInput.toLocaleString()} 字`
              : `Current input: ${currentInput.toLocaleString()} characters`}
          </p>

          {/* 剩餘點數（主要顯示） */}
          <p className="text-gray-800 font-semibold text-lg">
            {lang === 'zh-tw'
              ? `目前可用字數：${remainingChars.toLocaleString()} 字`
              : `Available Characters: ${remainingChars.toLocaleString()} characters`}
          </p>
        </div>

        {/* 方案名稱 */}
        <div className="text-xs text-gray-600 pt-2 border-t border-gray-200">
          <p>
            {lang === 'zh-tw' ? '目前方案：' : 'Current plan: '}
            <span className="font-medium">{formatPlanLabel(planId, lang)}</span>
          </p>
        </div>

        {/* 免責聲明 */}
        <div className="text-[10px] text-gray-400 pt-1">
          <p>
            {lang === 'zh-tw' 
              ? '※ 實際扣除字數以系統計算為準'
              : '※ Actual deduction is based on system calculation'}
          </p>
        </div>

        {/* 字數不足警告 */}
        {isInsufficient && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            {lang === 'zh-tw'
              ? `⚠️ 本次輸入需要 ${currentInput.toLocaleString()} 字，但僅剩餘 ${remainingChars!.toLocaleString()} 字`
              : `⚠️ Input requires ${currentInput.toLocaleString()} characters, but only ${remainingChars!.toLocaleString()} remaining`}
          </div>
        )}

        {/* 提示文案 */}
        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-600 leading-relaxed">
            {lang === 'zh-tw'
              ? '本服務採字數額度制，用完提示升級，不會產生額外費用'
              : 'This service uses character quota system. When exhausted, upgrade will be prompted with no additional charges'}
          </p>
        </div>
      </div>

      {/* 字數不足提示視窗 */}
      {showModal && remainingChars !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {lang === 'zh-tw' ? '可用字數不足' : 'Insufficient Quota'}
            </h3>
            <p className="text-gray-700 mb-4 whitespace-pre-line">
              {lang === 'zh-tw'
                ? `你目前剩餘 ${remainingChars.toLocaleString()} 字，本次需要 ${currentInput.toLocaleString()} 字\n請前往購買使用方案後再使用`
                : `You currently have ${remainingChars.toLocaleString()} characters remaining, but need ${currentInput.toLocaleString()} characters.\nPlease purchase a usage plan before using.`}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-50 transition"
              >
                {lang === 'zh-tw' ? '取消' : 'Cancel'}
              </button>
              <button
                onClick={handlePurchase}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md font-medium"
              >
                {lang === 'zh-tw' ? '前往購買字數' : 'Purchase Points'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


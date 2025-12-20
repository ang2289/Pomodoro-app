/**
 * 後端 AI 模組點數計算工具
 * 
 * 此檔案作為所有後端 API 的點數計算權威來源，
 * 統一計算 inputLength、outputLength、totalUsedPoints。
 * 
 * 規則：totalUsedPoints = inputLength + outputLength（1 字 = 1 點）
 */

/**
 * 計算 AI 模組點數使用量
 * 
 * 此函數統一所有後端 API 的點數計算邏輯，確保計算方式一致。
 * 
 * @param inputText - 使用者輸入文字（必須是 string 類型）
 * @param outputText - AI 輸出文字（必須是 string 類型，可能為空字串）
 * @returns 點數計算結果，包含 inputLength、outputLength、totalUsedPoints
 * 
 * @example
 * const result = calculateAICredits("這是問題", "這是回答")
 * // 回傳: { inputLength: 4, outputLength: 4, totalUsedPoints: 8 }
 * 
 * @example
 * const result = calculateAICredits("很長的問題...", "")
 * // 回傳: { inputLength: 6, outputLength: 0, totalUsedPoints: 6 }
 */
export function calculateAICredits(
  inputText: string,
  outputText: string
): {
  inputLength: number;
  outputLength: number;
  totalUsedPoints: number;
} {
  // 確保類型安全（防呆處理）
  const safeInput = typeof inputText === 'string' ? inputText : ''
  const safeOutput = typeof outputText === 'string' ? outputText : ''
  
  // 計算字數（1 字 = 1 點）
  const inputLength = safeInput.length
  const outputLength = safeOutput.length
  const totalUsedPoints = inputLength + outputLength
  
  return {
    inputLength,
    outputLength,
    totalUsedPoints,
  }
}



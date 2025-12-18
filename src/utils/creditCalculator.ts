/**
 * 點數計算工具
 * 用於解析後端 API 回應中的實際扣點數值
 */

/**
 * 從 API 回應中解析實際扣點數
 * 
 * @param apiResponse - API 回應物件
 * @returns 實際扣點數值，若無法解析則回傳 0
 * 
 * @example
 * const response = { totalUsedPoints: 1200, inputLength: 1000, outputLength: 200 }
 * const points = applyCreditFromApiResponse(response) // 回傳 1200
 * 
 * @example
 * const response = { usedChars: 500 }
 * const points = applyCreditFromApiResponse(response) // 回傳 500
 * 
 * @example
 * const response = {}
 * const points = applyCreditFromApiResponse(response) // 回傳 0
 */
export function applyCreditFromApiResponse(apiResponse: any): number {
  // 優先使用 totalUsedPoints（後端計算的總扣點數）
  if (apiResponse?.totalUsedPoints !== undefined && apiResponse.totalUsedPoints !== null) {
    return Number(apiResponse.totalUsedPoints)
  }

  // 依序嘗試其他可能的欄位
  if (apiResponse?.usedChars !== undefined && apiResponse.usedChars !== null) {
    return Number(apiResponse.usedChars)
  }

  if (apiResponse?.cost !== undefined && apiResponse.cost !== null) {
    return Number(apiResponse.cost)
  }

  if (apiResponse?.deducted !== undefined && apiResponse.deducted !== null) {
    return Number(apiResponse.deducted)
  }

  // 若以上皆不存在，回傳 0
  return 0
}


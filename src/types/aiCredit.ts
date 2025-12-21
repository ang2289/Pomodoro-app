/**
 * AI 模組扣點結果型別
 * 
 * 所有 AI API（摘要工具、作業解題等）在成功回應時，
 * 必須包含此介面定義的欄位，以確保扣點邏輯的一致性。
 * 
 * @example
 * const response: AICreditResult = {
 *   inputLength: 1000,
 *   outputLength: 200,
 *   totalUsedPoints: 1200
 * }
 */
export interface AICreditResult {
  /** 使用者輸入字數（1 字 = 1 點） */
  inputLength: number;
  
  /** AI 回答/輸出字數（1 字 = 1 點） */
  outputLength: number;
  
  /** 總使用點數（必須等於 inputLength + outputLength） */
  totalUsedPoints: number;
}








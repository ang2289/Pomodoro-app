# AI 模組扣點標準流程

## 📋 概述

本文檔定義了所有 AI 功能模組（摘要工具、作業解題等）的扣點標準流程，確保扣點邏輯的一致性與準確性。

---

## 🔧 後端 API 規範

### 必須回傳的欄位

後端 API 在成功回應時，**必須**包含以下欄位：

```typescript
{
  inputLength: number,      // 使用者輸入字數
  outputLength: number,    // AI 回答/輸出字數
  totalUsedPoints: number, // 總使用點數（inputLength + outputLength）
  // ... 其他業務欄位
}
```

### 欄位說明

- **`inputLength`**: 使用者輸入的文字字數（1 字 = 1 點）
- **`outputLength`**: AI 產生的回答/摘要字數（1 字 = 1 點）
- **`totalUsedPoints`**: 本次請求的總扣點數，應等於 `inputLength + outputLength`

### 範例回應

```json
{
  "success": true,
  "result": "AI 回答內容...",
  "inputLength": 1000,
  "outputLength": 200,
  "totalUsedPoints": 1200
}
```

---

## 💻 前端實作規範

### 標準扣點流程

所有 AI 模組必須遵循以下統一流程：

```typescript
// 1. 匯入工具函數
import { applyCreditFromApiResponse } from '@/utils/creditCalculator'
import { updateUsedCharsAfterSuccess } from '@/components/CreditStatusBar'

// 2. API 成功後解析扣點數
const usedPoints = applyCreditFromApiResponse(apiResponse)

// 3. 執行扣點
updateUsedCharsAfterSuccess(usedPoints)
```

### 完整範例

```typescript
// API 呼叫成功後
if (data.result) {
  // ✅ 使用工具函數解析後端實際扣點數
  const usedPoints = applyCreditFromApiResponse(data)
  
  // ✅ 記錄點數明細（僅用於顯示）
  if (data.inputLength !== undefined && data.outputLength !== undefined) {
    setLastUsedPoints({
      inputLength: data.inputLength,
      outputLength: data.outputLength,
      totalUsedPoints: usedPoints, // 使用解析後的 usedPoints
    })
  } else {
    // API 未回傳明細時，不顯示點數明細
    setLastUsedPoints(null)
  }
  
  // ✅ 執行扣點（使用後端實際回傳的點數）
  updateUsedCharsAfterSuccess(usedPoints)
}
```

---

## 🚫 禁止事項

### ❌ 禁止前端自行估算扣點

以下做法**嚴格禁止**：

```typescript
// ❌ 錯誤：自行計算輸入字數
const usedPoints = input.length
updateUsedCharsAfterSuccess(usedPoints)

// ❌ 錯誤：自行組合 input + output
const usedPoints = input.length + output.length
updateUsedCharsAfterSuccess(usedPoints)

// ❌ 錯誤：使用硬寫的數值
updateUsedCharsAfterSuccess(1000)

// ❌ 錯誤：使用複雜的 fallback 鏈
const usedPoints = data.totalUsedPoints ?? data.cost ?? data.deducted ?? input.length
updateUsedCharsAfterSuccess(usedPoints)
```

### ✅ 正確做法

```typescript
// ✅ 正確：使用工具函數解析後端回傳的數值
const usedPoints = applyCreditFromApiResponse(data)
updateUsedCharsAfterSuccess(usedPoints)
```

---

## 🔍 工具函數說明

### `applyCreditFromApiResponse(apiResponse)`

**位置**: `src/utils/creditCalculator.ts`

**功能**: 從 API 回應中解析實際扣點數

**優先順序**:
1. `apiResponse.totalUsedPoints`（優先）
2. `apiResponse.usedChars`
3. `apiResponse.cost`
4. `apiResponse.deducted`
5. `0`（若以上皆不存在）

**使用方式**:
```typescript
import { applyCreditFromApiResponse } from '@/utils/creditCalculator'

const usedPoints = applyCreditFromApiResponse(apiResponse)
```

### `updateUsedCharsAfterSuccess(usedPoints)`

**位置**: `src/components/CreditStatusBar.tsx`

**功能**: 更新前端點數狀態（localStorage 或登入狀態）

**參數**: `usedPoints: number` - 後端實際回傳的扣點數

**使用方式**:
```typescript
import { updateUsedCharsAfterSuccess } from '@/components/CreditStatusBar'

updateUsedCharsAfterSuccess(usedPoints)
```

---

## 📝 實作檢查清單

開發新 AI 模組或修改現有模組時，請確認：

- [ ] 後端 API 回傳 `inputLength`、`outputLength`、`totalUsedPoints`
- [ ] 前端使用 `applyCreditFromApiResponse(data)` 解析扣點數
- [ ] 前端使用 `updateUsedCharsAfterSuccess(usedPoints)` 執行扣點
- [ ] 沒有自行計算或硬寫扣點數值
- [ ] 點數明細顯示僅使用 API 回傳的 `inputLength` 和 `outputLength`
- [ ] 若 API 未回傳明細，不顯示點數明細區塊（設為 `null`）

---

## 🔄 向後相容

### 舊版 API 支援

`applyCreditFromApiResponse` 函數已內建向後相容邏輯，支援以下舊版欄位：

- `usedChars`
- `cost`
- `deducted`

**建議**: 新開發的 API 應統一使用 `totalUsedPoints`，舊版欄位僅作為過渡期支援。

---

## 📚 參考實作

### 作業解題模組
- **檔案**: `src/pages/tools/homework-helper.tsx`
- **API**: `api/homework-helper.ts`

### 摘要工具模組
- **檔案**: `src/pages/summary/index.tsx`
- **API**: `api/summary.ts`

---

## ⚠️ 注意事項

1. **扣點時機**: 僅在 API 成功回傳後才執行扣點，API 失敗時不應扣點
2. **點數驗證**: 後端應驗證點數計算的正確性，前端僅負責顯示與更新
3. **錯誤處理**: 若後端未回傳任何扣點相關欄位，`applyCreditFromApiResponse` 會回傳 `0`，此時應檢查 API 回應是否正常

---

**最後更新**: 2025-01-XX  
**維護者**: 開發團隊


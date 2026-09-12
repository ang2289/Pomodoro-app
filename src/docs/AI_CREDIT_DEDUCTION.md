# AI 模組扣點說明

## 📋 核心原則

所有 AI 功能模組（摘要工具、作業解題等）的扣點邏輯必須遵循以下原則：

---

## 🔧 後端責任

### 1. 所有 AI 模組一律由「後端」計算實際點數

- 後端 API 必須負責計算並回傳實際扣點數
- 前端不得自行計算或估算點數

### 2. 點數計算規則

```
totalUsedPoints = inputLength + outputLength
```

- **`inputLength`**: 使用者輸入字數（1 字 = 1 點）
- **`outputLength`**: AI 回答/輸出字數（1 字 = 1 點）
- **`totalUsedPoints`**: 總使用點數（必須等於 inputLength + outputLength）

---

## 💻 前端規範

### 3. 前端不得自行推算，只能使用 API 回傳的 totalUsedPoints

**❌ 禁止做法**：
```typescript
// 錯誤：自行計算
const usedPoints = input.length + output.length

// 錯誤：使用估算值
const usedPoints = input.length * 2

// 錯誤：硬寫數值
const usedPoints = 1000
```

**✅ 正確做法**：
```typescript
// 使用工具函數解析後端回傳的點數
import { applyCreditFromApiResponse } from '@/utils/creditCalculator'

const usedPoints = applyCreditFromApiResponse(apiResponse)
```

### 4. 若 API 未回傳 totalUsedPoints，視為錯誤，不扣點

- 如果 API 回應中沒有 `totalUsedPoints` 欄位，前端應視為錯誤
- **不應扣點**，並應顯示錯誤訊息給使用者
- 使用 `applyCreditFromApiResponse` 時，若無法解析到任何點數欄位，會回傳 `0`（不扣點）

---

## 📝 實作範例

### 後端 API 回應格式

```json
{
  "success": true,
  "result": "AI 回答內容...",
  "inputLength": 1000,
  "outputLength": 200,
  "totalUsedPoints": 1200
}
```

### 前端扣點流程

```typescript
// 1. API 成功後解析點數
const usedPoints = applyCreditFromApiResponse(data)

// 2. 檢查是否成功解析（usedPoints > 0 表示有解析到點數）
if (usedPoints === 0) {
  // API 未回傳點數資訊，視為錯誤，不扣點
  console.error('API 未回傳點數資訊')
  setError('無法取得點數資訊，請重試')
  return
}

// 3. 執行扣點
updateUsedCharsAfterSuccess(usedPoints)
```

---

## ⚠️ 重要提醒

1. **後端必須回傳** `inputLength`、`outputLength`、`totalUsedPoints`
2. **前端只能使用** API 回傳的 `totalUsedPoints`，不得自行計算
3. **若 API 未回傳點數**，前端不扣點，並顯示錯誤訊息
4. **點數計算統一由後端負責**，確保準確性與一致性

---

**最後更新**: 2025-01-XX  
**維護者**: 開發團隊








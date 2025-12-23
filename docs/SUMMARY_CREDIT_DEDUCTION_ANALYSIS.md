# 摘要功能扣點邏輯分析報告

## 📋 執行摘要

**結論：摘要功能目前為「前端扣點」，Edge Function (`auto-summary`) 不執行扣點邏輯。**

---

## 🔍 1. 扣點邏輯位置

### ✅ 前端扣點邏輯
**檔案：** `src/pages/summary/index.tsx`

**關鍵程式碼位置：**

#### 1.1 扣點前檢查（第 173-293 行）
```typescript
// 步驟 1：計算本次輸入字數
const inputChars = input.length

// 步驟 2：判斷是否為訪客試用模式
const isGuestMode = !user || remainingChars === null

// 步驟 3：檢查點數是否足夠
if (!isGuestMode) {
  // 已登入狀態：檢查點數
  const currentRemainingPoints = creditCheck.remainingChars
  if (currentRemainingPoints - inputChars < 0) {
    // 點數不足，阻止 API 呼叫
    return
  }
} else {
  // 訪客模式：檢查 localStorage
  const guestRemainingChars = /* 從 localStorage 讀取 */
  if (guestRemainingChars - inputChars < 0) {
    // 點數不足，阻止 API 呼叫
    return
  }
}
```

#### 1.2 API 呼叫（第 309-403 行）
```typescript
// 呼叫 Edge Function：auto-summary
const { data, error } = await supabase.functions.invoke('auto-summary', {
  body: {
    content: input,
    lang: detectedLang,
  },
})
```

#### 1.3 扣點執行（第 506-598 行）
```typescript
// 步驟 5：摘要成功後 → 計算點數
const inputLength = input.length
const outputLength = summaryText.length
const totalUsedPoints = inputLength + outputLength

// 步驟 6：前端即時更新點數
if (!isGuestMode) {
  // 已登入狀態：進行扣點
  if (!isLocalhost) {
    // 更新 localStorage（使用計算的點數）
    updateUsedCharsAfterSuccess(totalUsedPoints)
    
    // 登入狀態：使用 refreshCredits 來更新點數
    await refreshCredits()
  }
} else {
  // 訪客試用模式：進行扣點（使用 localStorage）
  if (!isLocalhost) {
    const newRemaining = Math.max(0, currentGuestRemaining - totalUsedPoints)
    localStorage.setItem(FREE_REMAINING_KEY, newRemaining.toString())
  }
}
```

### ❌ Edge Function 無扣點邏輯
**檔案：** `supabase/functions/auto-summary/index.ts`

**關鍵發現：**
- **第 82-102 行：** 扣點相關代碼已全部註解
- **第 323-326 行：** 明確註解「訪客模式：不執行扣點邏輯」
- Edge Function 僅負責：
  1. 接收內容和語言參數
  2. 呼叫 Gemini API 生成摘要
  3. 回傳摘要結果

**已註解的代碼：**
```typescript
// 🔓 允許匿名（訪客）呼叫，不檢查認證
// 註解：原本的用戶識別和點數檢查邏輯已移除，允許訪客直接使用
// const authHeader = req.headers.get("authorization");
// let userIdentifier = "anonymous";
// ... (已註解，允許匿名呼叫)

// 🔓 訪客模式：跳過點數檢查，直接執行摘要
// 註解：原本的點數檢查邏輯已移除
// const estimatedOutputChars = Math.ceil(inputLength * 0.15);
// ... (已註解，允許訪客直接使用)

// 🔓 訪客模式：不執行扣點邏輯
// 註解：原本的扣點邏輯已移除，訪客模式不扣點
// const outputChars = (result.summary || '').length + (result.keywords?.join(', ') || '').length;
// ... (已註解，訪客模式不扣點)
```

---

## 📊 2. 字數計算邏輯

### 2.1 輸入字數計算
**位置：** `src/pages/summary/index.tsx` 第 180 行
```typescript
const inputChars = input.length
```
- 直接使用輸入文字的字元長度

### 2.2 輸出字數計算
**位置：** `src/pages/summary/index.tsx` 第 509 行
```typescript
const outputLength = summaryText.length
```
- 使用摘要結果文字的字元長度

### 2.3 總扣點數計算
**位置：** `src/pages/summary/index.tsx` 第 510 行
```typescript
const totalUsedPoints = inputLength + outputLength
```
- **公式：** `總扣點數 = 輸入字數 + 輸出字數`

---

## 🔄 3. 扣點流程

### 3.1 已登入使用者流程

```
1. 使用者輸入內容
   ↓
2. 前端檢查點數是否足夠
   - 使用 creditCheck.remainingChars
   - 檢查：remainingChars - inputChars >= 0
   ↓
3. 點數足夠 → 呼叫 Edge Function
   - supabase.functions.invoke('auto-summary')
   - Edge Function 不扣點，僅生成摘要
   ↓
4. API 成功回傳摘要
   ↓
5. 前端計算扣點數
   - inputLength = input.length
   - outputLength = summaryText.length
   - totalUsedPoints = inputLength + outputLength
   ↓
6. 前端執行扣點
   - updateUsedCharsAfterSuccess(totalUsedPoints)
   - refreshCredits() // 從後端重新取得點數
   ↓
7. 更新 UI 顯示
```

### 3.2 訪客模式流程

```
1. 使用者輸入內容
   ↓
2. 前端檢查 localStorage 點數
   - 讀取 'free_characters_remaining'
   - 預設值：10000
   ↓
3. 點數足夠 → 呼叫 Edge Function
   - fetch('/functions/v1/auto-summary')
   - Edge Function 不扣點，僅生成摘要
   ↓
4. API 成功回傳摘要
   ↓
5. 前端計算扣點數
   - totalUsedPoints = inputLength + outputLength
   ↓
6. 前端執行扣點（localStorage）
   - newRemaining = currentGuestRemaining - totalUsedPoints
   - localStorage.setItem('free_characters_remaining', newRemaining)
   ↓
7. 更新 UI 顯示
```

---

## ⚠️ 4. 關鍵發現

### 4.1 扣點位置確認
- ✅ **前端扣點**：所有扣點邏輯都在前端執行
- ❌ **非 Supabase 扣點**：Edge Function 不執行任何扣點邏輯

### 4.2 扣點時機
- **扣點時機：** API 成功回傳摘要後才扣點
- **扣點位置：** `src/pages/summary/index.tsx` 第 506-598 行

### 4.3 環境判斷
- **正式環境：** 執行扣點
- **localhost 環境：** 不扣點（使用 `isDevelopment()` 判斷）

### 4.4 點數儲存位置
- **已登入使用者：**
  - 前端：`updateUsedCharsAfterSuccess()` 更新 localStorage
  - 後端：`refreshCredits()` 從 Supabase 資料庫讀取
- **訪客模式：**
  - 僅使用 localStorage：`free_characters_remaining`

---

## 📝 5. 相關檔案清單

### 前端檔案
1. **`src/pages/summary/index.tsx`**
   - 主要扣點邏輯（第 173-598 行）
   - 字數計算（第 180, 508-510 行）
   - 扣點執行（第 519-598 行）

2. **`src/components/CreditStatusBar.tsx`**
   - `updateUsedCharsAfterSuccess()` 函數（第 232-236 行）
   - 點數狀態管理

3. **`src/hooks/useCreditCheck.ts`**
   - 扣點前檢查邏輯

4. **`src/hooks/useAuthCredits.ts`**
   - 已登入使用者點數管理
   - `refreshCredits()` 函數

### Edge Function 檔案
1. **`supabase/functions/auto-summary/index.ts`**
   - 無扣點邏輯（已全部註解）
   - 僅負責生成摘要

---

## 🔧 6. 建議改進

### 6.1 安全性問題
目前前端扣點存在以下風險：
- ❌ 使用者可以透過修改前端代碼繞過扣點
- ❌ 訪客模式的點數僅存在 localStorage，容易被清除
- ❌ Edge Function 不驗證點數，可能被無限呼叫

### 6.2 建議改進方案
1. **將扣點邏輯移至 Edge Function**
   - 在 Edge Function 中檢查並扣除點數
   - 使用 Supabase RPC 函數 `consume_credits` 執行扣點
   - 參考 `homework-helper` Edge Function 的實作方式

2. **統一扣點流程**
   - 與 `homework-helper` 功能保持一致
   - 使用相同的 `consume_credits` RPC 函數
   - 前端僅負責顯示點數，不執行扣點

---

## 📌 總結

| 項目 | 狀態 |
|------|------|
| 扣點位置 | 前端（`src/pages/summary/index.tsx`） |
| Edge Function 扣點 | ❌ 無（已全部註解） |
| 字數計算 | 前端計算（input.length + output.length） |
| 扣點時機 | API 成功後 |
| 點數儲存 | localStorage（訪客）或 Supabase（已登入） |
| 環境判斷 | 使用 `isDevelopment()` 判斷是否扣點 |

**結論：摘要功能目前為前端扣點，建議改為 Edge Function 扣點以提高安全性。**


# 📋 摘要與作業上線變現 - 檔案清單與變更摘要

**目標：** 完成摘要與作業功能的付費變現機制  
**日期：** 2024-12-19

---

## 🎯 核心變現需求

1. **點數扣減機制**：摘要和作業使用時扣除點數
2. **點數不足提示**：使用前檢查並提示升級
3. **付費流程整合**：點數購買後自動增加
4. **使用統計顯示**：顯示已使用/剩餘點數
5. **方案升級引導**：點數不足時引導至購買頁面

---

## 📁 需要新增的檔案

### 1. 點數扣減服務層（新增或擴充）

**檔案：** `src/services/creditDeductionService.ts` (新增)

**用途：** 統一處理摘要和作業的點數扣減邏輯

**功能：**
- `deductCreditsForSummary(inputLength: number, outputLength: number): Promise<{success: boolean, remaining: number}>`
- `deductCreditsForHomework(inputLength: number, outputLength: number): Promise<{success: boolean, remaining: number}>`
- 計算實際使用字數（輸入 + 輸出）
- 呼叫 `consume_user_credits` RPC
- 回傳扣減結果和剩餘點數

---

### 2. 使用限制檢查 Hook（新增）

**檔案：** `src/hooks/useFeatureAccess.ts` (新增)

**用途：** 統一檢查功能使用權限（點數、登入狀態）

**功能：**
- `checkSummaryAccess(inputLength: number): {canUse: boolean, reason?: string, remaining?: number}`
- `checkHomeworkAccess(inputLength: number): {canUse: boolean, reason?: string, remaining?: number}`
- 整合 `useAuth` 和 `useAuthCredits`
- 提供統一的權限檢查介面

---

### 3. 點數不足提示元件（擴充）

**檔案：** `src/components/InsufficientCreditsModal.tsx` (新增)

**用途：** 統一的點數不足提示彈窗

**功能：**
- 顯示剩餘點數和需要點數
- 「立即購買」按鈕（導向 `/pricing`）
- 「查看使用記錄」按鈕（導向 `/points`）
- 支援中英文

---

## 📝 需要調整的檔案

### 1. 摘要功能 - 點數扣減整合

**檔案：** `src/pages/summary/useSummaryAction.ts`

**變更摘要：**
- ✅ 在 `runSummary` 中，**AI 呼叫前**檢查點數是否足夠
- ✅ 在 `runSummary` 中，**AI 呼叫成功後**扣除點數（輸入 + 輸出字數）
- ✅ 使用 `creditDeductionService.deductCreditsForSummary()`
- ✅ 扣點失敗時顯示錯誤並阻止顯示結果
- ✅ 扣點成功後更新 `remainingChars` state

**關鍵變更點：**
```typescript
// 在 callSummaryService 之前
const accessCheck = checkSummaryAccess(input.length)
if (!accessCheck.canUse) {
  setError(accessCheck.reason || '點數不足')
  return
}

// 在 callSummaryService 成功後
const deductionResult = await deductCreditsForSummary(input.length, summaryText.length)
if (!deductionResult.success) {
  setError('點數扣除失敗，請稍後再試')
  return
}
// 更新 remainingChars
```

---

### 2. 作業功能 - 點數扣減整合

**檔案：** `src/pages/tools/homework-helper.tsx`

**變更摘要：**
- ✅ 恢復 `handleAnalyze` 中被註解的點數檢查邏輯
- ✅ 在 Edge Function 呼叫前檢查點數
- ✅ 在 Edge Function 呼叫成功後扣除點數
- ✅ 使用 `creditDeductionService.deductCreditsForHomework()`
- ✅ 整合 `InsufficientCreditsModal` 顯示提示

**關鍵變更點：**
```typescript
// 恢復點數檢查（第 427-435 行）
if (!creditCheck.canProceed) {
  setModal({
    title: '剩餘字數不足',
    message: creditCheck.errorMessage || '剩餘字數不足，請升級方案',
    upgradeButton: '立即購買'
  })
  return
}

// 在 API 成功後扣點
const deductionResult = await deductCreditsForHomework(question.length, result.length)
```

---

### 3. 點數服務 - 擴充扣減功能

**檔案：** `src/lib/creditService.ts`

**變更摘要：**
- ✅ 確認 `consumeCredits` 函式正確使用實際 `userId`（已完成）
- ✅ 新增 `calculateUsageChars(inputLength: number, outputLength: number): number` 輔助函式
- ✅ 確認錯誤處理完整（點數不足、網路錯誤等）

---

### 4. 摘要頁面 - UI 整合

**檔案：** `src/pages/summary/index.tsx`

**變更摘要：**
- ✅ 確認 `remainingChars` 從 `useAuthCredits` 正確取得（已完成）
- ✅ 傳遞 `remainingChars` 給 `SummaryLayout`（已完成）
- ✅ 整合 `InsufficientCreditsModal` 顯示邏輯

---

### 5. 摘要頁面 - UI 顯示調整

**檔案：** `src/pages/summary/SummaryLayout.tsx`

**變更摘要：**
- ✅ 確認狀態列顯示正確的 `remainingChars`（已完成）
- ✅ 整合 `InsufficientCreditsModal` 元件
- ✅ 在點數不足時顯示提示（目前已有部分邏輯）

---

### 6. 作業頁面 - UI 整合

**檔案：** `src/pages/tools/homework-helper.tsx`

**變更摘要：**
- ✅ 恢復按鈕的 `disabled` 邏輯（基於點數檢查）
- ✅ 整合 `InsufficientCreditsModal` 顯示
- ✅ 顯示剩餘點數和使用統計

---

### 7. 付費成功頁面 - 點數增加確認

**檔案：** `src/pages/payment/success.tsx` 或相關檔案

**變更摘要：**
- ✅ 確認付費成功後點數正確增加
- ✅ 呼叫 `refreshCredits()` 更新顯示
- ✅ 顯示「點數已增加」提示

---

### 8. 方案頁面 - 功能說明更新

**檔案：** `src/pages/pricing/index.tsx`

**變更摘要：**
- ✅ 確認方案說明包含「摘要」和「作業」功能
- ✅ 顯示各方案可使用的字數配額
- ✅ 確認購買流程正常運作

---

### 9. 點數顯示元件 - 統一顯示

**檔案：** `src/components/CreditStatusBarDetailed.tsx`

**變更摘要：**
- ✅ 確認顯示邏輯正確（已使用、剩餘）
- ✅ 確認從 `useAuthCredits` 取得最新值
- ✅ 支援中英文顯示

---

### 10. 使用記錄頁面（可選）

**檔案：** `src/pages/points.tsx` 或新增 `src/pages/credit-history.tsx`

**變更摘要：**
- ✅ 顯示點數使用記錄（摘要、作業）
- ✅ 顯示點數購買記錄
- ✅ 顯示剩餘點數和總購買點數

---

## 🔧 需要調整的 Supabase 資料庫

### 1. RPC 函數確認

**檔案：** Supabase SQL Editor

**需要確認的 RPC：**
- ✅ `consume_user_credits(p_user_id, p_used_chars)` - 確認正確扣點並回傳剩餘
- ✅ `get_user_credits_info(p_user_id)` - 確認回傳格式正確
- ✅ `init_user_credits_if_not_exists(p_user_id)` - 確認初始化邏輯

### 2. 資料表確認

**表：** `user_credits`

**需要確認的欄位：**
- `user_id` (UUID, PK)
- `remaining_chars` (INTEGER) - 剩餘點數
- `total_credits` (INTEGER) - 總購買點數
- `used_chars` (INTEGER) - 已使用點數
- `updated_at` (TIMESTAMP)

### 3. 使用記錄表（可選）

**表：** `credit_usage_log` (新增，可選)

**欄位：**
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `feature` (TEXT) - 'summary' 或 'homework'
- `input_length` (INTEGER)
- `output_length` (INTEGER)
- `total_used` (INTEGER)
- `created_at` (TIMESTAMP)

---

## 🎨 UI/UX 調整需求

### 1. 點數不足提示流程

**流程：**
1. 使用者點擊「一鍵摘要」或「開始解題」
2. 檢查點數是否足夠
3. 不足 → 顯示 `InsufficientCreditsModal`
4. 使用者點擊「立即購買」→ 導向 `/pricing`
5. 購買成功 → 返回原頁面，自動刷新點數

### 2. 使用中提示

**顯示位置：**
- 摘要頁面：狀態列顯示剩餘點數
- 作業頁面：狀態列或按鈕旁顯示剩餘點數
- 使用後：顯示本次使用字數

### 3. 低點數警告

**觸發條件：**
- 剩餘點數 < 1000 字時顯示警告
- 使用 `LowCreditsNotice` 元件

---

## 🔄 整合流程圖

```
使用者點擊功能
    ↓
檢查登入狀態（useAuth）
    ↓
檢查點數是否足夠（useFeatureAccess）
    ↓
不足 → 顯示 InsufficientCreditsModal → 導向購買
    ↓
足夠 → 執行功能（呼叫 Edge Function）
    ↓
成功 → 扣除點數（creditDeductionService）
    ↓
更新顯示（refreshCredits）
    ↓
顯示結果
```

---

## ⚠️ 注意事項

1. **點數扣減時機**：
   - ✅ 必須在 AI 呼叫**成功後**才扣點
   - ❌ 不能在 AI 呼叫前扣點（避免失敗時仍扣點）

2. **錯誤處理**：
   - 網路錯誤：不扣點，顯示錯誤訊息
   - AI 錯誤：不扣點，顯示錯誤訊息
   - 點數不足：不呼叫 AI，直接提示

3. **並發控制**：
   - 使用 `loading` state 防止重複點擊
   - 使用保護機制防止重複扣點

4. **資料一致性**：
   - 扣點後立即刷新 `remainingChars`
   - 使用 RPC 確保原子性操作

---

## 📊 測試檢查清單

- [ ] 未登入時點擊功能 → 提示登入
- [ ] 點數不足時點擊功能 → 顯示不足提示
- [ ] 點數足夠時執行功能 → 成功扣點
- [ ] AI 失敗時 → 不扣點
- [ ] 購買點數後 → 點數正確增加
- [ ] 使用後 → 顯示正確的使用字數
- [ ] 剩餘點數顯示 → 即時更新

---

**最後更新：** 2024-12-19  
**狀態：** 規劃中，待實作

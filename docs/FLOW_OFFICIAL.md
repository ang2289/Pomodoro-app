# 正式流程說明

本文檔說明目前專案中**唯一正式流程**，所有其他流程皆為歷史版本，已封存。

---

## 📋 正式流程步驟

### 1. 使用者進入方案選擇頁
- **路徑**：`/pricing`
- **檔案位置**：`src/pages/pricing/index.tsx`
- **功能**：顯示兩個付費方案
  - NT$99 方案：10 萬字
  - NT$199 方案：30 萬字
- **操作**：使用者選擇方案後，點擊按鈕進入匯款頁

### 2. 選擇方案並進入匯款頁
- **路徑**：`/payment/bank-transfer?plan=99` 或 `/payment/bank-transfer?plan=199`
- **檔案位置**：`src/pages/payment/bank-transfer.tsx`
- **功能**：
  - 顯示選擇的方案資訊（價格、字數）
  - 顯示銀行匯款資訊（銀行、帳號、戶名）
  - 提供「我已完成匯款，送出回報」按鈕
- **操作**：使用者完成匯款後，點擊按鈕進入匯款回報頁

### 3. 填寫並送出匯款回報
- **路徑**：`/payment/report?plan=99` 或 `/payment/report?plan=199`
- **檔案位置**：`src/pages/payment/report.tsx`
- **功能**：
  - 表單欄位：Email、匯款金額、帳號後五碼、方案（唯讀）
  - 提交後寫入 `payment_reports` 資料表
  - 狀態：`status = 'pending'`，`processed = false`
- **操作**：使用者填寫表單並提交，系統記錄匯款回報

### 4. 後台核准並補點
- **路徑**：`/admin/payments`
- **檔案位置**：`src/pages/admin/payments.tsx`
- **功能**：
  - 顯示所有 `processed = false` 的匯款回報
  - 管理員可查看：Email、方案、金額、帳號後五碼、提交時間
  - 點擊「加點」按鈕後：
    - 呼叫 RPC：`process_payment_and_add_credits(p_payment_id)`
    - 更新 `payment_reports.processed = true`
    - 根據 `plan_id` 計算加點（99=100,000 字，199=300,000 字）
    - 更新 `user_credits.remaining_chars` 和 `total_credits`
- **權限**：僅管理員可訪問（透過 `is_admin()` RPC 檢查）

### 5. 使用者於功能頁實際扣點使用
- **功能頁面**：
  - AI 摘要：`/summary`
  - 作業解題：`/homework-helper`
- **扣點邏輯**：
  - 在呼叫 API 前，先呼叫 `consume_credits` RPC
  - RPC 函數：`consume_credits(p_user_id, p_amount, p_feature)`
  - 使用 `FOR UPDATE` 鎖定防止並發
  - 檢查點數是否足夠，不足則回傳 `false` 並中斷請求
  - 扣點成功後才執行功能 API
- **檔案位置**：
  - `src/pages/summary/useSummaryAction.ts`（摘要功能）
  - `src/pages/tools/homework-helper.tsx`（作業解題功能）

---

## 🔄 完整流程圖

```
使用者
  ↓
/pricing（選擇方案）
  ↓
/payment/bank-transfer（查看匯款資訊）
  ↓
使用者完成匯款
  ↓
/payment/report（填寫匯款回報）
  ↓
寫入 payment_reports 表（status='pending', processed=false）
  ↓
管理員於 /admin/payments 查看
  ↓
管理員點擊「加點」按鈕
  ↓
呼叫 process_payment_and_add_credits RPC
  ↓
更新 user_credits（增加 remaining_chars 和 total_credits）
  ↓
更新 payment_reports（processed=true）
  ↓
使用者於功能頁使用服務
  ↓
呼叫 consume_credits RPC（扣點）
  ↓
執行功能 API
```

---

## 📁 相關檔案清單

### 前台頁面
- `src/pages/pricing/index.tsx` - 方案選擇頁
- `src/pages/payment/bank-transfer.tsx` - 匯款資訊頁
- `src/pages/payment/report.tsx` - 匯款回報頁

### 後台頁面
- `src/pages/admin/payments.tsx` - 付款管理頁

### 資料庫 Migration
- `supabase/migrations/create_payment_reports_table.sql` - 匯款回報表
- `supabase/migrations/create_user_credits_system.sql` - 點數系統
- `supabase/migrations/create_process_payment_and_add_credits_function.sql` - 補點 RPC
- `supabase/migrations/create_consume_credits_simple.sql` - 扣點 RPC
- `supabase/migrations/create_is_admin_function.sql` - 管理員檢查 RPC

### 扣點邏輯
- `src/pages/summary/useSummaryAction.ts` - 摘要功能扣點
- `src/pages/tools/homework-helper.tsx` - 作業解題扣點

---

## ⚠️ 重要提醒

**其他流程皆為歷史版本，已封存。**

以下頁面已標記為 DEPRECATED，請勿使用：
- `/pricing-old` - 舊版方案頁（已改為顯示棄用提示）
- `/topup/report` - 舊版加點回報（已改為顯示棄用提示）
- `/topup/admin` - 舊版加點管理（已改為顯示棄用提示）

相關檔案已加上 DEPRECATED 註解，路由已改為顯示棄用提示頁面。

---

## 📝 更新記錄

- 2025-01-XX：建立正式流程文件
- 舊版流程已封存，所有舊版路由已改為顯示棄用提示



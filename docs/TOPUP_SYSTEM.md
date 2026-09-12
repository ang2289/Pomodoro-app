# 付費補點流程說明

## 概述

此系統實作了完整的付費補點流程，包含：
1. 使用者匯款回報頁面
2. 管理者審核與加點功能
3. 完整的資料表與 Edge Function

## 資料庫設定

### 1. 執行 Migration

在 Supabase Dashboard > SQL Editor 中執行：

```sql
-- 執行 supabase/migrations/create_credit_topups_table.sql
```

這會建立 `credit_topups` 表，包含以下欄位：
- `id`: UUID 主鍵
- `user_id`: 使用者 ID
- `amount_chars`: 加點字數
- `amount_ntd`: 匯款金額（新台幣）
- `account_last_five`: 匯款帳號後五碼
- `status`: 狀態（pending / approved / rejected）
- `approved_by`: 核准者 ID
- `approved_at`: 核准時間
- `note`: 備註
- `created_at`: 建立時間
- `updated_at`: 更新時間

### 2. 設定環境變數

在 Supabase Dashboard > Project Settings > Edge Functions 中設定：

```
ADMIN_USER_IDS=your-admin-user-id-1,your-admin-user-id-2
```

或在 `.env` 檔案中設定（前端）：

```
VITE_ADMIN_USER_IDS=your-admin-user-id-1,your-admin-user-id-2
```

## Edge Functions 部署

### 1. approve-topup

管理者核准加點申請的 Edge Function。

**部署方式：**
```bash
supabase functions deploy approve-topup
```

**功能：**
- 檢查請求者是否為管理者
- 將 `credit_topups` 狀態改為 `approved`
- 增加 `user_credits.remaining_chars`

**呼叫範例：**
```typescript
const response = await fetch(`${supabaseUrl}/functions/v1/approve-topup`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    topupId: 'topup-uuid',
    note: '備註（選填）',
  }),
})
```

### 2. list-topups

管理者查詢所有加點紀錄的 Edge Function。

**部署方式：**
```bash
supabase functions deploy list-topups
```

**功能：**
- 檢查請求者是否為管理者
- 查詢所有 `credit_topups` 記錄
- 回傳包含使用者 email 的完整記錄

**呼叫範例：**
```typescript
const response = await fetch(`${supabaseUrl}/functions/v1/list-topups`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
})
```

## 頁面路由

### 1. 匯款回報頁面

**路由：** `/topup/report`

**功能：**
- 使用者填寫匯款金額（NT$99 或 NT$199）
- 填寫匯款帳號後五碼
- 提交後等待管理者審核

**使用方式：**
使用者完成匯款後，訪問 `/topup/report` 填寫表單。

### 2. 管理者檢視頁

**路由：** `/topup/admin`

**功能：**
- 顯示所有加點紀錄（待審核、已核准、已拒絕）
- 管理者可核准待審核的申請
- 顯示使用者 email、金額、字數等資訊

**使用方式：**
管理者訪問 `/topup/admin` 查看並審核申請。

## 流程說明

1. **使用者匯款**
   - 使用者完成匯款（NT$99 或 NT$199）
   - 訪問 `/topup/report` 填寫表單
   - 系統建立 `credit_topups` 記錄，狀態為 `pending`

2. **管理者審核**
   - 管理者訪問 `/topup/admin` 查看待審核申請
   - 點擊「核准」按鈕
   - 系統呼叫 `approve-topup` Edge Function
   - 更新 `credit_topups` 狀態為 `approved`
   - 增加 `user_credits.remaining_chars`

3. **完成加點**
   - 使用者收到加點通知（可自行實作）
   - 使用者可使用新增的字數

## 注意事項

1. **管理者權限**
   - 管理者 ID 需設定在環境變數 `ADMIN_USER_IDS` 中
   - 多個管理者 ID 用逗號分隔

2. **RLS 政策**
   - `credit_topups` 表已啟用 RLS
   - 使用者只能讀取和新增自己的記錄
   - UPDATE（核准/拒絕）由 Edge Function 使用 SERVICE_ROLE_KEY 執行

3. **匯款帳號**
   - 目前匯款回報頁面顯示「XXX-XXX-XXXXX」為佔位符
   - 實際部署時需替換為真實匯款帳號

4. **金額對應**
   - NT$99 → 100,000 字
   - NT$199 → 300,000 字
   - 可在 `src/pages/topup/report.tsx` 的 `calculateChars` 函數中修改

## 未實作功能

以下功能尚未實作，可視需求補充：

1. **拒絕申請**
   - 目前僅實作核准功能
   - 可新增「拒絕」按鈕，將狀態改為 `rejected`

2. **通知系統**
   - 核准後可發送 email 或推播通知使用者

3. **匯款帳號管理**
   - 可建立資料表儲存多個匯款帳號
   - 讓使用者選擇匯款帳號

4. **自動對帳**
   - 可整合銀行 API 自動對帳
   - 自動核准符合條件的申請



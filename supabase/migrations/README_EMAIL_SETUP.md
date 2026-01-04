# Email 通知功能設定說明

## 概述

`process_payment_and_add_credits` RPC 函數在補點完成後會自動發送 Email 通知給使用者。Email 發送失敗不會影響補點成功。

## 設定步驟

### 1. 啟用 pg_net 擴充功能

執行以下 migration：
```sql
-- 見 enable_pg_net_extension.sql
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### 2. 設定 Supabase URL 和 Service Role Key

在 Supabase Dashboard 中設定以下設定值：

#### 方法一：使用 Supabase Dashboard（推薦）

1. 進入 Supabase Dashboard → Settings → Database
2. 在 "Custom Config" 或 "Database Settings" 中新增：
   - `app.supabase_url`: 你的 Supabase 專案 URL（例如：`https://xxxxx.supabase.co`）
   - `app.supabase_service_role_key`: 你的 Service Role Key（可在 Settings → API 中找到）

#### 方法二：使用 SQL

```sql
-- 設定 Supabase URL
ALTER DATABASE postgres SET app.supabase_url = 'https://xxxxx.supabase.co';

-- 設定 Service Role Key
ALTER DATABASE postgres SET app.supabase_service_role_key = 'your-service-role-key-here';
```

### 3. 部署 Edge Function

確保 `supabase/functions/send-email/index.ts` 已部署到 Supabase。

```bash
supabase functions deploy send-email
```

### 4. 設定 Email 服務（可選）

目前 Edge Function 只記錄 log，實際發送 Email 需要配置 Email 服務。

#### 使用 Resend（推薦）

1. 在 Resend 註冊並取得 API Key
2. 在 Supabase Dashboard → Settings → Edge Functions → Environment Variables 中新增：
   - `RESEND_API_KEY`: 你的 Resend API Key
3. 修改 `supabase/functions/send-email/index.ts` 使用 Resend API

#### 使用 SendGrid

類似 Resend，設定 `SENDGRID_API_KEY` 環境變數。

## 測試

1. 在 `/admin/payments` 頁面點擊「確認補點」
2. 檢查 Supabase Dashboard → Logs → Edge Functions 是否有 `send-email` 的 log
3. 檢查使用者是否收到 Email

## 注意事項

- Email 發送失敗不會影響補點成功
- 如果 `pg_net` 擴充功能未啟用或設定值未設定，會記錄 WARNING log，但不影響補點流程
- Email 內容包含：方案名稱、補充點數


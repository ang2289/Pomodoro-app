# Supabase Migrations 說明

## 執行順序

請按照以下順序在 Supabase Dashboard > SQL Editor 中執行：

1. **create_user_credits_table.sql** - 建立/更新 user_credits 資料表（符合用戶需求）
2. **create_user_credits_system.sql** - 建立資料表、索引、RLS（舊版，可選）
3. **create_consume_credits_function.sql** - 建立扣點數函數

## 資料表說明

### user_credits
- **用途**：儲存使用者的點數餘額
- **結構**：
  - `user_id` (UUID, PK) - 關聯 auth.users
  - `remaining_chars` (INTEGER) - 剩餘可用字數
  - `updated_at` (TIMESTAMP) - 最後更新時間
- **規則**：
  - 每個使用者只有一筆記錄
  - 不依賴日期欄位判斷點數有效性（點數永久有效）

### usage_logs
- **用途**：記錄每次 AI 功能使用的詳細資訊
- **結構**：
  - `id` (UUID, PK)
  - `user_id` (UUID) - 關聯 auth.users
  - `feature` (TEXT) - 功能類型：'summary' 或 'homework'
  - `input_chars` (INTEGER) - 輸入文字字數
  - `output_chars` (INTEGER) - 輸出文字字數
  - `total_chars` (INTEGER) - 總使用字數
  - `before_remaining` (INTEGER) - 使用前剩餘點數
  - `after_remaining` (INTEGER) - 使用後剩餘點數
  - `created_at` (TIMESTAMP) - 建立時間
- **索引**：user_id, created_at

## RLS 政策

- **user_credits**：使用者只能讀寫自己的點數
- **usage_logs**：使用者只能讀取自己的使用紀錄（INSERT 由後端服務執行）

## 函數說明

### consume_user_credits
- **用途**：原子扣除使用者點數（避免 race condition）
- **參數**：
  - `p_user_id` (UUID 或 TEXT)
  - `p_used_chars` (INTEGER)
- **回傳**：剩餘點數 (INTEGER)
- **特性**：
  - 使用 `FOR UPDATE` 鎖定行，防止並發更新
  - 自動初始化新使用者的點數（10000 字）
  - 點數不足時拋出異常

### init_user_credits_if_not_exists
- **用途**：初始化使用者點數（如果不存在）
- **參數**：
  - `p_user_id` (UUID)
  - `p_initial_chars` (INTEGER, 預設 10000)
- **回傳**：剩餘點數 (INTEGER)

## 注意事項

1. **匿名使用者**：目前使用 TEXT 版本的 `consume_user_credits`，未來應改為 UUID 格式
2. **初始化點數**：新使用者首次使用時自動獲得 10000 字免費點數
3. **點數永久有效**：購買的點數沒有使用期限，用完為止


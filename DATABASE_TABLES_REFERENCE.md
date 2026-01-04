# 資料表欄位參考文件

## 一、會用到的資料表欄位

### 1. users 表（登入用）

**欄位：**
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid()) - 使用者唯一識別碼
- `email` (TEXT, UNIQUE, NOT NULL) - 使用者 Email（需唯一）
- `password_hash` (TEXT, NOT NULL) - 使用 bcrypt 加密後的密碼
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW()) - 建立時間
- `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW()) - 更新時間

**索引：**
- `idx_users_email` - email 欄位索引

### 2. user_credits 表（點數）

**欄位：**
- `user_id` (UUID, PRIMARY KEY, FK → users.id ON DELETE CASCADE) - 使用者 ID
- `remaining_chars` (INTEGER, NOT NULL, DEFAULT 0) - 剩餘可用字數
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW()) - 建立時間
- `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW()) - 更新時間

**索引：**
- `idx_user_credits_user_id` - user_id 欄位索引

### 3. usage_logs 表（使用紀錄）

**欄位：**
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid()) - 記錄 ID
- `user_id` (UUID, NOT NULL, FK → users.id ON DELETE CASCADE) - 使用者 ID
- `feature` (TEXT, NOT NULL, CHECK IN ('summary', 'homework')) - 功能名稱
- `input_chars` (INTEGER, NOT NULL, DEFAULT 0) - 輸入字數
- `output_chars` (INTEGER, NOT NULL, DEFAULT 0) - 輸出字數
- `total_chars` (INTEGER, NOT NULL, DEFAULT 0) - 總使用字數
- `before_remaining` (INTEGER, NOT NULL) - 使用前剩餘點數
- `after_remaining` (INTEGER, NOT NULL) - 使用後剩餘點數
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW()) - 建立時間

**索引：**
- `idx_usage_logs_user_id` - user_id 欄位索引
- `idx_usage_logs_created_at` - created_at 欄位索引（降序）
- `idx_usage_logs_feature` - feature 欄位索引

## 二、會被刪除的表

以下表會在執行 `cleanup_and_rebuild_tables.sql` 時被刪除：

- `public.users`（舊版本，會重建）
- `public.user_credits`（舊版本，會重建）
- `public.usage_logs`（舊版本，會重建）
- `public.user_account`
- `public.credit_topups`
- `public.payment_reports`
- `public.plans`
- `public.subscriptions`
- `public.profiles`

## 三、會被保留的表（與願望牆、誦經相關）

以下表**不會**被刪除，會保留：

- `public.chant_logs` - 誦經紀錄
- `public.chant_wishes` - 誦經願望
- `public.chant_wish_supports` - 誦經願望支持
- `public.chant_wish_lights` - 誦經願望點燈
- `public.chant_comments` - 誦經評論
- `public.chant_likes` - 誦經按讚
- `public.wishes` - 願望
- `public.wish_comments` - 願望評論
- `public.wish_lights` - 願望點燈
- `public.chant-lights` - Storage bucket（不是表）

## 四、執行步驟

1. 在 Supabase Dashboard > SQL Editor 中開啟
2. 複製 `supabase/migrations/cleanup_and_rebuild_tables.sql` 的內容
3. 貼上並執行
4. 確認執行成功（會顯示 ✅ 訊息）

## 五、注意事項

- ⚠️ **此操作會刪除所有舊的使用者和點數資料**
- ⚠️ **請先備份資料（如果需要）**
- ✅ **願望牆和誦經相關的表不會被影響**
- ✅ **執行後會自動重建符合最終定案規格的表**

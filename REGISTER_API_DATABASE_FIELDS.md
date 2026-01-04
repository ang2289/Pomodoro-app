# 註冊 API 使用的資料表欄位

## 一、users 表（登入用）

### 必要欄位：
- `id` (UUID, PRIMARY KEY) - 使用者唯一識別碼
- `email` (TEXT, UNIQUE) - 使用者 Email（需唯一）
- `password_hash` (TEXT) - 使用 bcrypt 加密後的密碼
- `created_at` (TIMESTAMP) - 建立時間（可選，建議加入）
- `updated_at` (TIMESTAMP) - 更新時間（可選，建議加入）

### 建立 SQL（如果表不存在）：
```sql
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 使用方式：
```sql
INSERT INTO users (id, email, password_hash, created_at, updated_at)
VALUES (uuid, email, password_hash, now(), now())
```

## 二、user_credits 表（點數）

### 必要欄位：
- `user_id` (UUID, PRIMARY KEY) - 使用者 ID（需參考 users.id，不是 auth.users.id）
- `remaining_chars` (INTEGER, NOT NULL, DEFAULT 0) - 剩餘可用字數
- `created_at` (TIMESTAMP) - 建立時間（可選，建議加入）
- `updated_at` (TIMESTAMP) - 更新時間（可選，建議加入）

### 建立 SQL（如果表不存在或需要修正外鍵）：
```sql
-- 如果外鍵參考 auth.users，需要先刪除外鍵
ALTER TABLE public.user_credits 
DROP CONSTRAINT IF EXISTS user_credits_user_id_fkey;

-- 重新建立外鍵參考 users 表（不是 auth.users）
ALTER TABLE public.user_credits
ADD CONSTRAINT user_credits_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
```

### 使用方式：
```sql
INSERT INTO user_credits (user_id, remaining_chars, created_at, updated_at)
VALUES (user_id, 10000, now(), now())
```

## 三、RLS (Row Level Security) 處理

### 問題：
- 如果 `user_credits` 表啟用了 RLS 且政策使用 `auth.uid()`
- 由於不使用 Supabase Auth，`auth.uid()` 會返回 NULL
- 這會導致插入操作被 RLS 政策阻擋

### 解決方案：

#### 方案 1：使用 SERVICE_ROLE_KEY（推薦）
- 在 Vercel 環境變數中設定 `SUPABASE_SERVICE_ROLE_KEY`
- 註冊 API 會自動使用 SERVICE_ROLE_KEY 繞過 RLS

#### 方案 2：修改 RLS 政策（如果無法使用 SERVICE_ROLE_KEY）
```sql
-- 允許後端服務插入（不使用 auth.uid()）
DROP POLICY IF EXISTS "Users can insert own credits" ON public.user_credits;

CREATE POLICY "Allow service role to insert credits"
ON public.user_credits
FOR INSERT
WITH CHECK (true); -- 允許所有插入（由後端 API 控制）
```

## 四、完整檢查清單

- [ ] `users` 表存在
- [ ] `users` 表有 `id`, `email`, `password_hash` 欄位
- [ ] `user_credits` 表存在
- [ ] `user_credits` 表有 `user_id`, `remaining_chars` 欄位
- [ ] `user_credits.user_id` 外鍵參考 `users.id`（不是 `auth.users.id`）
- [ ] RLS 已處理（使用 SERVICE_ROLE_KEY 或修改政策）
- [ ] 環境變數已設定：`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`（可選但推薦）

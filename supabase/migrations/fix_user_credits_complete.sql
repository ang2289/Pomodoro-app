-- ==========================================
-- 完整修正 user_credits 表結構與 RLS 政策
-- 在 Supabase Dashboard → SQL Editor 中執行此腳本
-- ==========================================

-- 1️⃣ 確保 user_credits 表存在（如果不存在則創建）
CREATE TABLE IF NOT EXISTS public.user_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  remaining_chars INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2️⃣ 添加 total_credits 欄位（如果不存在）
ALTER TABLE public.user_credits
ADD COLUMN IF NOT EXISTS total_credits INTEGER NOT NULL DEFAULT 10000;

-- 3️⃣ 添加 trial_expires_at 欄位（如果不存在）
ALTER TABLE public.user_credits
ADD COLUMN IF NOT EXISTS trial_expires_at TIMESTAMPTZ;

-- 4️⃣ 為現有記錄設置預設值（如果為 NULL）
UPDATE public.user_credits
SET total_credits = COALESCE(total_credits, 10000)
WHERE total_credits IS NULL;

UPDATE public.user_credits
SET trial_expires_at = COALESCE(trial_expires_at, NOW() + INTERVAL '7 days')
WHERE trial_expires_at IS NULL;

-- 5️⃣ 強制啟用 RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- 6️⃣ 刪除舊的 SELECT 政策（如果存在）
DROP POLICY IF EXISTS "Users can read own credits" ON public.user_credits;
DROP POLICY IF EXISTS "users_can_read_own_credits" ON public.user_credits;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON public.user_credits;

-- 7️⃣ 建立新的 SELECT 政策：使用者只能讀取自己的點數
CREATE POLICY "Users can read own credits"
ON public.user_credits
FOR SELECT
USING (auth.uid() = user_id);

-- 8️⃣ 刪除舊的 UPDATE 政策（如果存在）
DROP POLICY IF EXISTS "Users can update own credits" ON public.user_credits;
DROP POLICY IF EXISTS "users_can_update_own_credits" ON public.user_credits;
DROP POLICY IF EXISTS "Enable update access for users based on user_id" ON public.user_credits;

-- 9️⃣ 建立新的 UPDATE 政策：使用者只能更新自己的點數
CREATE POLICY "Users can update own credits"
ON public.user_credits
FOR UPDATE
USING (auth.uid() = user_id);

-- 🔟 驗證結果（可選，查看實際結構）
-- SELECT 
--   column_name,
--   data_type,
--   is_nullable,
--   column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' 
--   AND table_name = 'user_credits'
-- ORDER BY ordinal_position;



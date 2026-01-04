-- ==========================================
-- 清理並重建資料表（最終定案版）
-- 執行方式：在 Supabase Dashboard > SQL Editor 中執行此腳本
-- ==========================================
-- 
-- 說明：
-- 1. 刪除所有舊的 auth/users/credits 相關表
-- 2. 重建符合最終定案規格的表結構
-- 3. 保留與願望牆、誦經相關的表（以下表不會被刪除）：
--    - chant_logs
--    - chant_wishes
--    - chant_wish_supports
--    - chant_wish_lights
--    - chant_comments
--    - chant_likes
--    - wishes
--    - wish_comments
--    - wish_lights
--    - chant-lights (storage bucket)
-- ==========================================

-- ==========================================
-- 第一步：刪除舊表（CASCADE 會自動刪除相關的外鍵、索引、觸發器等）
-- ==========================================

-- 刪除點數和使用紀錄相關表
DROP TABLE IF EXISTS public.usage_logs CASCADE;
DROP TABLE IF EXISTS public.user_credits CASCADE;
DROP TABLE IF EXISTS public.credit_topups CASCADE;
DROP TABLE IF EXISTS public.payment_reports CASCADE;

-- 刪除使用者相關表
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.user_account CASCADE;

-- 刪除方案相關表
DROP TABLE IF EXISTS public.plans CASCADE;

-- 刪除訂閱相關表（如果存在）
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 刪除所有相關的函數（如果存在）
DROP FUNCTION IF EXISTS public.init_user_credits_if_not_exists CASCADE;
DROP FUNCTION IF EXISTS public.init_user_credits_if_missing CASCADE;
DROP FUNCTION IF EXISTS public.get_user_credits_info CASCADE;
DROP FUNCTION IF EXISTS public.get_or_init_user_credits CASCADE;
DROP FUNCTION IF EXISTS public.consume_credits CASCADE;
DROP FUNCTION IF EXISTS public.consume_credits_simple CASCADE;
DROP FUNCTION IF EXISTS public.add_credits CASCADE;
DROP FUNCTION IF EXISTS public.process_payment_and_add_credits CASCADE;
DROP FUNCTION IF EXISTS public.init_anonymous_user CASCADE;
DROP FUNCTION IF EXISTS public.is_admin CASCADE;

-- 刪除所有相關的觸發器
DROP TRIGGER IF EXISTS trigger_update_user_credits_updated_at ON public.user_credits CASCADE;

-- ==========================================
-- 第二步：重建符合最終定案規格的表
-- ==========================================

-- 1️⃣ 建立 users 表（登入用）
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- 建立 updated_at 自動更新觸發器
CREATE OR REPLACE FUNCTION public.update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_users_updated_at();

-- 註解說明
COMMENT ON TABLE public.users IS '使用者登入表（不使用 Supabase Auth）';
COMMENT ON COLUMN public.users.id IS '使用者唯一識別碼（UUID）';
COMMENT ON COLUMN public.users.email IS '使用者 Email（唯一）';
COMMENT ON COLUMN public.users.password_hash IS '使用 bcrypt 加密後的密碼';

-- 2️⃣ 建立 user_credits 表（點數）
CREATE TABLE IF NOT EXISTS public.user_credits (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  remaining_chars INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON public.user_credits(user_id);

-- 建立 updated_at 自動更新觸發器
CREATE OR REPLACE FUNCTION public.update_user_credits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_credits_updated_at
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_credits_updated_at();

-- 註解說明
COMMENT ON TABLE public.user_credits IS '使用者點數帳戶表，每個使用者只有一筆記錄';
COMMENT ON COLUMN public.user_credits.user_id IS '使用者 ID（關聯 users.id，不是 auth.users）';
COMMENT ON COLUMN public.user_credits.remaining_chars IS '剩餘可用字數點數';

-- 3️⃣ 建立 usage_logs 表（使用紀錄）
CREATE TABLE IF NOT EXISTS public.usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL CHECK (feature IN ('summary', 'homework')),
  input_chars INTEGER NOT NULL DEFAULT 0,
  output_chars INTEGER NOT NULL DEFAULT 0,
  total_chars INTEGER NOT NULL DEFAULT 0,
  before_remaining INTEGER NOT NULL,
  after_remaining INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON public.usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON public.usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_logs_feature ON public.usage_logs(feature);

-- 註解說明
COMMENT ON TABLE public.usage_logs IS 'AI 功能使用紀錄表，記錄每次使用的詳細資訊';
COMMENT ON COLUMN public.usage_logs.user_id IS '使用者 ID（關聯 users.id）';
COMMENT ON COLUMN public.usage_logs.feature IS '功能類型：summary（摘要）或 homework（作業解題）';
COMMENT ON COLUMN public.usage_logs.input_chars IS '輸入文字字數';
COMMENT ON COLUMN public.usage_logs.output_chars IS '輸出文字字數';
COMMENT ON COLUMN public.usage_logs.total_chars IS '總使用字數（input + output）';
COMMENT ON COLUMN public.usage_logs.before_remaining IS '使用前剩餘點數';
COMMENT ON COLUMN public.usage_logs.after_remaining IS '使用後剩餘點數';

-- ==========================================
-- 第三步：設定 RLS（Row Level Security）
-- ==========================================

-- 啟用 RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- 刪除舊的政策（如果存在）
DROP POLICY IF EXISTS "Users can read own credits" ON public.user_credits;
DROP POLICY IF EXISTS "Users can update own credits" ON public.user_credits;
DROP POLICY IF EXISTS "Users can insert own credits" ON public.user_credits;
DROP POLICY IF EXISTS "Users can read own usage logs" ON public.usage_logs;

-- users 表：允許所有人讀取（用於登入驗證）
-- 注意：由於不使用 Supabase Auth，RLS 政策需要特別處理
-- 建議：使用 SERVICE_ROLE_KEY 進行所有操作，或暫時停用 RLS
CREATE POLICY "Allow all operations on users"
  ON public.users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- user_credits 表：允許所有人操作（由後端 API 控制權限）
CREATE POLICY "Allow all operations on user_credits"
  ON public.user_credits
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- usage_logs 表：允許所有人讀取（由後端 API 控制權限）
CREATE POLICY "Allow all operations on usage_logs"
  ON public.usage_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ==========================================
-- 第四步：驗證結果
-- ==========================================

-- 驗證表已建立
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    RAISE EXCEPTION 'users 表建立失敗';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_credits') THEN
    RAISE EXCEPTION 'user_credits 表建立失敗';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usage_logs') THEN
    RAISE EXCEPTION 'usage_logs 表建立失敗';
  END IF;
  
  RAISE NOTICE '✅ 資料表建立成功';
  RAISE NOTICE '✅ RLS 已啟用（使用開放政策，由後端 API 控制權限）';
  RAISE NOTICE '✅ 索引已建立';
END $$;

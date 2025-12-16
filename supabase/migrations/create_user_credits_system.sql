-- 點數制資料結構建立腳本（完整版）
-- 執行方式：在 Supabase Dashboard > SQL Editor 中執行此腳本
-- 
-- 說明：
-- 1. user_credits: 使用者點數帳戶（每個使用者只有一筆）
-- 2. usage_logs: 使用紀錄（記錄每次 AI 功能使用的詳細資訊）
-- 3. RLS: 設定行級別安全性，使用者只能存取自己的資料

-- ==========================================
-- 1. 建立 user_credits 表
-- ==========================================
CREATE TABLE IF NOT EXISTS public.user_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  remaining_chars INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 建立 updated_at 自動更新 trigger
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
COMMENT ON COLUMN public.user_credits.user_id IS '使用者 ID（關聯 auth.users）';
COMMENT ON COLUMN public.user_credits.remaining_chars IS '剩餘可用字數點數';
COMMENT ON COLUMN public.user_credits.updated_at IS '最後更新時間';

-- ==========================================
-- 2. 建立 usage_logs 表
-- ==========================================
CREATE TABLE IF NOT EXISTS public.usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
COMMENT ON COLUMN public.usage_logs.user_id IS '使用者 ID（關聯 auth.users）';
COMMENT ON COLUMN public.usage_logs.feature IS '功能類型：summary（摘要）或 homework（作業解題）';
COMMENT ON COLUMN public.usage_logs.input_chars IS '輸入文字字數';
COMMENT ON COLUMN public.usage_logs.output_chars IS '輸出文字字數';
COMMENT ON COLUMN public.usage_logs.total_chars IS '總使用字數（input + output）';
COMMENT ON COLUMN public.usage_logs.before_remaining IS '使用前剩餘點數';
COMMENT ON COLUMN public.usage_logs.after_remaining IS '使用後剩餘點數';

-- ==========================================
-- 3. 啟用 RLS (Row Level Security)
-- ==========================================

-- 啟用 RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- 刪除舊的政策（如果存在）
DROP POLICY IF EXISTS "Users can read own credits" ON public.user_credits;
DROP POLICY IF EXISTS "Users can write own credits" ON public.user_credits;
DROP POLICY IF EXISTS "Users can read own usage logs" ON public.usage_logs;

-- user_credits: 使用者只能讀寫自己的點數
CREATE POLICY "Users can read own credits"
  ON public.user_credits
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credits"
  ON public.user_credits
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own credits"
  ON public.user_credits
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- usage_logs: 使用者只能讀取自己的使用紀錄
CREATE POLICY "Users can read own usage logs"
  ON public.usage_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- 注意：usage_logs 的 INSERT 由後端服務（Edge Function）使用 SERVICE_ROLE_KEY 執行
-- 不透過 RLS，因此不需要建立 INSERT 政策

-- ==========================================
-- 4. 建立初始化使用者點數的函數（可選）
-- ==========================================
CREATE OR REPLACE FUNCTION public.init_user_credits_if_not_exists(
  p_user_id UUID,
  p_initial_chars INTEGER DEFAULT 10000
)
RETURNS INTEGER AS $$
DECLARE
  v_remaining INTEGER;
BEGIN
  -- 嘗試插入，如果已存在則不做任何事
  INSERT INTO public.user_credits (user_id, remaining_chars)
  VALUES (p_user_id, p_initial_chars)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- 取得剩餘點數
  SELECT remaining_chars INTO v_remaining
  FROM public.user_credits
  WHERE user_id = p_user_id;
  
  RETURN COALESCE(v_remaining, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.init_user_credits_if_not_exists IS '初始化使用者點數（如果不存在），並回傳剩餘點數';

-- ==========================================
-- 5. 驗證設定
-- ==========================================

-- 驗證表已建立
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_credits') THEN
    RAISE EXCEPTION 'user_credits 表建立失敗';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usage_logs') THEN
    RAISE EXCEPTION 'usage_logs 表建立失敗';
  END IF;
  
  RAISE NOTICE '✅ 資料表建立成功';
  RAISE NOTICE '✅ RLS 已啟用';
  RAISE NOTICE '✅ 索引已建立';
END $$;


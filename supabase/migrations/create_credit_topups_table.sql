-- 建立 credit_topups 表（加點紀錄）
-- 用於記錄使用者匯款回報，等待管理者審核並加點

CREATE TABLE IF NOT EXISTS public.credit_topups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_chars INTEGER NOT NULL CHECK (amount_chars > 0),
  amount_ntd INTEGER NOT NULL CHECK (amount_ntd > 0),
  account_last_five TEXT NOT NULL CHECK (LENGTH(account_last_five) = 5),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_credit_topups_user_id ON public.credit_topups(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_topups_status ON public.credit_topups(status);
CREATE INDEX IF NOT EXISTS idx_credit_topups_created_at ON public.credit_topups(created_at DESC);

-- 建立 updated_at 自動更新 trigger
CREATE OR REPLACE FUNCTION public.update_credit_topups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_credit_topups_updated_at
  BEFORE UPDATE ON public.credit_topups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_credit_topups_updated_at();

-- 註解說明
COMMENT ON TABLE public.credit_topups IS '加點紀錄表，記錄使用者匯款回報，等待管理者審核';
COMMENT ON COLUMN public.credit_topups.user_id IS '使用者 ID（關聯 auth.users）';
COMMENT ON COLUMN public.credit_topups.amount_chars IS '加點字數';
COMMENT ON COLUMN public.credit_topups.amount_ntd IS '匯款金額（新台幣）';
COMMENT ON COLUMN public.credit_topups.account_last_five IS '匯款帳號後五碼';
COMMENT ON COLUMN public.credit_topups.status IS '狀態：pending（待審核）、approved（已核准）、rejected（已拒絕）';
COMMENT ON COLUMN public.credit_topups.approved_by IS '核准者 ID（管理者）';
COMMENT ON COLUMN public.credit_topups.approved_at IS '核准時間';
COMMENT ON COLUMN public.credit_topups.note IS '備註（管理者可填寫）';

-- ==========================================
-- 啟用 RLS (Row Level Security)
-- ==========================================

ALTER TABLE public.credit_topups ENABLE ROW LEVEL SECURITY;

-- 刪除舊的政策（如果存在）
DROP POLICY IF EXISTS "Users can read own topups" ON public.credit_topups;
DROP POLICY IF EXISTS "Users can insert own topups" ON public.credit_topups;

-- 使用者只能讀取和新增自己的加點紀錄
CREATE POLICY "Users can read own topups"
  ON public.credit_topups
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own topups"
  ON public.credit_topups
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 注意：UPDATE（核准/拒絕）由 Edge Function 使用 SERVICE_ROLE_KEY 執行
-- 不透過 RLS，因此不需要建立 UPDATE 政策

-- ==========================================
-- 驗證設定
-- ==========================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'credit_topups') THEN
    RAISE EXCEPTION 'credit_topups 表建立失敗';
  END IF;
  
  RAISE NOTICE '✅ credit_topups 表建立成功';
  RAISE NOTICE '✅ RLS 已啟用';
  RAISE NOTICE '✅ 索引已建立';
END $$;



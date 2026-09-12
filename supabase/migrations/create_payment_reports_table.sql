-- 建立 payment_reports 表（匯款回報紀錄）
-- 用於記錄使用者匯款回報資訊，等待管理者審核並加點

CREATE TABLE IF NOT EXISTS public.payment_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  amount_ntd INTEGER NOT NULL CHECK (amount_ntd > 0),
  account_last_five TEXT NOT NULL CHECK (LENGTH(account_last_five) = 5),
  plan_id TEXT NOT NULL CHECK (plan_id IN ('99', '199')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'rejected')),
  processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_payment_reports_email ON public.payment_reports(email);
CREATE INDEX IF NOT EXISTS idx_payment_reports_status ON public.payment_reports(status);
CREATE INDEX IF NOT EXISTS idx_payment_reports_created_at ON public.payment_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_reports_plan_id ON public.payment_reports(plan_id);

-- 建立 updated_at 自動更新 trigger
CREATE OR REPLACE FUNCTION public.update_payment_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_payment_reports_updated_at
  BEFORE UPDATE ON public.payment_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_payment_reports_updated_at();

-- 註解說明
COMMENT ON TABLE public.payment_reports IS '匯款回報紀錄表，記錄使用者匯款回報資訊，等待管理者審核';
COMMENT ON COLUMN public.payment_reports.email IS '使用者 Email';
COMMENT ON COLUMN public.payment_reports.amount_ntd IS '匯款金額（新台幣）';
COMMENT ON COLUMN public.payment_reports.account_last_five IS '匯款帳號後五碼';
COMMENT ON COLUMN public.payment_reports.plan_id IS '購買方案（99 或 199）';
COMMENT ON COLUMN public.payment_reports.status IS '狀態：pending（待處理）、processed（已處理）、rejected（已拒絕）';
COMMENT ON COLUMN public.payment_reports.processed_by IS '處理者 ID（管理者）';
COMMENT ON COLUMN public.payment_reports.processed_at IS '處理時間';
COMMENT ON COLUMN public.payment_reports.note IS '備註（管理者可填寫）';

-- ==========================================
-- 啟用 RLS (Row Level Security)
-- ==========================================

ALTER TABLE public.payment_reports ENABLE ROW LEVEL SECURITY;

-- 刪除舊的政策（如果存在）
DROP POLICY IF EXISTS "Users can insert own payment reports" ON public.payment_reports;

-- 使用者可以新增自己的匯款回報
CREATE POLICY "Users can insert own payment reports"
  ON public.payment_reports
  FOR INSERT
  WITH CHECK (true); -- 允許任何人新增（因為可能未登入）

-- 注意：SELECT 和 UPDATE 由 Edge Function 或管理者使用 SERVICE_ROLE_KEY 執行
-- 不透過 RLS，因此不需要建立 SELECT/UPDATE 政策

-- ==========================================
-- 驗證設定
-- ==========================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payment_reports') THEN
    RAISE EXCEPTION 'payment_reports 表建立失敗';
  END IF;
  
  RAISE NOTICE '✅ payment_reports 表建立成功';
  RAISE NOTICE '✅ RLS 已啟用';
  RAISE NOTICE '✅ 索引已建立';
END $$;



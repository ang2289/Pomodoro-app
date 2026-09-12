-- 新增 processed 欄位到 payment_reports 表
-- 用於標記記錄是否已處理（布林值）

ALTER TABLE public.payment_reports
ADD COLUMN IF NOT EXISTS processed BOOLEAN NOT NULL DEFAULT false;

-- 根據現有的 status 欄位更新 processed 欄位
-- 如果 status = 'processed'，則 processed = true
-- 否則 processed = false
UPDATE public.payment_reports
SET processed = (status = 'processed')
WHERE processed IS NULL OR processed = false;

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_payment_reports_processed ON public.payment_reports(processed);

-- 註解說明
COMMENT ON COLUMN public.payment_reports.processed IS '是否已處理（布林值），true 表示已處理，false 表示未處理';



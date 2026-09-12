-- ============================================
-- 新增試用與付費額度欄位到 user_credits 表
-- ============================================
-- 此 migration 新增以下欄位：
--   - trial_total_chars: 試用總字數
--   - trial_used_chars: 試用已使用字數
--   - paid_total_chars: 付費總字數
--   - paid_used_chars: 付費已使用字數
-- ============================================

-- 新增 trial_total_chars 欄位
ALTER TABLE public.user_credits
ADD COLUMN IF NOT EXISTS trial_total_chars INTEGER NOT NULL DEFAULT 10000;

-- 新增 trial_used_chars 欄位
ALTER TABLE public.user_credits
ADD COLUMN IF NOT EXISTS trial_used_chars INTEGER NOT NULL DEFAULT 0;

-- 新增 paid_total_chars 欄位
ALTER TABLE public.user_credits
ADD COLUMN IF NOT EXISTS paid_total_chars INTEGER NOT NULL DEFAULT 0;

-- 新增 paid_used_chars 欄位
ALTER TABLE public.user_credits
ADD COLUMN IF NOT EXISTS paid_used_chars INTEGER NOT NULL DEFAULT 0;

-- 為現有記錄設置預設值（如果為 NULL）
UPDATE public.user_credits
SET 
  trial_total_chars = COALESCE(trial_total_chars, 10000),
  trial_used_chars = COALESCE(trial_used_chars, 0),
  paid_total_chars = COALESCE(paid_total_chars, 0),
  paid_used_chars = COALESCE(paid_used_chars, 0)
WHERE 
  trial_total_chars IS NULL 
  OR trial_used_chars IS NULL 
  OR paid_total_chars IS NULL 
  OR paid_used_chars IS NULL;

-- 新增註解
COMMENT ON COLUMN public.user_credits.trial_total_chars IS '試用總字數（預設 10000）';
COMMENT ON COLUMN public.user_credits.trial_used_chars IS '試用已使用字數';
COMMENT ON COLUMN public.user_credits.paid_total_chars IS '付費總字數';
COMMENT ON COLUMN public.user_credits.paid_used_chars IS '付費已使用字數';

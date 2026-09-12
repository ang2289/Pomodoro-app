-- 添加 trial_expires_at 欄位到 user_credits 表
-- 解決前端 select trial_expires_at 時出現 406 Not Acceptable 錯誤

ALTER TABLE public.user_credits
ADD COLUMN IF NOT EXISTS trial_expires_at TIMESTAMPTZ;

-- 為現有記錄設置預設值（7天後到期）
UPDATE public.user_credits
SET trial_expires_at = NOW() + INTERVAL '7 days'
WHERE trial_expires_at IS NULL;



-- 新增 total_credits 欄位到 user_credits 表
-- 用於記錄使用者累計獲得的總點數（包括免費試用和付費加點）

-- 新增 total_credits 欄位
ALTER TABLE public.user_credits
ADD COLUMN IF NOT EXISTS total_credits INTEGER NOT NULL DEFAULT 10000;

-- 更新現有記錄：將 total_credits 設為 remaining_chars（如果 remaining_chars > 10000，表示有付費加點）
-- 否則設為 10000（免費試用）
UPDATE public.user_credits
SET total_credits = CASE 
  WHEN remaining_chars > 10000 THEN remaining_chars
  ELSE 10000
END
WHERE total_credits = 10000; -- 只更新預設值，避免覆蓋已有值

-- 新增註解
COMMENT ON COLUMN public.user_credits.total_credits IS '使用者累計獲得的總點數（包括免費試用 10000 和所有付費加點）';



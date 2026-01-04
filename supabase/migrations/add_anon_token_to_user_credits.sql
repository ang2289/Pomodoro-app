-- 新增 anon_token 欄位到 user_credits 表
-- 用於匿名使用者的點數管理

-- 新增 anon_token 欄位（允許 NULL，因為已登入使用者可能沒有）
ALTER TABLE public.user_credits
ADD COLUMN IF NOT EXISTS anon_token TEXT;

-- 為現有記錄設定 anon_token（如果 user_id 是 UUID 格式的字串，則視為匿名使用者）
-- 注意：這裡假設匿名使用者的 user_id 就是 anon_token（UUID 字串）
-- 如果 user_id 是 UUID 格式，則將 user_id 複製到 anon_token
UPDATE public.user_credits
SET anon_token = user_id::TEXT
WHERE anon_token IS NULL
  AND user_id IS NOT NULL;

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_user_credits_anon_token ON public.user_credits(anon_token);

-- 註解說明
COMMENT ON COLUMN public.user_credits.anon_token IS '匿名使用者 token（用於匿名使用者的點數管理）';

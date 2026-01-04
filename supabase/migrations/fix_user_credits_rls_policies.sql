-- 修正 user_credits 表的 RLS 政策
-- 確保使用者可以讀取和更新自己的點數資料

-- 啟用 RLS（如果尚未啟用）
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- 刪除舊的 SELECT 政策（如果存在）
DROP POLICY IF EXISTS "Users can read own credits" ON public.user_credits;

-- 建立新的 SELECT 政策：使用者只能讀取自己的點數
CREATE POLICY "Users can read own credits"
ON public.user_credits
FOR SELECT
USING (auth.uid() = user_id);

-- 刪除舊的 UPDATE 政策（如果存在）
DROP POLICY IF EXISTS "Users can update own credits" ON public.user_credits;

-- 建立新的 UPDATE 政策：使用者只能更新自己的點數
CREATE POLICY "Users can update own credits"
ON public.user_credits
FOR UPDATE
USING (auth.uid() = user_id);


